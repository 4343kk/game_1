import { useEffect, useRef, useState, useCallback } from 'react';
import { levels, Level, Platform, Obstacle, Collectible } from './levels';

interface Player {
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  onGround: boolean;
  jumping: boolean;
  facing: number;
  shield: boolean;
  shieldTimer: number;
  trail: { x: number; y: number; alpha: number }[];
}

interface GameState {
  player: Player;
  camera: { x: number; y: number };
  score: number;
  lives: number;
  level: number;
  gameStatus: 'menu' | 'playing' | 'paused' | 'levelComplete' | 'gameOver' | 'victory';
  particles: Particle[];
  breakablePlatforms: { index: number; timer: number }[];
  time: number;
  shakeTimer: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

const GRAVITY = 0.6;
const JUMP_FORCE = -13;
const MOVE_SPEED = 4.5;
const PLAYER_W = 28;
const PLAYER_H = 36;
const CANVAS_H = 400;
const CANVAS_W = 800;

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameStateRef = useRef<GameState | null>(null);
  const animFrameRef = useRef<number>(0);
  const keysRef = useRef<Set<string>>(new Set());
  const touchRef = useRef<{ left: boolean; right: boolean; jump: boolean }>({ left: false, right: false, jump: false });
  const [displayState, setDisplayState] = useState<{
    status: string;
    level: number;
    score: number;
    lives: number;
  }>({ status: 'menu', level: 0, score: 0, lives: 3 });
  const [showRotate, setShowRotate] = useState(false);

  // Check orientation
  useEffect(() => {
    const checkOrientation = () => {
      const isLandscape = window.innerWidth > window.innerHeight;
      setShowRotate(!isLandscape);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  const initLevel = useCallback((levelIdx: number, keepLives = true) => {
    const level = levels[levelIdx];
    const state: GameState = {
      player: {
        x: level.startX,
        y: level.startY,
        w: PLAYER_W,
        h: PLAYER_H,
        vx: 0,
        vy: 0,
        onGround: false,
        jumping: false,
        facing: 1,
        shield: false,
        shieldTimer: 0,
        trail: [],
      },
      camera: { x: 0, y: 0 },
      score: 0,
      lives: keepLives ? (gameStateRef.current?.lives ?? 3) : 3,
      level: levelIdx,
      gameStatus: 'playing',
      particles: [],
      breakablePlatforms: [],
      time: 0,
      shakeTimer: 0,
    };
    // Reset collectibles
    level.collectibles.forEach(c => c.collected = false);
    // Reset moving platforms to original positions
    level.platforms.forEach(p => {
      if (p.origX !== undefined) {
        p.x = p.origX;
        p.moveDir = 1;
      }
    });
    // Reset obstacles
    level.obstacles.forEach(o => {
      if ((o as any)._origX !== undefined) {
        o.x = (o as any)._origX;
        o.moveDir = 1;
      }
    });
    gameStateRef.current = state;
    setDisplayState({ status: 'playing', level: levelIdx, score: 0, lives: state.lives });
  }, []);

  const startGame = useCallback(() => {
    initLevel(0, false);
  }, [initLevel]);

  const nextLevel = useCallback(() => {
    const currentLevel = gameStateRef.current?.level ?? 0;
    if (currentLevel < levels.length - 1) {
      initLevel(currentLevel + 1);
    } else {
      if (gameStateRef.current) {
        gameStateRef.current.gameStatus = 'victory';
        setDisplayState(prev => ({ ...prev, status: 'victory' }));
      }
    }
  }, [initLevel]);

  const spawnParticles = (x: number, y: number, color: string, count: number) => {
    const state = gameStateRef.current;
    if (!state) return;
    for (let i = 0; i < count; i++) {
      state.particles.push({
        x, y,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6 - 2,
        life: 30 + Math.random() * 20,
        maxLife: 50,
        color,
        size: 2 + Math.random() * 3,
      });
    }
  };

  const update = useCallback(() => {
    const state = gameStateRef.current;
    if (!state || state.gameStatus !== 'playing') return;

    const level = levels[state.level];
    const player = state.player;
    const keys = keysRef.current;
    const touch = touchRef.current;

    state.time++;

    // Input
    let moveX = 0;
    if (keys.has('ArrowLeft') || keys.has('a') || touch.left) moveX = -1;
    if (keys.has('ArrowRight') || keys.has('d') || touch.right) moveX = 1;

    player.vx = moveX * MOVE_SPEED;
    if (moveX !== 0) player.facing = moveX;

    // Jump
    if ((keys.has('ArrowUp') || keys.has('w') || keys.has(' ') || touch.jump) && player.onGround) {
      player.vy = JUMP_FORCE;
      player.onGround = false;
      player.jumping = true;
      spawnParticles(player.x + player.w / 2, player.y + player.h, '#0ff', 5);
    }

    // Gravity
    player.vy += GRAVITY;
    if (player.vy > 15) player.vy = 15;

    // Move X
    player.x += player.vx;

    // Platform collision X
    for (const plat of level.platforms) {
      if (plat.type === 'breakable') {
        const bp = state.breakablePlatforms.find(b => b.index === level.platforms.indexOf(plat));
        if (bp && bp.timer <= 0) continue;
      }
      if (checkCollision(player, plat)) {
        if (player.vx > 0) {
          player.x = plat.x - player.w;
        } else if (player.vx < 0) {
          player.x = plat.x + plat.w;
        }
        player.vx = 0;
      }
    }

    // Move Y
    player.y += player.vy;
    player.onGround = false;

    // Platform collision Y
    for (let i = 0; i < level.platforms.length; i++) {
      const plat = level.platforms[i];
      if (plat.type === 'breakable') {
        const bp = state.breakablePlatforms.find(b => b.index === i);
        if (bp && bp.timer <= 0) continue;
      }
      if (checkCollision(player, plat)) {
        if (player.vy > 0) {
          player.y = plat.y - player.h;
          player.vy = 0;
          player.onGround = true;
          player.jumping = false;
          // Breakable platform
          if (plat.type === 'breakable') {
            let bp = state.breakablePlatforms.find(b => b.index === i);
            if (!bp) {
              state.breakablePlatforms.push({ index: i, timer: 40 });
            }
          }
        } else if (player.vy < 0) {
          player.y = plat.y + plat.h;
          player.vy = 0;
        }
      }
    }

    // Update moving platforms
    for (const plat of level.platforms) {
      if (plat.type === 'moving' && plat.moveRange && plat.moveSpeed) {
        if (plat.origX === undefined) plat.origX = plat.x;
        plat.x += (plat.moveDir || 1) * plat.moveSpeed;
        if (Math.abs(plat.x - plat.origX) > plat.moveRange) {
          plat.moveDir = -(plat.moveDir || 1);
        }
      }
    }

    // Update breakable platforms
    state.breakablePlatforms = state.breakablePlatforms.filter(bp => {
      bp.timer--;
      return bp.timer > 0;
    });

    // Update obstacles
    for (const obs of level.obstacles) {
      if (obs.type === 'drone' && obs.moveRange && obs.moveSpeed) {
        if ((obs as any)._origX === undefined) (obs as any)._origX = obs.x;
        obs.x += (obs.moveDir || 1) * obs.moveSpeed;
        if (Math.abs(obs.x - (obs as any)._origX) > obs.moveRange) {
          obs.moveDir = -(obs.moveDir || 1);
        }
      }
    }

    // Obstacle collision
    for (const obs of level.obstacles) {
      if (checkCollision(player, obs)) {
        if (player.shield) {
          player.shield = false;
          player.shieldTimer = 0;
          spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#0f0', 10);
        } else {
          state.lives--;
          state.shakeTimer = 15;
          spawnParticles(player.x + player.w / 2, player.y + player.h / 2, '#f00', 15);
          if (state.lives <= 0) {
            state.gameStatus = 'gameOver';
            setDisplayState(prev => ({ ...prev, status: 'gameOver', lives: 0 }));
            return;
          }
          // Respawn
          player.x = level.startX;
          player.y = level.startY;
          player.vx = 0;
          player.vy = 0;
          setDisplayState(prev => ({ ...prev, lives: state.lives }));
        }
      }
    }

    // Collectibles
    for (const col of level.collectibles) {
      if (col.collected) continue;
      const colRect = { x: col.x - 10, y: col.y - 10, w: 20, h: 20 };
      if (checkCollision(player, colRect)) {
        col.collected = true;
        state.score++;
        spawnParticles(col.x, col.y, '#ff0', 8);
        if (col.type === 'shield') {
          player.shield = true;
          player.shieldTimer = 300;
        }
        setDisplayState(prev => ({ ...prev, score: state.score }));
      }
    }

    // Shield timer
    if (player.shield) {
      player.shieldTimer--;
      if (player.shieldTimer <= 0) {
        player.shield = false;
      }
    }

    // Fall death
    if (player.y > CANVAS_H + 50) {
      state.lives--;
      state.shakeTimer = 15;
      if (state.lives <= 0) {
        state.gameStatus = 'gameOver';
        setDisplayState(prev => ({ ...prev, status: 'gameOver', lives: 0 }));
        return;
      }
      player.x = level.startX;
      player.y = level.startY;
      player.vx = 0;
      player.vy = 0;
      setDisplayState(prev => ({ ...prev, lives: state.lives }));
    }

    // Trail
    player.trail.unshift({ x: player.x + player.w / 2, y: player.y + player.h / 2, alpha: 1 });
    if (player.trail.length > 8) player.trail.pop();
    player.trail.forEach(t => t.alpha -= 0.12);

    // Level complete check
    const endRect = { x: level.endX, y: level.endY, w: 40, h: 60 };
    if (checkCollision(player, endRect) && state.score >= level.targetScore) {
      state.gameStatus = 'levelComplete';
      spawnParticles(level.endX + 20, level.endY + 30, '#0ff', 30);
      setDisplayState(prev => ({ ...prev, status: 'levelComplete' }));
    }

    // Camera
    const targetCamX = player.x - CANVAS_W / 3;
    state.camera.x += (targetCamX - state.camera.x) * 0.08;
    if (state.camera.x < 0) state.camera.x = 0;
    if (state.camera.x > 2000 - CANVAS_W) state.camera.x = 2000 - CANVAS_W;

    // Particles
    state.particles = state.particles.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.life--;
      return p.life > 0;
    });

    // Shake
    if (state.shakeTimer > 0) state.shakeTimer--;
  }, []);

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const state = gameStateRef.current;
    if (!canvas || !state) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const level = levels[state.level];
    const cam = state.camera;

    // Shake
    let shakeX = 0, shakeY = 0;
    if (state.shakeTimer > 0) {
      shakeX = (Math.random() - 0.5) * state.shakeTimer;
      shakeY = (Math.random() - 0.5) * state.shakeTimer;
    }

    ctx.save();
    ctx.translate(shakeX, shakeY);

    // Background
    ctx.fillStyle = level.bg;
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Grid
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 30;
    const offsetX = -(cam.x * 0.3) % gridSize;
    for (let x = offsetX; x < CANVAS_W; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, CANVAS_H);
      ctx.stroke();
    }
    for (let y = 0; y < CANVAS_H; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_W, y);
      ctx.stroke();
    }

    // Background data streams
    ctx.fillStyle = 'rgba(0, 255, 255, 0.03)';
    for (let i = 0; i < 8; i++) {
      const streamX = ((state.time * (0.3 + i * 0.1) + i * 150) % (CANVAS_W + 100)) - 50;
      ctx.fillRect(streamX, 0, 1, CANVAS_H);
    }

    // Floating binary in background
    ctx.fillStyle = 'rgba(0, 255, 255, 0.04)';
    ctx.font = '10px monospace';
    for (let i = 0; i < 12; i++) {
      const bx = ((state.time * 0.2 + i * 120) % (CANVAS_W + 50)) - 25;
      const by = ((state.time * 0.3 + i * 80) % (CANVAS_H + 50)) - 25;
      ctx.fillText(Math.random() > 0.5 ? '1' : '0', bx, by);
    }

    // Horizon glow
    const horizonGrad = ctx.createLinearGradient(0, CANVAS_H - 80, 0, CANVAS_H);
    horizonGrad.addColorStop(0, 'transparent');
    horizonGrad.addColorStop(1, 'rgba(0, 255, 255, 0.03)');
    ctx.fillStyle = horizonGrad;
    ctx.fillRect(0, CANVAS_H - 80, CANVAS_W, 80);

    ctx.save();
    ctx.translate(-cam.x, 0);

    // Platforms
    for (let i = 0; i < level.platforms.length; i++) {
      const plat = level.platforms[i];
      if (plat.type === 'breakable') {
        const bp = state.breakablePlatforms.find(b => b.index === i);
        if (bp && bp.timer <= 0) continue;
        ctx.globalAlpha = bp ? (bp.timer / 40) : 1;
      }

      // Platform glow
      ctx.shadowColor = plat.type === 'moving' ? '#f0f' : plat.type === 'breakable' ? '#ff0' : '#0ff';
      ctx.shadowBlur = 8;

      // Platform body
      const gradient = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.h);
      if (plat.type === 'moving') {
        gradient.addColorStop(0, '#800080');
        gradient.addColorStop(1, '#400040');
      } else if (plat.type === 'breakable') {
        gradient.addColorStop(0, '#808000');
        gradient.addColorStop(1, '#404000');
      } else {
        gradient.addColorStop(0, '#004060');
        gradient.addColorStop(1, '#002030');
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);

      // Platform border
      ctx.strokeStyle = plat.type === 'moving' ? '#f0f' : plat.type === 'breakable' ? '#ff0' : '#0ff';
      ctx.lineWidth = 2;
      ctx.strokeRect(plat.x, plat.y, plat.w, plat.h);

      // Digital pattern on platform
      ctx.fillStyle = plat.type === 'moving' ? 'rgba(255,0,255,0.2)' : plat.type === 'breakable' ? 'rgba(255,255,0,0.2)' : 'rgba(0,255,255,0.15)';
      for (let px = plat.x + 4; px < plat.x + plat.w - 4; px += 8) {
        if (Math.random() > 0.5) {
          ctx.fillRect(px, plat.y + 4, 4, 2);
        }
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    // End portal
    const portalPulse = Math.sin(state.time * 0.05) * 0.3 + 0.7;
    ctx.shadowColor = state.score >= level.targetScore ? '#0f0' : '#f00';
    ctx.shadowBlur = 15 * portalPulse;
    ctx.fillStyle = state.score >= level.targetScore ? `rgba(0,255,0,${portalPulse * 0.5})` : `rgba(255,0,0,${portalPulse * 0.3})`;
    ctx.fillRect(level.endX, level.endY, 40, 60);
    ctx.strokeStyle = state.score >= level.targetScore ? '#0f0' : '#f00';
    ctx.lineWidth = 2;
    ctx.strokeRect(level.endX, level.endY, 40, 60);

    // Portal icon
    ctx.fillStyle = state.score >= level.targetScore ? '#0f0' : '#f00';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(state.score >= level.targetScore ? '▶' : '✕', level.endX + 20, level.endY + 35);
    ctx.shadowBlur = 0;

    // Obstacles
    for (const obs of level.obstacles) {
      if (obs.type === 'spike') {
        ctx.shadowColor = '#f00';
        ctx.shadowBlur = 5;
        ctx.fillStyle = '#f00';
        ctx.beginPath();
        ctx.moveTo(obs.x, obs.y + obs.h);
        ctx.lineTo(obs.x + obs.w / 2, obs.y);
        ctx.lineTo(obs.x + obs.w, obs.y + obs.h);
        ctx.closePath();
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (obs.type === 'drone') {
        ctx.shadowColor = '#f0f';
        ctx.shadowBlur = 10;
        ctx.fillStyle = '#f0f';
        ctx.beginPath();
        ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, obs.w / 2, 0, Math.PI * 2);
        ctx.fill();
        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(obs.x + obs.w / 2, obs.y + obs.h / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (obs.type === 'laser') {
        const laserAlpha = Math.sin(state.time * 0.1) * 0.3 + 0.7;
        ctx.shadowColor = '#f00';
        ctx.shadowBlur = 15;
        ctx.fillStyle = `rgba(255, 0, 0, ${laserAlpha})`;
        ctx.fillRect(obs.x, obs.y, obs.w, obs.h);
        ctx.fillStyle = `rgba(255, 100, 100, ${laserAlpha * 0.5})`;
        ctx.fillRect(obs.x - 3, obs.y, obs.w + 6, obs.h);
        ctx.shadowBlur = 0;
      }
    }

    // Collectibles
    for (const col of level.collectibles) {
      if (col.collected) continue;
      const bobY = Math.sin(state.time * 0.08 + col.x) * 4;
      ctx.shadowColor = col.type === 'shield' ? '#0f0' : '#ff0';
      ctx.shadowBlur = 10;
      ctx.fillStyle = col.type === 'shield' ? '#0f0' : '#ff0';
      
      // Diamond shape
      ctx.beginPath();
      ctx.moveTo(col.x, col.y - 8 + bobY);
      ctx.lineTo(col.x + 8, col.y + bobY);
      ctx.lineTo(col.x, col.y + 8 + bobY);
      ctx.lineTo(col.x - 8, col.y + bobY);
      ctx.closePath();
      ctx.fill();
      
      // Inner glow
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(col.x, col.y + bobY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Player trail
    for (const t of state.player.trail) {
      if (t.alpha > 0) {
        ctx.fillStyle = `rgba(0, 255, 255, ${t.alpha * 0.3})`;
        ctx.fillRect(t.x - 4, t.y - 4, 8, 8);
      }
    }

    // Player
    const p = state.player;
    
    // Shield effect
    if (p.shield) {
      ctx.strokeStyle = `rgba(0, 255, 0, ${Math.sin(state.time * 0.1) * 0.3 + 0.5})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(p.x + p.w / 2, p.y + p.h / 2, 25, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Player body
    ctx.shadowColor = '#0ff';
    ctx.shadowBlur = 12;
    const pGradient = ctx.createLinearGradient(p.x, p.y, p.x + p.w, p.y + p.h);
    pGradient.addColorStop(0, '#00ffff');
    pGradient.addColorStop(1, '#0080ff');
    ctx.fillStyle = pGradient;
    ctx.fillRect(p.x, p.y, p.w, p.h);

    // Player face
    ctx.fillStyle = '#000';
    const eyeOffset = p.facing > 0 ? 4 : -4;
    ctx.fillRect(p.x + p.w / 2 + eyeOffset - 4, p.y + 10, 3, 4);
    ctx.fillRect(p.x + p.w / 2 + eyeOffset + 2, p.y + 10, 3, 4);
    
    // Player border
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x, p.y, p.w, p.h);
    ctx.shadowBlur = 0;

    // Particles
    for (const part of state.particles) {
      const alpha = part.life / part.maxLife;
      ctx.fillStyle = part.color;
      ctx.globalAlpha = alpha;
      ctx.fillRect(part.x - part.size / 2, part.y - part.size / 2, part.size, part.size);
    }
    ctx.globalAlpha = 1;

    ctx.restore(); // camera

    // HUD
    // Score
    ctx.fillStyle = '#0ff';
    ctx.font = 'bold 14px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`数据: ${state.score}/${level.targetScore}`, 10, 20);

    // Lives
    ctx.fillStyle = '#f00';
    for (let i = 0; i < state.lives; i++) {
      ctx.fillText('♥', 10 + i * 18, 40);
    }

    // Level name
    ctx.fillStyle = '#888';
    ctx.font = '11px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`LV.${state.level + 1} ${level.name}`, CANVAS_W / 2, 15);

    // Progress bar
    const progress = Math.min(1, state.player.x / level.endX);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(CANVAS_W - 110, 8, 100, 8);
    ctx.fillStyle = '#0ff';
    ctx.fillRect(CANVAS_W - 110, 8, 100 * progress, 8);
    ctx.strokeStyle = '#0ff';
    ctx.lineWidth = 1;
    ctx.strokeRect(CANVAS_W - 110, 8, 100, 8);

    ctx.restore(); // shake
  }, []);

  const gameLoop = useCallback(() => {
    update();
    render();
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [update, render]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [gameLoop]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key);
      if (e.key === ' ' || e.key === 'ArrowUp') e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch controls
  const handleTouchStart = (zone: 'left' | 'right' | 'jump') => {
    touchRef.current[zone] = true;
  };
  const handleTouchEnd = (zone: 'left' | 'right' | 'jump') => {
    touchRef.current[zone] = false;
  };

  if (showRotate) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0a0a1a] text-cyan-400 font-mono">
        <div className="text-center p-8">
          <div className="text-6xl mb-4 animate-pulse">📱↔️</div>
          <h2 className="text-xl mb-2">请横屏游玩</h2>
          <p className="text-sm text-cyan-600">Please rotate your device to landscape mode</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a1a] overflow-hidden relative">
      {/* Game Canvas */}
      <div className="relative w-full h-full max-h-screen flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="game-canvas w-full h-full"
          style={{ 
            imageRendering: 'pixelated',
            objectFit: 'contain',
            maxHeight: '100vh',
            maxWidth: '100vw',
          }}
        />

        {/* Scanline overlay */}
        <div className="scanline-overlay" />

        {/* Touch Controls */}
        {displayState.status === 'playing' && (
          <div className="absolute bottom-0 left-0 right-0 flex justify-between items-end p-2 md:p-4 pointer-events-none">
            {/* Left side - movement */}
            <div className="flex gap-2 pointer-events-auto">
              <button
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyan-900/40 border-2 border-cyan-400/50 flex items-center justify-center text-cyan-400 text-2xl active:bg-cyan-400/30 backdrop-blur-sm"
                onTouchStart={(e) => { e.preventDefault(); handleTouchStart('left'); }}
                onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('left'); }}
                onMouseDown={() => handleTouchStart('left')}
                onMouseUp={() => handleTouchEnd('left')}
                onMouseLeave={() => handleTouchEnd('left')}
              >
                ◀
              </button>
              <button
                className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-cyan-900/40 border-2 border-cyan-400/50 flex items-center justify-center text-cyan-400 text-2xl active:bg-cyan-400/30 backdrop-blur-sm"
                onTouchStart={(e) => { e.preventDefault(); handleTouchStart('right'); }}
                onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('right'); }}
                onMouseDown={() => handleTouchStart('right')}
                onMouseUp={() => handleTouchEnd('right')}
                onMouseLeave={() => handleTouchEnd('right')}
              >
                ▶
              </button>
            </div>
            {/* Right side - jump */}
            <div className="pointer-events-auto">
              <button
                className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-purple-900/40 border-2 border-purple-400/50 flex items-center justify-center text-purple-300 text-2xl active:bg-purple-400/30 backdrop-blur-sm"
                onTouchStart={(e) => { e.preventDefault(); handleTouchStart('jump'); }}
                onTouchEnd={(e) => { e.preventDefault(); handleTouchEnd('jump'); }}
                onMouseDown={() => handleTouchStart('jump')}
                onMouseUp={() => handleTouchEnd('jump')}
                onMouseLeave={() => handleTouchEnd('jump')}
              >
                ▲
              </button>
            </div>
          </div>
        )}

        {/* Menu Screen */}
        {displayState.status === 'menu' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a1a]/95 backdrop-blur-sm">
            <div className="text-center">
              <h1 className="text-3xl md:text-5xl font-bold text-cyan-400 mb-2 font-mono" style={{ animation: 'neon-flicker 3s infinite' }}>
                数码闯关
              </h1>
              <p className="text-lg md:text-xl text-purple-400 font-mono mb-1">CYBER RUNNER</p>
              <p className="text-xs text-cyan-600 font-mono mb-8">v2.0.77 // 10 LEVELS</p>
              
              <button
                onClick={startGame}
                className="px-8 py-3 bg-cyan-900/50 border-2 border-cyan-400 text-cyan-400 font-mono text-lg hover:bg-cyan-400/20 active:bg-cyan-400/40 transition-all rounded"
              >
                ▶ 开始游戏
              </button>
              
              <div className="mt-6 text-xs text-cyan-700 font-mono space-y-1">
                <p>键盘: ← → 移动 | ↑/空格 跳跃</p>
                <p>触屏: 使用下方按钮控制</p>
              </div>
            </div>
          </div>
        )}

        {/* Level Complete */}
        {displayState.status === 'levelComplete' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a1a]/90 backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-green-400 font-mono mb-2">
                ✓ 关卡通过
              </h2>
              <p className="text-lg text-cyan-400 font-mono mb-1">
                LV.{displayState.level + 1} 完成!
              </p>
              <p className="text-sm text-yellow-400 font-mono mb-6">
                收集数据: {displayState.score}
              </p>
              <button
                onClick={nextLevel}
                className="px-8 py-3 bg-green-900/50 border-2 border-green-400 text-green-400 font-mono text-lg hover:bg-green-400/20 active:bg-green-400/40 transition-all rounded"
              >
                {displayState.level < levels.length - 1 ? '▶ 下一关' : '🏆 查看结果'}
              </button>
            </div>
          </div>
        )}

        {/* Game Over */}
        {displayState.status === 'gameOver' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a1a]/90 backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-red-400 font-mono mb-2" style={{ animation: 'glitch 0.3s infinite' }}>
                ✕ 系统崩溃
              </h2>
              <p className="text-lg text-red-300 font-mono mb-1">SYSTEM FAILURE</p>
              <p className="text-sm text-gray-400 font-mono mb-6">
                到达关卡: LV.{displayState.level + 1}
              </p>
              <button
                onClick={startGame}
                className="px-8 py-3 bg-red-900/50 border-2 border-red-400 text-red-400 font-mono text-lg hover:bg-red-400/20 active:bg-red-400/40 transition-all rounded"
              >
                ↻ 重新开始
              </button>
            </div>
          </div>
        )}

        {/* Victory */}
        {displayState.status === 'victory' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a1a]/90 backdrop-blur-sm">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-bold text-yellow-400 font-mono mb-2" style={{ animation: 'neon-flicker 2s infinite' }}>
                🏆 解码完成
              </h2>
              <p className="text-lg text-cyan-400 font-mono mb-1">DECODE COMPLETE</p>
              <p className="text-sm text-green-400 font-mono mb-2">全部10关通过!</p>
              <p className="text-xs text-purple-400 font-mono mb-6">你已突破数码世界的最终防线</p>
              <button
                onClick={startGame}
                className="px-8 py-3 bg-yellow-900/50 border-2 border-yellow-400 text-yellow-400 font-mono text-lg hover:bg-yellow-400/20 active:bg-yellow-400/40 transition-all rounded"
              >
                ↻ 再次挑战
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function checkCollision(a: { x: number; y: number; w: number; h: number }, b: { x: number; y: number; w: number; h: number }): boolean {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
