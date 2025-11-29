import React, { useState } from 'react';
import { GameState } from '../types';
import { audioManager } from '../utils/audio';

interface ControlsProps {
  gameState: GameState;
  onPause: () => void;
  score: number;
}

const Controls: React.FC<ControlsProps> = ({ gameState, onPause, score }) => {
  const [isMuted, setIsMuted] = useState(false);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newVal = !isMuted;
    setIsMuted(newVal);
    audioManager.toggleMute(newVal);
  };

  return (
    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-20 pointer-events-none">
      
      {/* Score */}
      <div className="flex flex-col">
        <span className="text-neon-blue font-tech text-3xl drop-shadow-[0_0_10px_rgba(0,243,255,0.8)]">
          {score.toString().padStart(6, '0')}
        </span>
      </div>

      {/* Buttons (Enable pointer events) */}
      <div className="flex gap-4 pointer-events-auto">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full border-2 transition-all ${isMuted ? 'border-gray-500 text-gray-500' : 'border-neon-green text-neon-green shadow-[0_0_15px_#00ff00]'}`}
          title="Toggle Music"
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M9 9v6a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path></svg>
          ) : (
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          )}
        </button>

        {gameState === GameState.PLAYING && (
          <button
            onClick={onPause}
            className="p-3 rounded-full border-2 border-white text-white hover:bg-white hover:text-black transition-all"
            title="Pause Game"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Controls;