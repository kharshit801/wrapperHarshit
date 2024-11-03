const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = "AIzaSyCPlYnHAObrw189uVA_VRQiTUSeSw46M-k";
if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model:'gemini-1.5-flash' });

const formatWithLineBreaks = (text) => {
    return text.replace(/•/g, '•\n');
};

const getInitialAnalysis = async (summary, transactions) => {
    const analysisPrompt = `As a financial advisor for Indian college students, analyze this financial data and provide a brief initial assessment. Use pointers and emojis to make it easy to read:

Summary: ${JSON.stringify(summary)}
Transactions: ${JSON.stringify(transactions)}

Provide a concise analysis covering:
1. Overall spending patterns 💸
2. Key areas of concern ⚠️
3. Positive financial habits 🌟
4. One specific actionable suggestion 💡

Keep it friendly and focused on the student context.`;

    try {
        const result = await model.generateContent({
            contents: [{ parts: [{ text: analysisPrompt }] }]
        });
        const formattedResponse = formatWithLineBreaks(result.response.candidates[0].content.parts[0].text);
        return formattedResponse;
    } catch (error) {
        console.error('Error with Gemini API:', error);
        return 'I apologize, but I encountered an error analyzing your financial data. Feel free to ask me specific questions about your finances.';
    }
};

const chatWithAI = async (message, summary, transactions) => {
    const contextPrompt = `You are a financial advisor for Indian college students. Here is the current financial context. Respond using pointers and emojis for clarity:

Summary: ${JSON.stringify(summary)}
Transactions: ${JSON.stringify(transactions)}

Consider these student-specific factors when giving advice:
1. Monthly budget constraints with limited pocket money/part-time income
2. Common expenses: food/canteen, transport, study materials, entertainment
3. Peer pressure spending
4. Education-related costs
5. Basic savings goals

User message: ${message}

Provide specific, actionable advice in bullet points, with emojis where possible, that's relevant to Indian college students.`;

    try {
        const result = await model.generateContent({
            contents: [{ parts: [{ text: contextPrompt }] }]
        });
        const formattedResponse = formatWithLineBreaks(result.response.candidates[0].content.parts[0].text);
        return formattedResponse;
    } catch (error) {
        console.error('Error with Gemini API:', error);
        return 'Sorry, I encountered an error. Please try again.';
    }
};

module.exports = { chatWithAI, getInitialAnalysis };
