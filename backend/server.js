const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.1.17:3000'],
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Update error handling to provide more detailed feedback
app.post('/api/chat', async (req, res) => {
  const prompt = req.body.inputs;
  console.log("Received prompt:", prompt);

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Verify API key is present
  if (!process.env.OPENAI_API_KEY) {
    console.error('OpenAI API key is missing');
    return res.status(500).json({ error: 'OpenAI API key is not configured' });
  }

  try {
    console.log("Making request to OpenAI...");
    console.log("Request payload:", {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an automotive diagnostic assistant. Give the top 3 most likely causes and solutions. Be concise and use bullet points.' },
        { role: 'user', content: prompt }
      ]
    });

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an automotive diagnostic assistant. Give the top 3 most likely causes and solutions. Be concise and use bullet points.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      }
    );

    console.log("Received OpenAI response:", response.data);
    const output = response.data.choices[0].message.content;
    res.json({ message: output });

  } catch (err) {
    console.error('Full error object:', err);
    
    if (err.code === 'ECONNREFUSED') {
      return res.status(500).json({ error: 'Could not connect to OpenAI API. Please check your internet connection.' });
    }
    
    if (err.response?.status === 401) {
      return res.status(500).json({ error: 'Invalid OpenAI API key. Please check your configuration.' });
    }

    if (err.response?.status === 429) {
      return res.status(500).json({ error: 'Rate limit exceeded. Please try again later.' });
    }

    const errorMessage = err.response?.data?.error?.message || err.message || 'Unknown error occurred';
    res.status(500).json({ error: `Error: ${errorMessage}` });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('CORS enabled for:', ['http://localhost:3000', 'http://192.168.1.17:3000']);
});
