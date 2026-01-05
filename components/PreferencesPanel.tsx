import React from 'react';
import { UserPreferences, TravelGroup, Budget } from '../types';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({ isOpen, onClose, preferences, setPreferences }) => {
  if (!isOpen) return null;

  const handleChange = (key: keyof UserPreferences, value: any) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative bg-white dark:bg-slate-900 w-full md:w-96 rounded-t-3xl md:rounded-2xl p-6 shadow-2xl animate-slide-up md:animate-scale-in max-h-[85vh] overflow-y-auto">
        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6 md:hidden"></div>
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Trip Preferences</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Travel Group */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Traveling as</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.values(TravelGroup).map((group) => (
              <button
                key={group}
                onClick={() => handleChange('group', group)}
                className={`px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                  preferences.group === group
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Budget</label>
          <div className="space-y-2">
            {Object.values(Budget).map((b) => (
                <button
                key={b}
                onClick={() => handleChange('budget', b)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  preferences.budget === b
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                {b}
                {preferences.budget === b && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Interest */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Specific Interest</label>
          <input
            type="text"
            placeholder="e.g. Jazz, Hiking, Sushi..."
            value={preferences.activityType}
            onChange={(e) => handleChange('activityType', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
        
        <button 
            onClick={onClose}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-colors"
        >
            Apply Filters
        </button>
      </div>
    </div>
  );
};

export default PreferencesModal;