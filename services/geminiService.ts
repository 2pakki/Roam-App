import { GoogleGenAI, Type } from "@google/genai";
import { Coordinates, UserPreferences, Message, Role, PlaceCardData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = "gemini-3-flash-preview";

// Hardcoded Trivandrum Center for context
export const TRIVANDRUM_COORDS: Coordinates = { latitude: 8.5241, longitude: 76.9366 };

export const getNearbyPlaces = async (
  location: Coordinates,
  preferences: UserPreferences,
  locationName: string = "Trivandrum"
): Promise<PlaceCardData[]> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `
        FIND REAL LIVE EVENTS in Trivandrum (Thiruvananthapuram), Kerala for TODAY, THIS WEEK, and THIS WEEKEND.
        
        SOURCES TO SEARCH:
        - BookMyShow Trivandrum
        - Insider.in / Paytm Insider Trivandrum
        - Instagram: @whatshappeningaroundtrivandrum, @trivandrumlife
        - Local News: The Hindu (Trivandrum Edition), New Indian Express
        
        FILTER BY USER PREFERENCES:
        Group: ${preferences.group}
        Budget: ${preferences.budget}
        Interests: ${preferences.activityType || 'Festivals, Music, Arts, Food, Workshops'}
        
        IMPORTANT: For each event, provide 3-4 HIGHLY SPECIFIC visual keywords for a search engine to find a matching photo. 
        Example: Instead of "food", use "kerala beef fry parotta restaurant". Instead of "concert", use "outdoor music stage blue neon lighting".
      `,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            events: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "Official name of the event" },
                  type: { type: Type.STRING, description: "Category: e.g., Concert, Workshop, Food Fest" },
                  rating: { type: Type.STRING, description: "Rating or 'Verified'" },
                  snippet: { type: Type.STRING, description: "Detailed description including time and price" },
                  location: { type: Type.STRING, description: "Venue name and area in Trivandrum" },
                  timing: { type: Type.STRING, description: "Must be one of: NOW, WEEK, WEEKEND" },
                  latitude: { type: Type.NUMBER },
                  longitude: { type: Type.NUMBER },
                  sourceName: { type: Type.STRING, description: "Platform name (e.g. BookMyShow)" },
                  sourceLink: { type: Type.STRING, description: "Direct URL to event" },
                  imageKeywords: { type: Type.STRING, description: "3-4 highly specific visual keywords for photo search" },
                  accentColor: { type: Type.STRING, description: "A hex code for the event vibe: e.g. '#FF5733' for food, '#6C63FF' for tech" }
                },
                required: ["name", "type", "snippet", "location", "timing", "sourceLink", "imageKeywords"]
              }
            }
          }
        }
      }
    });

    const data = JSON.parse(response.text || '{"events":[]}');
    
    return (data.events || []).map((event: any, index: number) => ({
      id: `tvm-event-${index}-${Date.now()}`,
      name: event.name,
      type: event.type,
      rating: event.rating || "Verified",
      snippet: event.snippet,
      location: event.location,
      uri: event.sourceLink,
      // Using a more contextually relevant image service with the new specific keywords
      imageUrl: `https://loremflickr.com/800/600/${encodeURIComponent(event.imageKeywords)}?lock=${index}`,
      timing: event.timing as 'NOW' | 'WEEK' | 'WEEKEND',
      coordinates: event.latitude ? { latitude: event.latitude, longitude: event.longitude } : TRIVANDRUM_COORDS,
      description: `Source: ${event.sourceName || 'Local Verification'}`
    }));
  } catch (e) {
    console.error("Gemini Service Error:", e);
    return [];
  }
};

export const generateTravelResponse = async (
  query: string,
  location: Coordinates | null,
  preferences: UserPreferences,
  history: Message[],
  locationName: string = "Trivandrum"
): Promise<Message> => {
  const cleanText = (text: string) => text.replace(/\*/g, '').trim();

  try {
    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: `You are "Roam TVM", a local guide. If you mention a specific event, you MUST include a recommendation block.
        BE SPECIFIC with TAGS. If it's a beach event, use 'beach, ocean, sand, sunset'. If it's a cafe, use 'coffee, interior, cozy'.
        
        ---REC---
        NAME: [Event Name]
        TYPE: [Category]
        LOCATION: [Venue]
        SNIPPET: [Desc + Date]
        URL: [Ticketing/Info Link]
        LAT: [Latitude]
        LNG: [Longitude]
        TAGS: [3-4 specific visual keywords]
        ---END---`,
        tools: [{ googleSearch: {} }]
      },
      history: history.map(m => ({ role: m.role, parts: [{ text: m.text }] }))
    });

    const result = await chat.sendMessage({ message: query });
    const fullText = result.text || "";
    let recommendedPlace: PlaceCardData | undefined;

    // Extract grounding sources
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const groundingSources = groundingChunks?.map((chunk: any) => ({
      title: chunk.web?.title || 'Source',
      uri: chunk.web?.uri
    })).filter((s: any) => s.uri) || [];

    if (fullText.includes('---REC---')) {
      const parts = fullText.split('---REC---');
      const recContent = parts[1].split('---END---')[0];
      
      const name = cleanText(recContent.match(/NAME:\s*(.+)/)?.[1] || "Event");
      const type = cleanText(recContent.match(/TYPE:\s*(.+)/)?.[1] || "Event");
      const venue = cleanText(recContent.match(/LOCATION:\s*(.+)/)?.[1] || "Trivandrum");
      const lat = parseFloat(recContent.match(/LAT:\s*(.+)/)?.[1] || TRIVANDRUM_COORDS.latitude.toString());
      const lng = parseFloat(recContent.match(/LNG:\s*(.+)/)?.[1] || TRIVANDRUM_COORDS.longitude.toString());
      const url = cleanText(recContent.match(/URL:\s*(.+)/)?.[1] || "");
      const tags = cleanText(recContent.match(/TAGS:\s*(.+)/)?.[1] || "trivandrum");

      recommendedPlace = {
        id: `tvm-chat-rec-${Date.now()}`,
        name: name,
        type: type,
        rating: "Verified",
        snippet: cleanText(recContent.match(/SNIPPET:\s*(.+)/)?.[1] || ""),
        location: venue,
        uri: url,
        imageUrl: `https://loremflickr.com/800/600/${encodeURIComponent(tags)}?lock=${Date.now()}`,
        timing: 'NOW',
        coordinates: { latitude: lat, longitude: lng }
      };
    }

    return {
      id: Date.now().toString(),
      role: Role.MODEL,
      text: fullText.split('---REC---')[0].trim() || "I found a great event for you!",
      timestamp: new Date(),
      recommendedPlace,
      groundingSources: groundingSources.length > 0 ? groundingSources : undefined
    };
  } catch (e) {
    return { id: 'err', role: Role.MODEL, text: "Connectivity issue with TVM event server.", timestamp: new Date() };
  }
};