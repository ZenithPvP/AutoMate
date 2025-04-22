const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const prompt = req.body.inputs;
  console.log("Received prompt:", prompt);

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  try {
    console.log("Making request to OpenAI...");
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an automotive diagnostic assistant. Give the top 3 most likely causes and solutions. Be concise and use bullet points.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log("Received OpenAI response:", response.data);
    const output = response.data.choices[0].message.content;
    res.json({ message: output });

  } catch (err) {
    console.error('Error hitting OpenAI API:', err.response?.data || err.message);
    res.status(500).json({ error: 'Error hitting OpenAI API' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
