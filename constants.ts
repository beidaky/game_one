import { GameConfig } from './types';

export const GAME_CONFIG: GameConfig = {
  gravity: 0.6,
  jumpStrength: -11.5,
  speed: 7,
  groundHeight: 100 // pixels from bottom
};

export const COLORS = {
  primary: '#00f3ff', // Cyan
  secondary: '#ff00ff', // Pink
  danger: '#ff2a2a', // Red
  background: '#0a0a12',
  grid: '#1a1a2e'
};

export const CANVAS_WIDTH = 1280; // Internal resolution width (720p)
export const CANVAS_HEIGHT = 720; // Internal resolution height (720p)