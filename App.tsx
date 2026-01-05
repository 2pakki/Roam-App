import React, { useState, useEffect } from 'react';
import { Coordinates, TravelGroup, Budget, UserPreferences, Message, Role, PlaceCardData, CommunityEvent, Comment } from './types';
import PreferencesModal from './components/PreferencesPanel';
import ChatInterface from './components/ChatInterface';
import BottomNav from './components/BottomNav';
import PlaceCard from './components/PlaceCard';
import CommunityEventCard from './components/CommunityEventCard';
import IntegratedMap from './components/IntegratedMap';
import { generateTravelResponse, getNearbyPlaces, TRIVANDRUM_COORDS } from './services/geminiService';

const App: React.FC = () => {
  const [preferences, setPreferences] = useState<UserPreferences>({
    group: TravelGroup.SOLO,
    budget: Budget.MODERATE,
    activityType: '',
  });

  const [location, setLocation] = useState<Coordinates | null>(TRIVANDRUM_COORDS);
  const [activeTab, setActiveTab] = useState<'home' | 'community' | 'chat'>('home');
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const [selectedPlace, setSelectedPlace] = useState<PlaceCardData | null>(null);
  const [navigationTarget, setNavigationTarget] = useState<PlaceCardData | null>(null);

  const [feedPlaces, setFeedPlaces] = useState<PlaceCardData[]>([]);
  const [isFeedLoading, setIsFeedLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Community State
  const [communityEvents, setCommunityEvents] = useState<CommunityEvent[]>([
    {
      id: 'tvm-c1',
      title: 'Manaveeyam Veedhi Sunday Market',
      description: 'Is the flea market happening this Sunday? Heard some rumors about a venue change.',
      location: 'Manaveeyam Veedhi, Vellayambalam',
      time: 'Sunday Morning',
      author: 'Arjun_TVM',
      votes: 12,
      isUserVoted: null,
      comments: [
        { id: 'com-1', author: 'Rahul K.', text: 'Yes, it is on! Just passed by, they are setting up.', timestamp: new Date() },
        { id: 'com-2', author: 'Sneha', text: 'Parking is tight near the museum, try the side lanes.', timestamp: new Date() }
      ],
      timestamp: Date.now() - 3600000
    },
    {
      id: 'tvm-c2',
      title: 'Lulu Mall Concert Entry',
      description: 'Does anyone know if the North entry is open for the music fest today? The main gate is jammed.',
      location: 'Lulu Mall, Akkulam',
      time: 'Today 6:00 PM',
      author: 'Meera_Nair',
      votes: 4,
      isUserVoted: null,
      comments: [],
      timestamp: Date.now() - 7200000
    },
    {
      id: 'tvm-c3',
      title: 'Technopark Food Fest',
      description: 'Amazing Malabar biryani stall near Phase 3 today. Must try!',
      location: 'Technopark Phase 3',
      time: 'Ongoing',
      author: 'Dev_Coder',
      votes: 28,
      isUserVoted: 'up',
      comments: [
        { id: 'com-3', author: 'Anish', text: 'The line is super long now but worth it.', timestamp: new Date() }
      ],
      timestamp: Date.now() - 10000000
    }
  ]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (p) => setLocation({ latitude: p.coords.latitude, longitude: p.coords.longitude }),
        () => setLocation(TRIVANDRUM_COORDS)
      );
    }
  }, []);

  useEffect(() => {
    if (location) fetchFeed(location);
  }, [location, preferences]);

  const fetchFeed = async (loc: Coordinates) => {
    setIsFeedLoading(true);
    const places = await getNearbyPlaces(loc, preferences);
    setFeedPlaces(places);
    setIsFeedLoading(false);
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = { id: Date.now().toString(), role: Role.USER, text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);
    const response = await generateTravelResponse(text, location, preferences, messages);
    setMessages(prev => [...prev, response]);
    setIsChatLoading(false);
  };

  const handleDeepLinkToEvent = (place: PlaceCardData) => {
    // 1. Switch to Home Tab
    setActiveTab('home');
    // 2. Open the modal
    setSelectedPlace(place);
  };

  // Community Handlers
  const handleVote = (id: string, type: 'up' | 'down') => {
    setCommunityEvents(prev => prev.map(event => {
      if (event.id !== id) return event;
      
      let newVotes = event.votes;
      let newUserVoted = event.isUserVoted;

      if (event.isUserVoted === type) {
        newVotes += (type === 'up' ? -1 : 1);
        newUserVoted = null;
      } else {
        if (event.isUserVoted) {
          newVotes += (type === 'up' ? 2 : -2);
        } else {
          newVotes += (type === 'up' ? 1 : -1);
        }
        newUserVoted = type;
      }

      return { ...event, votes: newVotes, isUserVoted: newUserVoted };
    }));
  };

  const handleAddComment = (id: string, text: string) => {
    const newComment: Comment = {
      id: `new-com-${Date.now()}`,
      author: 'You',
      text: text,
      timestamp: new Date()
    };

    setCommunityEvents(prev => prev.map(event => {
      if (event.id === id) {
        return { ...event, comments: [...event.comments, newComment] };
      }
      return event;
    }));
  };

  return (
    <div className={`h-full w-full bg-slate-50 dark:bg-slate-900 overflow-hidden ${darkMode ? 'dark' : ''}`}>
      
      <main className="h-full w-full pb-20 overflow-y-auto scrollbar-hide">
        
        {activeTab === 'home' && (
          <div className="p-6">
            <header className="mb-8 mt-2">
               <div className="flex items-center justify-between mb-2">
                 <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-[0.2em]">
                    Trivandrum Explorer
                 </p>
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               </div>
               <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Happening Now</h1>
               <p className="text-sm text-slate-500 font-medium">Verified live events in TVM city.</p>
            </header>

            {isFeedLoading ? (
               <div className="space-y-6">
                 {[1,2,3].map(i => (
                    <div key={i} className="h-56 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
                 ))}
                 <div className="flex flex-col items-center py-10">
                    <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Checking local tickets...</p>
                 </div>
               </div>
            ) : (
              <div className="pb-24 space-y-6">
                {feedPlaces.length > 0 ? (
                  feedPlaces.map(p => <PlaceCard key={p.id} place={p} onClick={() => setSelectedPlace(p)} />)
                ) : (
                  <div className="text-center py-20 px-10">
                    <div className="text-6xl mb-6">🔍</div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No live events found</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">We couldn't find any ticketed events for today. Try changing your preferences or search for "this weekend".</p>
                    <button 
                      onClick={() => fetchFeed(location || TRIVANDRUM_COORDS)}
                      className="mt-8 bg-indigo-600 text-white font-black px-6 py-3 rounded-2xl shadow-lg"
                    >
                      Retry Local Search
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'community' && (
          <div className="p-6 pb-24">
             <header className="mb-8 mt-2">
                <p className="text-[10px] font-black text-purple-600 dark:text-purple-400 uppercase tracking-[0.2em] mb-2">
                    TVM Hub
                </p>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">Local Buzz</h1>
                <p className="text-sm text-slate-500 font-medium">Real updates from people on the ground in Trivandrum.</p>
             </header>

             <div className="space-y-4">
                {communityEvents.sort((a, b) => b.votes - a.votes).map(event => (
                   <CommunityEventCard 
                      key={event.id} 
                      event={event} 
                      onVote={handleVote} 
                      onAddComment={handleAddComment} 
                   />
                ))}
             </div>

             <div className="mt-8 p-6 bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100 dark:border-indigo-800 text-center">
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200 mb-2">Got a local tip?</h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-4">Help fellow explorers by sharing real-time info about entry, parking, or crowds.</p>
                <button className="bg-indigo-600 text-white text-xs font-black uppercase px-6 py-3 rounded-2xl shadow-lg">
                   Post an Update
                </button>
             </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            isLoading={isChatLoading} 
            locationState="found" 
            onViewDetails={handleDeepLinkToEvent} 
          />
        )}

      </main>

      {/* Navigation Modal */}
      {navigationTarget && navigationTarget.coordinates && (
        <IntegratedMap 
          destination={navigationTarget.coordinates}
          userLocation={location}
          placeName={navigationTarget.name}
          onClose={() => setNavigationTarget(null)}
        />
      )}

      {selectedPlace && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setSelectedPlace(null)}></div>
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto">
             <div className="relative h-64">
                <img src={selectedPlace.imageUrl} alt={selectedPlace.name} className="w-full h-full object-cover" />
                <button onClick={() => setSelectedPlace(null)} className="absolute top-6 right-6 bg-black/40 backdrop-blur-md p-2 rounded-full text-white"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 to-transparent p-8">
                   <h2 className="text-2xl font-black text-white leading-tight mb-1">{selectedPlace.name}</h2>
                   <div className="flex items-center gap-2">
                      <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest">{selectedPlace.type}</span>
                   </div>
                </div>
             </div>
             <div className="p-8">
                <p className="text-slate-700 dark:text-slate-200 leading-relaxed mb-8 text-lg font-medium">"{selectedPlace.snippet}"</p>
                
                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-8 flex items-center gap-4">
                   <div className="w-10 h-10 bg-white dark:bg-slate-700 rounded-xl flex items-center justify-center text-indigo-500 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                   </div>
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Venue</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{selectedPlace.location}</p>
                   </div>
                </div>

                <div className="space-y-3">
                   {selectedPlace.uri && (
                      <a href={selectedPlace.uri} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 bg-indigo-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-indigo-100 dark:shadow-none transition-all active:scale-[0.97]">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                         </svg>
                         GET TICKETS
                      </a>
                   )}
                   <button 
                     onClick={() => { setNavigationTarget(selectedPlace); setSelectedPlace(null); }}
                     className="w-full flex items-center justify-center gap-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-black py-5 rounded-2xl"
                   >
                      OPEN DIRECTIONS
                   </button>
                </div>
             </div>
          </div>
        </div>
      )}

      <PreferencesModal isOpen={isFiltersOpen} onClose={() => setIsFiltersOpen(false)} preferences={preferences} setPreferences={setPreferences} />
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} onOpenFilters={() => setIsFiltersOpen(true)} onToggleTheme={() => setDarkMode(!darkMode)} isDark={darkMode} />
    </div>
  );
};

export default App;