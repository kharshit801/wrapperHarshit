import express from 'express';
import dotenv from 'dotenv';
import { GenerativeAI } from '@google-cloud/ai';
import { Logging } from '@google-cloud/logging';

dotenv.config();

const app = express();
app.use(express.json());

const logging = new Logging();
const genaiClient = new GenerativeAI({ apiKey: process.env.API_KEY });
const modelName = "gemini-1.5-flash";

app.get('/', (req, res) => {
    res.json({ message: "Welcome to the Chatbot App!" });
});

app.post('/chat', async (req, res) => {
    logging.info("Received chat request");

    const userInput = req.body.input || '';

    if (!userInput) {
        return res.status(400).json({ error: "No input provided" });
    }

    try {
        const [botResponse] = await genaiClient.generateText({ model: modelName, prompt: userInput });
        res.json({ response: botResponse });
    } catch (error) {
        logging.error(`Error generating response: ${error.message}`);
        res.status(500).json({ error: "Error generating response" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
