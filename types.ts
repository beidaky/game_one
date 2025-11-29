export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER'
}

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export enum ObstacleType {
  SPIKE = 'SPIKE',
  BLOCK = 'BLOCK',
  FLOATING_BLOCK = 'FLOATING_BLOCK'
}

export interface Obstacle {
  id: number;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

export interface GameConfig {
  gravity: number;
  jumpStrength: number;
  speed: number;
  groundHeight: number;
}