import express from 'express';
 import { GoogleGenerativeAI } from '@google/generative-ai';
 
 const router = express.Router();
 
 const genAI = new GoogleGenerativeAI('AIzaSyBADA4B7gfQPWheKtDvVdYEIlUgXATgd4E');
 const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
 
 router.post('/gem', async (req, res) => {
   const { query } = req.body;
   if (!query) return res.status(400).json({ reply: 'Query is missing.' });
 
   try {
     const result = await model.generateContent(query);
     const text = result.response.text();
     res.json({ reply: text });
   } catch (error) {
     console.error('Gemini API error:', error);
     res.status(500).json({ reply: 'Error communicating with Gemini API.' });
   }
 });
 
 export default router;