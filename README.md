# Roam: Trivandrum's AI-Powered Event Discovery App 

Roam is a premium, AI-driven platform designed to help you discover the heartbeat of Thiruvananthapuram. It combines real-time Instagram scraping with state-of-the-art AI parsing to curate and categorize the best events, festivals, workshops, and hidden gems in the city.

![Roam Hero Banner](https://images.unsplash.com/photo-1596701062351-be1ef9a37c52?q=80&w=2070&auto=format&fit=crop)

## Key Features

- **Automated Event Scraping**: Scrapes data from leading Trivandrum-centric Instagram pages.
- **AI-Powered Curation**: Uses Google Gemini (1.5 Flash/Pro) to intelligently parse captions into concrete event data.
- **Personalized Recommendations**: A smart AI Assistant that learns your "vibe" and suggests events based on your personality profile.
- **Categorized Discovery**: Events are automatically sorted by time (Today, Tomorrow, This Week, etc.) and interests (Music, Food, Art, Tech).
- **Admin Dashboard**: Real-time system diagnostics, manual search triggers, and "Presentation Safe Mode" for demonstrations.
- **Cross-Platform Storage**: Powered by Firebase Firestore for real-time data synchronization.

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS + Framer Motion
- **Backend**: Express (for proxying and server-side logic)
- **AI Engine**: Google Gemini SDK (@google/genai)
- **Data & Auth**: Firebase Firestore
- **Scraper**: Python 3 + Instaloader

## Installation

### 1. Clone & Setup Node Environment
```bash
git clone https://github.com/yourusername/roam-app.git
cd roam-app
npm install
```

### 2. Setup Python Scraper
```bash
# It is recommended to use a virtual environment
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
```

### 3. Environment Variables
Create a `.env` file in the root:
```env
# Gemini API Key (Required)
GEMINI_API_KEY="your_api_key_here"

# Firebase Config (Optional - will fallback to local if not provided)
# Note: Ensure serviceAccountKey.json is in the root for the Python scraper.
```

##  Usage

### Start the Web Server
```bash
npm run dev
```
Access the dashboard at `http://localhost:3000`.

### Run the Event Scraper
```bash
python sync_script.py
```
This fetches the latest posts from Instagram and populates your Firebase database with AI-parsed events.

##  Presentation Mode

Roam includes a special **"Presentation Safe Mode"** to ensure your demos never fail due to API quotas:
1. Navigate to **Profile -> Admin Mode**.
2. Toggle **Presentation Safety Mode** in the dashboard.
3. This will route AI requests to a local mock engine while keeping the UI fully interactive.

---

Built with ❤️ for the community of Thiruvananthapuram.
