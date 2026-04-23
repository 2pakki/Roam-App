import dotenv from 'dotenv';
dotenv.config({ override: true });
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { GoogleGenAI, Type, Tool } from '@google/genai';
import { adminDb } from './server-firebase.js';
import firebaseConfig from './firebase-applet-config.json' assert { type: 'json' };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

function getAI() {
  let apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  
  // Check for common typo GEMIN_API_KEY
  if (!apiKey) {
    apiKey = (process.env as any).GEMIN_API_KEY || (process.env as any).VITE_GEMIN_API_KEY;
  }

  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey === "MY_GEMINI_API_KEY" || apiKey === "YOUR_GEMINI_API_KEY") {
    console.error("GEMINI_API_KEY is missing or invalid. AI features will be disabled.");
    return null;
  }
  
  // Strip quotes if the user accidentally included them
  apiKey = apiKey.replace(/^["']|["']$/g, '').trim();
  
  return new GoogleGenAI({ apiKey });
}

app.get('/api/live-events', async (req, res) => {
  console.log('GET /api/live-events called');
  try {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Fetch cached events from Firestore
    console.log(`Fetching from database: ${firebaseConfig.firestoreDatabaseId}, project: ${firebaseConfig.projectId}`);
    const cachedEventsSnap = await adminDb.collection('cached_events')
      .where('date', '>=', todayStr)
      .get();
      
    const cachedEvents: any[] = [];
    cachedEventsSnap.forEach(doc => {
      cachedEvents.push(doc.data());
    });
    
    // Return only cached events from Firestore
    res.json(cachedEvents);
  } catch (error) {
    console.error('Error fetching cached events:', error);
    res.json([]); // Return empty array on error instead of static events
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
