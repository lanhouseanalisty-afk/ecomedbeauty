const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://ollama:11434';
const MODEL_NAME = process.env.MODEL_NAME || 'llama3.1:8b';

console.log(`AI Gateway starting...`);
console.log(`Ollama URL: ${OLLAMA_URL}`);
console.log(`Model: ${MODEL_NAME}`);

// Proxy endpoint for Chat Completions (OpenAI Compatible)
app.post('/v1/chat/completions', async (req, res) => {
    try {
        const { messages, model } = req.body;

        // Use the environment model if not specified or override
        const targetModel = model || MODEL_NAME;

        console.log(`Proxying chat request for model: ${targetModel}`);

        const response = await axios.post(`${OLLAMA_URL}/v1/chat/completions`, {
            model: targetModel,
            messages: messages,
            stream: false // For simplicity, non-streaming first
        });

        res.json(response.data);

    } catch (error) {
        console.error('Error proxying to Ollama:', error.message);
        if (error.response) {
            console.error('Ollama Response:', error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            res.status(500).json({ error: 'Failed to connect to AI Provider' });
        }
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', model: MODEL_NAME });
});

const PORT = 8787;
app.listen(PORT, () => {
    console.log(`AI Gateway running on port ${PORT}`);
});
