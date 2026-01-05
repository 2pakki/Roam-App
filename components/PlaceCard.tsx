import React, { useState } from 'react';
import { PlaceCardData } from '../types';

interface PlaceCardProps {
  place: PlaceCardData;
  onClick?: () => void;
}

const PlaceCard: React.FC<PlaceCardProps> = ({ place, onClick }) => {
  const [imgLoaded, setImgLoaded] = useState(false);
  
  const getIcon = (type: string) => {
    const t = type.toLowerCase();
    if (t.includes('concert') || t.includes('music') || t.includes('dj')) return '🎸';
    if (t.includes('workshop') || t.includes('class') || t.includes('learning')) return '🎓';
    if (t.includes('food') || t.includes('fest') || t.includes('brunch')) return '🍹';
    if (t.includes('market') || t.includes('sale') || t.includes('shopping')) return '🛍️';
    if (t.includes('art') || t.includes('exhibition') || t.includes('gallery')) return '🎨';
    if (t.includes('comedy') || t.includes('standup') || t.includes('open mic')) return '🎭';
    if (t.includes('temple') || t.includes('festival') || t.includes('religious')) return '🪔';
    if (t.includes('sports') || t.includes('match') || t.includes('game')) return '⚽';
    if (t.includes('beach') || t.includes('ocean')) return '🏖️';
    return '✨';
  };

  const isNow = place.timing === 'NOW';

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700/50 overflow-hidden mb-6 transition-all active:scale-[0.98] cursor-pointer hover:shadow-xl hover:-translate-y-1 group relative"
    >
      <div className="h-56 relative bg-slate-200 dark:bg-slate-700 overflow-hidden">
        {/* Skeleton Shimmer */}
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" style={{ backgroundSize: '200% 100%' }}></div>
        )}
        
        <img 
          src={place.imageUrl} 
          alt={place.name} 
          onLoad={() => setImgLoaded(true)}
          className={`w-full h-full object-cover transition-all duration-1000 group-hover:scale-110 ${imgLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
          loading="lazy"
        />
        
        {/* Status Badges */}
        <div className="absolute top-4 left-4 flex flex-col gap-2 z-20">
          {isNow && (
            <div className="bg-rose-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-rose-500/20">
               <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
               LIVE NOW
            </div>
          )}
          
          <div className="bg-black/30 backdrop-blur-md rounded-lg px-2 py-1 text-[9px] text-white font-bold uppercase tracking-widest border border-white/10">
             {place.description?.replace('Source: ', '') || 'Local Tip'}
          </div>
        </div>

        {/* Action Badge */}
        <div className="absolute top-4 right-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-2xl p-2.5 shadow-xl border border-white/20 z-20 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
           </svg>
        </div>
        
        {/* Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80"></div>

        <div className="absolute bottom-4 left-5 right-5 text-white z-10">
           <div className="flex items-center justify-between mb-1">
              <div className="text-3xl drop-shadow-lg transform group-hover:-rotate-12 transition-transform">{getIcon(place.type)}</div>
              <div className="bg-indigo-500/90 backdrop-blur-sm rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.2em] shadow-lg shadow-indigo-500/30">
                 {place.type}
              </div>
           </div>
           <h3 className="text-xl font-black leading-tight drop-shadow-md line-clamp-2 mb-1 group-hover:text-indigo-200 transition-colors">{place.name}</h3>
           <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                 </svg>
              </div>
              <p className="text-[10px] font-bold text-white/90 uppercase tracking-widest">{place.location}</p>
           </div>
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2 mb-4 font-medium italic">
          "{place.snippet}"
        </p>
        
        <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-700/50 pt-4">
            <div className="flex items-center gap-2">
               <div className="flex -space-x-2">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[8px] font-black">
                       {String.fromCharCode(64 + i)}
                    </div>
                  ))}
               </div>
               <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">50+ Interested</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-black text-[10px] tracking-widest">
               EXPLORE 
               <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
               </svg>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;