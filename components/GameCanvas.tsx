import React, { useRef, useEffect, useState, useCallback } from 'react';
import { GameState, Obstacle, ObstacleType, Particle } from '../types';
import { GAME_CONFIG, COLORS, CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { audioManager } from '../utils/audio';

interface GameCanvasProps {
  gameState: GameState;
  setGameState: (state: GameState) => void;
  setScore: (score: number) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, setGameState, setScore }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(0);
  
  // Game State Refs (Mutable for performance in render loop)
  const playerRef = useRef({
    x: 200,
    y: 0,
    dy: 0,
    rotation: 0,
    isGrounded: true,
    width: 40,
    height: 40
  });
  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const scoreRef = useRef(0);
  const frameCountRef = useRef(0);
  const bgOffsetRef = useRef(0);
  const groundOffsetRef = useRef(0);

  // Helper: Create Particles
  const createExplosion = (x: number, y: number, color: string) => {
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 1.0,
        color: color,
        size: Math.random() * 5 + 2
      });
    }
  };

  const resetGame = useCallback(() => {
    playerRef.current = {
      x: 200,
      y: CANVAS_HEIGHT - GAME_CONFIG.groundHeight - 40,
      dy: 0,
      rotation: 0,
      isGrounded: true,
      width: 40,
      height: 40
    };
    obstaclesRef.current = [];
    particlesRef.current = [];
    scoreRef.current = 0;
    frameCountRef.current = 0;
    setScore(0);
  }, [setScore]);

  // Jump Logic
  const handleJump = useCallback(() => {
    if (gameState !== GameState.PLAYING) return;
    
    if (playerRef.current.isGrounded) {
      playerRef.current.dy = GAME_CONFIG.jumpStrength;
      playerRef.current.isGrounded = false;
      audioManager.playJumpSound();
    }
  }, [gameState]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleJump();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleJump]);

  useEffect(() => {
    if (gameState === GameState.PLAYING && obstaclesRef.current.length === 0) {
      resetGame();
    }
  }, [gameState, resetGame]);

  const update = () => {
    if (gameState !== GameState.PLAYING) return;

    const player = playerRef.current;

    // 1. Physics
    player.dy += GAME_CONFIG.gravity;
    player.y += player.dy;

    // Rotation effect (spins when in air)
    if (!player.isGrounded) {
      player.rotation += 0.15; 
    } else {
      // Snap to nearest 90 deg when grounded
      const snap = Math.round(player.rotation / (Math.PI / 2)) * (Math.PI / 2);
      player.rotation = player.rotation * 0.8 + snap * 0.2;
    }

    // Ground Collision
    const groundY = CANVAS_HEIGHT - GAME_CONFIG.groundHeight - player.height;
    if (player.y >= groundY) {
      player.y = groundY;
      player.dy = 0;
      player.isGrounded = true;
    }

    // 2. Obstacle Spawning
    frameCountRef.current++;
    // Spawn roughly every 90-150 frames depending on randomness
    if (frameCountRef.current % 100 === 0 && Math.random() > 0.3) {
      const type = Math.random() > 0.7 ? ObstacleType.BLOCK : ObstacleType.SPIKE;
      const isFloating = Math.random() > 0.8;
      
      let w = 40; 
      let h = 40;
      let y = CANVAS_HEIGHT - GAME_CONFIG.groundHeight - h;

      if (type === ObstacleType.SPIKE) {
        w = 30;
        h = 40;
      }

      if (isFloating && type === ObstacleType.BLOCK) {
         y -= 50; // Floating block
      }

      // Group spawning (double spikes)
      const count = Math.random() > 0.8 ? 2 : 1;
      
      for(let i=0; i<count; i++) {
        obstaclesRef.current.push({
            id: Date.now() + i,
            type,
            x: CANVAS_WIDTH + (i * w),
            y: y,
            width: w,
            height: h,
            passed: false
        });
      }
    }

    // 3. Move Objects
    obstaclesRef.current.forEach(obs => {
      obs.x -= GAME_CONFIG.speed;
      
      // Score counting
      if (!obs.passed && obs.x + obs.width < player.x) {
        obs.passed = true;
        scoreRef.current += 100;
        setScore(scoreRef.current);
      }
    });

    // Cleanup off-screen
    obstaclesRef.current = obstaclesRef.current.filter(obs => obs.x + obs.width > -100);

    // 4. Collision Detection
    // Shrink hit box slightly to be forgiving
    const hitBox = 8;
    for (const obs of obstaclesRef.current) {
      if (
        player.x + hitBox < obs.x + obs.width &&
        player.x + player.width - hitBox > obs.x &&
        player.y + hitBox < obs.y + obs.height &&
        player.y + player.height - hitBox > obs.y
      ) {
        // Crash
        createExplosion(player.x + player.width/2, player.y + player.height/2, COLORS.primary);
        audioManager.playCrashSound();
        setGameState(GameState.GAME_OVER);
        return; 
      }
    }

    // 5. Particles
    particlesRef.current.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.life -= 0.02;
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // 6. Background Parallax
    bgOffsetRef.current -= 0.5;
    groundOffsetRef.current -= GAME_CONFIG.speed;
  };

  const draw = (ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Background Gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#020205');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Grid (Retro Wave Style)
    ctx.strokeStyle = 'rgba(255, 0, 255, 0.15)';
    ctx.lineWidth = 2;
    const perspectiveY = CANVAS_HEIGHT / 2;
    
    // Vertical lines moving left
    const gridSize = 100;
    // Fix: Ensure modulo is positive
    let gridOffsetX = bgOffsetRef.current % gridSize;
    if (gridOffsetX < 0) gridOffsetX += gridSize;
    
    ctx.beginPath();
    // Horizon line
    ctx.moveTo(0, perspectiveY);
    ctx.lineTo(CANVAS_WIDTH, perspectiveY);

    // Moving verticals
    for (let x = gridOffsetX; x < CANVAS_WIDTH; x += gridSize) {
        // Simple perspective fake: straight lines for now, or slanted
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
    }
    // Horizontal lines
    for (let y = 0; y < CANVAS_HEIGHT; y += gridSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
    }
    ctx.stroke();

    // Draw Ground
    ctx.fillStyle = '#000';
    ctx.fillRect(0, CANVAS_HEIGHT - GAME_CONFIG.groundHeight, CANVAS_WIDTH, GAME_CONFIG.groundHeight);
    
    // Neon Ground Line
    ctx.shadowBlur = 20;
    ctx.shadowColor = COLORS.primary;
    ctx.strokeStyle = COLORS.primary;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, CANVAS_HEIGHT - GAME_CONFIG.groundHeight);
    ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - GAME_CONFIG.groundHeight);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Obstacles
    obstaclesRef.current.forEach(obs => {
      ctx.shadowBlur = 15;
      if (obs.type === ObstacleType.SPIKE) {
        ctx.shadowColor = COLORS.danger;
        ctx.fillStyle = COLORS.danger;
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.height);
        ctx.lineTo(obs.x + obs.width / 2, obs.y);
        ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
        ctx.fill();
        // Inner white
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.moveTo(obs.x + 5, obs.y + obs.height - 2);
        ctx.lineTo(obs.x + obs.width / 2, obs.y + 10);
        ctx.lineTo(obs.x + obs.width - 5, obs.y + obs.height - 2);
        ctx.fill();
      } else {
        ctx.shadowColor = COLORS.secondary;
        ctx.fillStyle = COLORS.secondary;
        ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
      }
      ctx.shadowBlur = 0;
    });

    // Draw Player
    if (gameState !== GameState.GAME_OVER) {
        const p = playerRef.current;
        ctx.save();
        ctx.translate(p.x + p.width/2, p.y + p.height/2);
        ctx.rotate(p.rotation);
        
        ctx.shadowBlur = 25;
        ctx.shadowColor = COLORS.primary;
        ctx.fillStyle = COLORS.primary;
        ctx.fillRect(-p.width/2, -p.height/2, p.width, p.height);
        
        // Inner detail
        ctx.fillStyle = '#fff';
        ctx.fillRect(-p.width/4, -p.height/4, p.width/2, p.height/2);
        
        ctx.restore();
        ctx.shadowBlur = 0;

        // Trail effect
        if (p.dy !== 0 || Math.random() > 0.5) {
             // Simple trail particles
             particlesRef.current.push({
                x: p.x,
                y: p.y + p.height/2,
                vx: -5,
                vy: (Math.random() - 0.5) * 2,
                life: 0.5,
                color: COLORS.primary,
                size: 5
             });
        }
    }

    // Draw Particles
    particlesRef.current.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        ctx.globalAlpha = 1.0;
    });
  };

  const loop = useCallback(() => {
    update();
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) draw(ctx);
    }
    requestRef.current = requestAnimationFrame(loop);
  }, [gameState]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [loop]);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onClick={handleJump}
      className="w-full h-full block touch-manipulation cursor-pointer"
    />
  );
};

export default GameCanvas;