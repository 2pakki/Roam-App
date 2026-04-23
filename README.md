# Local Setup & Presentation Guide for Roam

This guide explains how to run the Roam application locally and how to use the "Presentation Mode" to ensure your demo works even if API limits are reached.

## 1. Prerequisites

### Backend & Scraper (Python)
- Install Python 3.9+ 
- Install dependencies:
  ```bash
  pip install -r requirements.txt
  ```

### Frontend (Node.js)
- Install Node.js 18+
- Install dependencies:
  ```bash
  npm install
  ```

---

## 2. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# API Keys (Get these from Google AI Studio and SerpApi)
GEMINI_API_KEY="your_gemini_key"
SERPAPI_API_KEY="your_serp_key"

# Database Configuration
# 1. Go to Firebase Console > Project Settings > Service Accounts
# 2. Click "Generate New Private Key"
# 3. Rename the downloaded file to 'serviceAccountKey.json' and place it in the root folder.

# Instagram (Optional)
IG_USERNAME="your_username"
IG_PASSWORD="your_password"
```

---

## 3. Running the Application Locally

### Step 1: Start the Web Server
In your terminal, run:
```bash
npm run dev
```
This starts the Express backend and the Vite frontend. Open `http://localhost:3000` in your browser.

### Step 2: Run the Event Sync Scraper
In a separate terminal, run:
```bash
python sync_script.py
```
*Note: Make sure your `serviceAccountKey.json` is in the folder so it can upload events to Firestore.*

---

## 4. Presentation / "No-Gemini" Mode 🚀

To prevent hitting the 20-request daily limit during your presentation tomorrow, I have added two safety toggles:

### A. Python Scraper Mocking
If you want to test the scraping flow without using your Gemini quota:
1. Open `sync_script.py`.
2. Change `MOCK_MODE = False` to `MOCK_MODE = True` at the top.
3. The script will now generate "fake" event data from Instagram posts instead of calling the AI.

### B. Frontend Assistant Mocking
I have added a **"Safe Presentation Mode"** toggle in the **Admin Dashboard** (Profile -> Settings icon -> Admin).
- When enabled, the **AI Assistant** will use a local rules-based engine to recommend events from your database without calling the Gemini API.
- This ensures the chat always works during your demo!

### C. Live Search Mocking
In the Admin Dashboard, the "Trigger Live Sync" button has a **Mock Results** toggle. This allows you to show the sync animation and database update flow using pre-defined sample data instead of performing a real Google Search.

---

## 5. Troubleshooting
- **Firebase Permission Error**: Ensure your `serviceAccountKey.json` matches the project ID in `firebase-applet-config.json`.
- **Port 3000 busy**: Ensure no other process is running on port 3000.
- **Images not loading**: Verify images are being saved to `public/event-images/`.
