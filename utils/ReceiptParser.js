import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const CATEGORIES = {
  EXPENSE: [
    'Food & Dining',
    'Transportation',
    'Shopping',
    'Entertainment',
    'Bills & Utilities',
    'Health & Fitness',
    'Travel',
    'Other'
  ],
  INCOME: [
    'Salary',
    'Business',
    'Investments',
    'Freelance',
    'Gift',
    'Other'
  ],
  TRANSFER: [
    'Account Transfer',
    'Investment Transfer',
    'Debt Payment',
    'Other'
  ]
};

const ACCOUNTS = [
  'Cash',
  'Bank Account',
  'Credit Card',
  'Savings',
  'Investment'
];

class ReceiptParser {
  constructor() {
    this.genAI = new GoogleGenerativeAI('AIzaSyCPlYnHAObrw189uVA_VRQiTUSeSw46M-k');
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async parseReceipt(base64Image) {
    try {
      const extractedText = await this.performOCR(base64Image);

      const enrichedData = await this.analyzeWithGemini(extractedText);

      return enrichedData;
    } catch (error) {
      console.error('Error in parseReceipt:', error);
      throw error;
    }
  }

  async performOCR(base64Image) {
    try {
      const apiKey = 'K82750295688957';
      const formData = new FormData();
      formData.append('apikey', apiKey);
      formData.append('base64Image', `data:image/jpeg;base64,${base64Image}`);
      formData.append('language', 'eng');
      formData.append('detectOrientation', 'true');
      formData.append('scale', 'true');
      formData.append('OCREngine', '2');

      const response = await axios.post(
        'https://api.ocr.space/parse/image',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'apikey': apiKey
          }
        }
      );

      if (response.data.IsErroredOnProcessing) {
        throw new Error(response.data.ErrorMessage || "OCR processing failed");
      }

      return response.data.ParsedResults[0].ParsedText;
    } catch (error) {
      console.error('OCR Error:', error);
      throw error;
    }
  }

  async analyzeWithGemini(text) {
    const prompt = `
      Analyze this receipt text and extract:
      1. Total amount (just the number)
      2. Most appropriate category from this list: ${CATEGORIES.EXPENSE.join(', ')}
      3. Most likely payment method from this list: ${ACCOUNTS.join(', ')}
      4. Store/merchant name
      5. Date of purchase
      6. List of main items purchased (up to 3 items)
      
      Receipt text:
      ${text}

      Return ONLY in this exact format:
      AMOUNT:number
      CATEGORY:category
      ACCOUNT:account
      MERCHANT:name
      DATE:date
      ITEMS:item1, item2, item3
      
      If you can't determine any field, use these defaults:
      - Category: Other
      - Account: Cash
      - Merchant: Unknown
      - Date: current date
      - Items: Unknown items
    `;

    try {
      const result = await this.model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
      });
      
      const response = result.response.candidates[0].content.parts[0].text;
      return this.parseGeminiResponse(response, text);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  parseGeminiResponse(response, originalText) {
    const lines = response.split('\n');
    const details = {
      amount: 0,
      category: 'Other',
      account: 'Cash',
      merchant: 'Unknown',
      date: new Date().toISOString(),
      items: [],
      notes: ''
    };

    for (const line of lines) {
      const [key, value] = line.split(':');
      if (!value) continue;

      switch (key.trim().toUpperCase()) {
        case 'AMOUNT':
          details.amount = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
          break;
        case 'CATEGORY':
          if (CATEGORIES.EXPENSE.includes(value.trim())) {
            details.category = value.trim();
          }
          break;
        case 'ACCOUNT':
          if (ACCOUNTS.includes(value.trim())) {
            details.account = value.trim();
          }
          break;
        case 'MERCHANT':
          details.merchant = value.trim();
          break;
        case 'DATE':
          const parsedDate = new Date(value.trim());
          if (!isNaN(parsedDate.getTime())) {
            details.date = parsedDate.toISOString();
          }
          break;
        case 'ITEMS':
          details.items = value.split(',').map(item => item.trim());
          break;
      }
    }

    // Create a detailed summary note
    const notesParts = [];
    
    // Add merchant info
    if (details.merchant !== 'Unknown') {
      notesParts.push(`📍 ${details.merchant}`);
    }

    // Add items if available
    if (details.items && details.items.length > 0 && details.items[0] !== 'Unknown items') {
      notesParts.push(`🛍️ ${details.items.join(', ')}`);
    }

    // Add payment method if not cash
    if (details.account !== 'Cash') {
      notesParts.push(`💳 Paid via ${details.account}`);
    }

    // Combine all parts with line breaks
    details.notes = notesParts.join('\n');

    return details;
  }
}

export default ReceiptParser;