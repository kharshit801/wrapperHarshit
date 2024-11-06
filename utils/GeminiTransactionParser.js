import { GoogleGenerativeAI } from '@google/generative-ai';
import { CATEGORIES, ACCOUNTS } from '../constants';

const GEMINI_API_KEY = 'AIzaSyCPlYnHAObrw189uVA_VRQiTUSeSw46M-k';

class GeminiTransactionParser {
  constructor() {
    this.genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async parseReceipt(text) {
    const prompt = `
      Analyze the following receipt text and extract the following details:
      - Amount
      - Category (from the list: ${CATEGORIES.EXPENSE.join(', ')})
      - Account (from the list: ${ACCOUNTS.join(', ')})
      - Any additional notes

      Receipt text:
      ${text}
    `;

    try {
      const result = await this.model.generateContent({
        contents: [{ parts: [{ text: prompt }] }],
      });
      const response = result.response.candidates[0].content.parts[0].text;
      return this.parseGeminiResponse(response);
    } catch (error) {
      console.error('Error with Gemini API:', error);
      throw error;
    }
  }

  parseGeminiResponse(response) {
    const lines = response.split('\n');
    const details = {};

    for (const line of lines) {
      if (line.startsWith('Amount:')) {
        details.amount = parseFloat(line.split(':')[1].trim());
      } else if (line.startsWith('Category:')) {
        details.category = line.split(':')[1].trim();
      } else if (line.startsWith('Account:')) {
        details.account = line.split(':')[1].trim();
      } else if (line.startsWith('Notes:')) {
        details.notes = line.split(':')[1].trim();
      }
    }

    return details;
  }
}

export default GeminiTransactionParser;