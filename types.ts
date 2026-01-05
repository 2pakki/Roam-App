export interface Coordinates {
  latitude: number;
  longitude: number;
}

export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: Role;
  text: string;
  timestamp: Date;
  groundingSources?: GroundingSource[];
  recommendedPlace?: PlaceCardData;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface PlaceCardData {
  id: string;
  name: string;
  type: string;
  rating: string;
  snippet: string;
  location?: string;
  uri?: string;
  imageUrl?: string;
  timing?: 'NOW' | 'WEEK' | 'WEEKEND';
  description?: string;
  coordinates?: Coordinates; // Added for internal mapping
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  time: string;
  author: string;
  votes: number;
  comments: Comment[];
  isUserVoted: 'up' | 'down' | null;
  timestamp: number;
}

export enum TravelGroup {
  SOLO = 'Solo Traveler',
  COUPLE = 'Couple',
  FAMILY = 'Family',
  FRIENDS = 'Group of Friends'
}

export enum Budget {
  FREE = 'Free',
  BUDGET = 'Budget',
  MODERATE = 'Moderate',
  LUXURY = 'Luxury'
}

export interface UserPreferences {
  group: TravelGroup;
  budget: Budget;
  activityType: string;
}

export interface AppState {
  location: Coordinates | null;
  locationError: string | null;
  isLoading: boolean;
  messages: Message[];
  preferences: UserPreferences;
  activeTab: 'home' | 'community' | 'chat';
  darkMode: boolean;
}