
export type GameState = 'START' | 'PLAYING' | 'GAME_OVER' | 'PAUSED' | 'REWARD' | 'LUCKY_WHEEL' | 'TIC_TAC_TOE' | 'BOSS_BATTLE';

export type GameMode = 'CATCH' | 'SHOOT';

export interface Position {
  x: number;
  y: number;
}

export interface FallingItem {
  id: number;
  x: number;
  y: number;
  width: number; // Size determines points
  speed: number;
  rotation: number;
  type: 'gift-red' | 'gift-green' | 'candy' | 'sock' | 'heart' | 'special-nhat-linh' | 'snowflake' | 'ornament' | 'gingerbread';
  points: number;
}

export interface Projectile {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number; // 0 to 1
  decay: number;
  color: string;
  size: number;
  type: 'confetti' | 'text';
  text?: string;
  rotation?: number;
  rotationSpeed?: number;
}

export const GAME_WIDTH = 100; // Using percentages for responsiveness
export const PLAYER_WIDTH = 15; // Percentage of screen width
export const PLAYER_HEIGHT = 10; // Approximate aspect ratio helper
export const BASE_SPEED = 0.4;