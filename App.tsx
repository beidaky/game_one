import React, { useState, useEffect } from 'react';
import GameCanvas from './components/GameCanvas';
import MenuOverlay from './components/MenuOverlay';
import Controls from './components/Controls';
import { GameState } from './types';
import { audioManager } from './utils/audio';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState(0);

  const startGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    audioManager.startMusic();
  };

  const resumeGame = () => {
    setGameState(GameState.PLAYING);
    audioManager.startMusic(); // Resume context if suspended
  };

  const pauseGame = () => {
    setGameState(GameState.PAUSED);
  };

  const restartGame = () => {
    setGameState(GameState.PLAYING);
    setScore(0);
    audioManager.startMusic();
  };

  // Stop music on game over
  useEffect(() => {
    if (gameState === GameState.GAME_OVER) {
      // Keep music playing for effect? Or stop? 
      // Let's stop the scheduler but keep the audio context alive
      audioManager.stopMusic();
    }
  }, [gameState]);

  return (
    <div className="relative w-full h-screen bg-slate-900 overflow-hidden flex items-center justify-center">
      {/* Game Container */}
      <div className="relative w-full h-full max-w-[1920px] aspect-video shadow-2xl bg-black">
        <GameCanvas 
          gameState={gameState} 
          setGameState={setGameState}
          setScore={setScore}
        />
        
        <Controls 
          gameState={gameState} 
          onPause={pauseGame}
          score={score}
        />

        <MenuOverlay 
          gameState={gameState}
          score={score}
          onStart={startGame}
          onResume={resumeGame}
          onRestart={restartGame}
        />
      </div>
      
      {/* Mobile Controls Hint (Visible only on touch devices) */}
      <div className="absolute bottom-4 text-gray-500 text-sm opacity-50 pointer-events-none md:hidden">
        Tap to Jump
      </div>
    </div>
  );
};

export default App;