import dotenv from 'dotenv';
dotenv.config({ override: true });
import { GoogleGenAI } from '@google/genai';

async function test() {
  try {
    const apiKey = process.env.GEMINI_API_KEY || '';
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey === 'YOUR_GEMINI_API_KEY') {
      console.error('GEMINI_API_KEY is missing or a placeholder.');
      return;
    }
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: 'Test prompt',
    });
    console.log('Success:', response.text);
  } catch (e) {
    console.error('Error:', e);
  }
}
test();
