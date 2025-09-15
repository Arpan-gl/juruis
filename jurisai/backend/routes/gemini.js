import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI('AIzaSyBADA4B7gfQPWheKtDvVdYEIlUgXATgd4E');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

router.post('/chat', async (req, res) => {
  const { query, context, history } = req.body;
  
  if (!query) return res.status(400).json({ reply: 'Query is missing.' });
  
  try {
    // Build a prompt that includes the context and conversation history
    let fullPrompt = '';
    
    // Add the context information at the beginning
    if (context) {
      fullPrompt += `CONTRACT CONTEXT:\n${context}\n\n`;
    }
    
    // Add conversation history
    if (history && history.length > 0) {
      fullPrompt += "CONVERSATION HISTORY:\n";
      history.forEach((msg, index) => {
        fullPrompt += `User: ${msg.user}\nAssistant: ${msg.bot}\n`;
      });
    }
    
    // Add the current query
    fullPrompt += `\nCurrent question: ${query}\n`;
    fullPrompt += "Please provide a helpful response about the contract:";
    
    // Generate response
    const result = await model.generateContent(fullPrompt);
    const text = result.response.text();
    
    res.json({ reply: text });
  } catch (error) {
    console.error('Gemini API error:', error);
    res.status(500).json({ reply: 'Error communicating with Gemini API.' });
  }
});

export default router;