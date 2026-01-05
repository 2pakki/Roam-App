import React from 'react';
import { Message, Role, PlaceCardData } from '../types';

interface ChatMessageProps {
  message: Message;
  onViewDetails: (place: PlaceCardData) => void;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, onViewDetails }) => {
  const isModel = message.role === Role.MODEL;

  return (
    <div className={`flex w-full mb-6 ${isModel ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isModel ? 'items-start' : 'items-end'}`}>
        
        {/* Text Bubble */}
        <div className={`px-5 py-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
          isModel 
            ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-700' 
            : 'bg-indigo-600 text-white rounded-tr-none'
        }`}>
          {message.text}
        </div>

        {/* Recommended Place Card (Mini) */}
        {isModel && message.recommendedPlace && (
           <div 
             onClick={() => onViewDetails(message.recommendedPlace!)}
             className="mt-3 w-full bg-white dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-lg animate-fade-in-up cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all group active:scale-95"
           >
              <div className="h-32 relative">
                 <img 
                   src={message.recommendedPlace.imageUrl} 
                   alt={message.recommendedPlace.name} 
                   className="w-full h-full object-cover transition-transform group-hover:scale-105" 
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-4">
                    <span className="text-white text-[10px] font-black uppercase tracking-widest bg-indigo-600 self-start px-2 py-0.5 rounded-md mb-1">
                        Recommended Spot
                    </span>
                    <h4 className="text-white font-bold text-sm leading-tight drop-shadow-md">{message.recommendedPlace.name}</h4>
                 </div>
                 <div className="absolute top-2 right-2 bg-white/20 backdrop-blur-md rounded-full p-1.5 border border-white/30 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                 </div>
              </div>
              <div className="p-4 bg-white dark:bg-slate-800">
                 <div className="flex items-center justify-between mb-1">
                    <div className="text-[10px] text-indigo-500 font-bold uppercase tracking-widest">{message.recommendedPlace.type}</div>
                    <div className="text-[10px] text-slate-400 font-medium">★ {message.recommendedPlace.rating}</div>
                 </div>
                 <div className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 italic">
                    Tap to view booking & directions
                 </div>
              </div>
           </div>
        )}

        {/* Display Sources/Map Links if available */}
        {isModel && message.groundingSources && message.groundingSources.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2 animate-fade-in-up">
            {message.groundingSources.slice(0, 3).map((source, idx) => (
              <a 
                key={idx}
                href={source.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-xs font-medium hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-100 dark:border-blue-800"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {source.title.length > 20 ? source.title.substring(0,20)+'...' : source.title}
              </a>
            ))}
          </div>
        )}
        
        <span className="text-xs text-slate-400 mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;