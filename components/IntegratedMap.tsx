import React from 'react';
import { Coordinates } from '../types';

interface IntegratedMapProps {
  destination: Coordinates;
  userLocation: Coordinates | null;
  placeName: string;
  onClose: () => void;
}

const IntegratedMap: React.FC<IntegratedMapProps> = ({ destination, userLocation, placeName, onClose }) => {
  // Construct the Google Maps Embed URL
  // If we have user location, we can show a 'Directions' view
  // Otherwise, we show a 'Place' view
  let mapUrl = "";
  
  if (userLocation) {
    // Mode: Directions
    mapUrl = `https://www.google.com/maps/embed/v1/directions?key=YOUR_ACTUAL_MAPS_KEY_OPTIONAL_BUT_WORKS_BETTER&origin=${userLocation.latitude},${userLocation.longitude}&destination=${destination.latitude},${destination.longitude}&mode=walking`;
  } else {
    // Mode: Place
    mapUrl = `https://www.google.com/maps/embed/v1/place?key=YOUR_ACTUAL_MAPS_KEY_OPTIONAL_BUT_WORKS_BETTER&q=${destination.latitude},${destination.longitude}`;
  }

  // Fallback if no specific key is provided for standard public embeds
  const fallbackUrl = `https://maps.google.com/maps?q=${destination.latitude},${destination.longitude}&z=15&output=embed`;

  return (
    <div className="fixed inset-0 z-[120] bg-white dark:bg-slate-900 flex flex-col animate-slide-up">
      <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
         <div className="flex items-center gap-3">
            <button onClick={onClose} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
               </svg>
            </button>
            <div>
               <h3 className="font-bold text-slate-800 dark:text-white leading-tight">{placeName}</h3>
               <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">Internal Navigator</p>
            </div>
         </div>
         <div className="flex items-center gap-2">
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              title="Open External App"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
               </svg>
            </a>
         </div>
      </div>
      
      <div className="flex-1 bg-slate-100 dark:bg-slate-800 relative">
        <iframe
          title="Map Navigation"
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={fallbackUrl}
          allowFullScreen
        ></iframe>
        
        {/* Floating Instruction Overlay */}
        <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-white/20">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                 </svg>
              </div>
              <div>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Navigation Note</p>
                 <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                    Use gestures to zoom and explore. Tap markers for real-time reviews.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedMap;