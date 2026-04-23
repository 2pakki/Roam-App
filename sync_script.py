import requests
import instaloader
import google.generativeai as genai
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timedelta, timezone
import json
import os
import time
import schedule
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configuration for Image Storage
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_IMAGE_DIR = os.path.join(SCRIPT_DIR, "public", "event-images")

# Ensure the directory exists
os.makedirs(PUBLIC_IMAGE_DIR, exist_ok=True)

# ==========================================
# 1. CONFIGURATION & SETUP
# ==========================================

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

# Initialize Firebase
try:
    proj_id = "roam-app-f1080" # Default prefix
    db_id = "(default)"

    if os.path.exists('firebase-applet-config.json'):
        with open('firebase-applet-config.json', 'r') as f:
            fb_config = json.load(f)
            proj_id = fb_config.get('projectId', proj_id)
            db_id = fb_config.get('firestoreDatabaseId', db_id)

    if os.path.exists("serviceAccountKey.json"):
        cred = credentials.Certificate("serviceAccountKey.json")
        firebase_admin.initialize_app(cred, {'projectId': proj_id})
    else:
        firebase_admin.initialize_app(options={'projectId': proj_id})
    
    db = firestore.client(database_id=db_id)
    print(f"Connected to Firebase: {proj_id}/{db_id}")
except Exception as e:
    print(f"Firebase initialization failed: {e}")
    exit(1)

TARGET_PAGES = [
    "whatsaroundthiruvananthapuram",
    "thingstodotrivandrum",
    "whats_happening_in_tvm"
]

MOCK_MODE = False
CURRENT_DATE = datetime.now()
CUTOFF_DATE = CURRENT_DATE - timedelta(days=14)

# ==========================================
# 2. HELPER FUNCTIONS
# ==========================================

import re

def slugify(text):
    text = text.lower()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '-', text).strip('-')
    return text

def generate_event_id(event_name, date_str):
    date_part = date_str.split('T')[0].replace('-', '')
    return f"{slugify(event_name)}-{date_part}"

def download_image(url, filename):
    """Downloads image to public folder."""
    try:
        path = os.path.join(PUBLIC_IMAGE_DIR, filename)
        if os.path.exists(path):
            return f"/event-images/{filename}"
            
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Referer': 'https://www.instagram.com/'
        }
        response = requests.get(url, stream=True, timeout=15, headers=headers)
        if response.status_code == 200:
            with open(path, 'wb') as f:
                for chunk in response.iter_content(1024):
                    f.write(chunk)
            return f"/event-images/{filename}"
    except Exception as e:
        print(f"Error downloading image: {e}")
    return None

def parse_with_gemini(caption, post_url, image_url):
    if MOCK_MODE:
        return {
            "eventName": "Mock Event",
            "description": "Mock description",
            "location": "Trivandrum",
            "date": (datetime.now() + timedelta(days=1)).isoformat(),
            "eventVector": {"Music": 0.5, "Food": 0.5, "Art": 0.5, "Tech": 0.5, "Outdoor": 0.5, "Nightlife": 0.5, "Luxury": 0.5},
            "id": post_url.split("/")[-2],
            "imageUrl": image_url,
            "source": post_url,
            "cachedAt": datetime.now().isoformat()
        }

    if not GEMINI_API_KEY:
        return {}
        
    prompt = f"""
    Analyze this Instagram caption for a discrete local event in Trivandrum.
    Current Date: {CURRENT_DATE.strftime('%Y-%m-%d')}
    
    If it IS a unique event (concert, workshop, food fest), return ONLY a JSON object:
    - "eventName": Name of event
    - "description": Summary (max 200 chars)
    - "location": Venue in Trivandrum
    - "date": ISO 8601 (e.g. 2026-04-10T18:00:00)
    - "eventVector": {{Music, Food, Art, Tech, Outdoor, Nightlife, Luxury}} (0.0-1.0)
    
    Caption: {caption}
    """
    
    models = ['gemini-2.0-flash', 'gemini-1.5-flash-latest']
    for model_name in models:
        try:
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(prompt, generation_config={"response_mime_type": "application/json"})
            data = json.loads(response.text)
            if data:
                data["id"] = post_url.split("/")[-2]
                data["imageUrl"] = image_url
                data["source"] = post_url
                data["cachedAt"] = datetime.now().isoformat()
                return data
        except:
            continue
    return {}

# ==========================================
# 3. MAIN LOOP
# ==========================================

def scrape_and_sync():
    L = instaloader.Instaloader()
    processed_shortcodes = set()
    try:
        docs = db.collection('cached_events').stream()
        processed_shortcodes = {doc.to_dict().get('shortcode') for doc in docs if doc.to_dict().get('shortcode')}
    except:
        pass

    ig_user = os.environ.get("IG_USERNAME")
    ig_pass = os.environ.get("IG_PASSWORD")
    if ig_user and ig_pass:
        try:
            L.load_session_from_file(ig_user)
        except:
            try:
                L.login(ig_user, ig_pass)
                L.save_session_to_file()
            except:
                pass

    for page in TARGET_PAGES:
        print(f"Checking @{page}...")
        try:
            profile = instaloader.Profile.from_username(L.context, page)
            for post in profile.get_posts():
                if post.date < CUTOFF_DATE: break
                if post.shortcode in processed_shortcodes: continue

                event_data = parse_with_gemini(post.caption, f"https://www.instagram.com/p/{post.shortcode}/", post.url)
                if event_data and 'date' in event_data:
                    event_id = generate_event_id(event_data['eventName'], event_data['date'])
                    local_path = download_image(post.url, f"{event_id}.jpg")
                    
                    event_data.update({
                        "id": event_id,
                        "shortcode": post.shortcode,
                        "imageUrl": local_path or post.url,
                        "instagramHandle": page
                    })
                    db.collection('cached_events').document(event_id).set(event_data, merge=True)
                    print(f"Synced: {event_data['eventName']}")
                
                time.sleep(10)
        except Exception as e:
            print(f"Error scraping @{page}: {e}")
            time.sleep(60)

if __name__ == "__main__":
    scrape_and_sync()
    schedule.every(12).hours.do(scrape_and_sync)
    while True:
        schedule.run_pending()
        time.sleep(60)
