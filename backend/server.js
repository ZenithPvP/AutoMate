// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

console.log('Hugging Face API Key:', process.env.REACT_API_HUGGING_FACE_API_KEY);

const app = express();
const PORT = 5000;


// Middleware
app.use(cors({ origin: '*' })); // Add this line to allow all origins
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  
  console.log("Received request with prompt:", req.body.inputs);
  const prompt = req.body.inputs;
  console.log("Sending request to Hugging Face with prompt:", prompt);

  

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  

  try {
    // Making the POST request to Hugging Face API
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta',
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.REACT_API_HUGGING_FACE_API_KEY}`, 
        },
      }
    );

    console.log("Hugging Face Response:", response.data);

    // Sending response back to client
    res.json({ message: response.data[0]?.generated_text || 'Sorry, no response from Hugging Face.' });
  } catch (err) {
    console.error('Error hitting Hugging Face:', err);
    res.status(500).json({ error: 'Error hitting Hugging Face' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
