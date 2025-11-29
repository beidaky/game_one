import React from 'react';
import { GameState } from '../types';

interface MenuOverlayProps {
  gameState: GameState;
  score: number;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}

const MenuOverlay: React.FC<MenuOverlayProps> = ({ gameState, score, onStart, onResume, onRestart }) => {
  if (gameState === GameState.PLAYING) return null;

  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="text-center p-8 border-2 border-neon-blue rounded-lg bg-black/80 shadow-[0_0_50px_rgba(0,243,255,0.3)] min-w-[320px]">
        
        {gameState === GameState.MENU && (
          <>
            <h1 className="text-6xl font-tech text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-neon-purple mb-8 animate-pulse">
              霓虹冲刺
            </h1>
            <p className="text-gray-300 mb-8 font-cn text-lg">点击鼠标 或 按空格键跳跃</p>
            <button
              onClick={onStart}
              className="px-8 py-3 bg-neon-blue text-black font-bold text-xl rounded hover:bg-white hover:shadow-[0_0_20px_#fff] transition-all font-cn tracking-widest"
            >
              开始游戏
            </button>
          </>
        )}

        {gameState === GameState.PAUSED && (
          <>
            <h2 className="text-5xl font-cn font-bold text-neon-pink mb-8 tracking-widest">暂停</h2>
            <div className="flex flex-col gap-4">
              <button
                onClick={onResume}
                className="px-8 py-3 border border-neon-green text-neon-green hover:bg-neon-green hover:text-black transition-all font-cn text-xl font-bold"
              >
                继续游戏
              </button>
              <button
                onClick={onRestart}
                className="px-8 py-3 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all font-cn text-xl font-bold"
              >
                重新开始
              </button>
            </div>
          </>
        )}

        {gameState === GameState.GAME_OVER && (
          <>
            <h2 className="text-5xl font-cn font-bold text-red-600 mb-4 tracking-wider">游戏结束</h2>
            <div className="text-2xl text-white mb-8 font-mono">
              得分: <span className="text-neon-blue">{score}</span>
            </div>
            <button
              onClick={onRestart}
              className="px-8 py-3 bg-neon-purple text-white font-bold text-xl rounded hover:bg-white hover:text-black hover:shadow-[0_0_20px_#bd00ff] transition-all font-cn tracking-widest"
            >
              再试一次
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MenuOverlay;