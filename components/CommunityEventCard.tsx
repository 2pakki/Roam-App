import React, { useState } from 'react';
import { CommunityEvent, Comment } from '../types';

interface CommunityEventCardProps {
  event: CommunityEvent;
  onVote: (id: string, type: 'up' | 'down') => void;
  onAddComment: (id: string, text: string) => void;
}

const CommunityEventCard: React.FC<CommunityEventCardProps> = ({ event, onVote, onAddComment }) => {
  const [commentInput, setCommentInput] = useState('');
  const [showComments, setShowComments] = useState(false);

  // Constants
  const COMMENTS_UNLOCK_THRESHOLD = 5;
  const isCommentsUnlocked = event.votes >= COMMENTS_UNLOCK_THRESHOLD;

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentInput.trim()) {
      onAddComment(event.id, commentInput);
      setCommentInput('');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 mb-4">
      <div className="flex gap-4">
        {/* Vote Column */}
        <div className="flex flex-col items-center gap-1 min-w-[3rem]">
          <button 
            onClick={() => onVote(event.id, 'up')}
            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${event.isUserVoted === 'up' ? 'text-green-600 font-bold' : 'text-slate-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </button>
          
          <span className={`font-bold ${event.votes > 0 ? 'text-green-600' : event.votes < 0 ? 'text-red-500' : 'text-slate-500'}`}>
            {event.votes}
          </span>
          
          <button 
            onClick={() => onVote(event.id, 'down')}
            className={`p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${event.isUserVoted === 'down' ? 'text-red-600 font-bold' : 'text-slate-400'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Content Column */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-1">
            <h3 className="font-bold text-slate-800 dark:text-white text-lg">{event.title}</h3>
            <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2 py-1 rounded-full whitespace-nowrap">
              {event.time}
            </span>
          </div>
          
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{event.description}</p>
          
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-3">
             <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {event.location}
             </span>
             <span>•</span>
             <span>Posted by {event.author}</span>
          </div>

          {/* Comment Status */}
          <div className="border-t border-slate-100 dark:border-slate-700 pt-3">
             {!isCommentsUnlocked ? (
               <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span>{COMMENTS_UNLOCK_THRESHOLD - event.votes} more upvotes to unlock comments</span>
               </div>
             ) : (
               <div className="w-full">
                  <button 
                    onClick={() => setShowComments(!showComments)}
                    className="text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:underline mb-2 flex items-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {showComments ? 'Hide Comments' : `View ${event.comments.length} Comments`}
                  </button>

                  {showComments && (
                    <div className="space-y-3 mt-2 animate-fade-in">
                       {event.comments.map(c => (
                         <div key={c.id} className="bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-lg text-sm">
                           <p className="font-semibold text-xs text-slate-700 dark:text-slate-200 mb-0.5">{c.author}</p>
                           <p className="text-slate-600 dark:text-slate-300">{c.text}</p>
                         </div>
                       ))}
                       
                       <form onSubmit={handleCommentSubmit} className="flex gap-2 mt-2">
                         <input 
                           type="text" 
                           value={commentInput}
                           onChange={(e) => setCommentInput(e.target.value)}
                           placeholder="Add a comment..."
                           className="flex-1 bg-slate-100 dark:bg-slate-700 border-none rounded-full px-3 py-1.5 text-sm focus:ring-1 focus:ring-indigo-500"
                         />
                         <button type="submit" disabled={!commentInput.trim()} className="text-indigo-600 disabled:opacity-50 text-sm font-medium">Post</button>
                       </form>
                    </div>
                  )}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityEventCard;