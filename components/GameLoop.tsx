
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GameState, GameMode, FallingItem, PLAYER_WIDTH, Particle, Projectile } from '../types';
import { CamiCat, GiftRed, GiftGreen, ChristmasSock, Logo, YarnBall, HeartItem, GoldenTicket, NhatLinhHero } from './Assets';
import { Play, RotateCcw, ArrowLeft, ArrowRight, Pause, Home, Gift, Heart, Crosshair } from 'lucide-react';
import { soundManager } from '../SoundManager';

const ITEM_TYPES = ['gift-red', 'gift-green', 'sock'] as const;

export const GameLoop: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [gameMode, setGameMode] = useState<GameMode>('CATCH');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [rewardVoucher, setRewardVoucher] = useState<string>('');
  const [lives, setLives] = useState(3);
  const [isHit, setIsHit] = useState(false); // For visual shake feedback
  const [notification, setNotification] = useState<string | null>(null); // For Mode Switch Overlay
  
  // Ultimate State (Nhat Linh)
  const [isUltimateActive, setIsUltimateActive] = useState(false);

  // Input Visual State
  const [isLeftActive, setIsLeftActive] = useState(false);
  const [isRightActive, setIsRightActive] = useState(false);
  
  // Easter Egg State
  const [isCelebrating, setIsCelebrating] = useState(false);
  
  // Game State Refs (for high performance loop)
  const playerXRef = useRef(50 - PLAYER_WIDTH / 2);
  const itemsRef = useRef<FallingItem[]>([]);
  const projectilesRef = useRef<Projectile[]>([]); // SHOOT MODE projectiles
  const particlesRef = useRef<Particle[]>([]);
  const lastTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const speedMultiplierRef = useRef(1);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const gameModeRef = useRef<GameMode>('CATCH'); // Synced ref for loop
  
  // Spawning Logic Refs
  const lastSpawnTimeRef = useRef(0);
  const lastShotTimeRef = useRef(0); // For auto-fire
  
  // Combo Tracker
  const consecutiveRedGifts = useRef(0);

  // Input Statehea
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Render trigger
  const [, setTick] = useState(0);

  const startGame = () => {
    soundManager.resume();
    setScore(0);
    scoreRef.current = 0;
    setLives(3);
    livesRef.current = 3;
    itemsRef.current = [];
    particlesRef.current = [];
    projectilesRef.current = [];
    consecutiveRedGifts.current = 0;
    playerXRef.current = 50 - PLAYER_WIDTH / 2;
    speedMultiplierRef.current = 1;
    lastSpawnTimeRef.current = 0;
    
    // Default start mode
    setGameMode('CATCH');
    gameModeRef.current = 'CATCH';
    
    setGameState('PLAYING');
    setIsUltimateActive(false);
    lastTimeRef.current = performance.now();
  };

  const resumeGame = () => {
    soundManager.resume();
    // Reset time to prevent delta jumps
    lastTimeRef.current = performance.now();
    setGameState('PLAYING');
  };

  const quitToMain = () => {
    setGameState('START');
  };

  const pauseGame = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
    }
  };

  const spawnItem = () => {
    if (isUltimateActive) return; // Don't spawn during cutscene

    const id = Date.now() + Math.random();
    
    // Size between 6% and 10% of screen width
    const size = 6 + Math.random() * 4; 
    const points = Math.round(10 + (10 - (size - 6) * 2.5));

    // Smart Positioning
    let xPos = Math.random() * (100 - size);
    const lastItem = itemsRef.current[itemsRef.current.length - 1];
    
    if (lastItem && lastItem.y < 30) {
        const minX = Math.max(0, lastItem.x - 50);
        const maxX = Math.min(100 - size, lastItem.x + 50);
        xPos = minX + Math.random() * (maxX - minX);
    }

    // Determine type: 
    // 1% chance for Nhat Linh Special
    // 4% chance for Heart
    // 95% Normal
    let itemType: FallingItem['type'];
    const rand = Math.random();

    if (rand < 0.01) {
        itemType = 'special-nhat-linh';
    } else if (rand < 0.05) {
        itemType = 'heart';
    } else {
        itemType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    }

    const newItem: FallingItem = {
      id,
      x: xPos,
      y: -15, // Start above screen
      width: size,
      speed: (0.15 + Math.random() * 0.2) * speedMultiplierRef.current,
      rotation: Math.random() * 360,
      type: itemType,
      points: Math.min(20, Math.max(10, points))
    };

    itemsRef.current.push(newItem);
    lastSpawnTimeRef.current = Date.now();
  };

  const spawnProjectile = (x: number, y: number) => {
    const id = Date.now() + Math.random();
    soundManager.playShoot();
    projectilesRef.current.push({
      id,
      x: x - 1.5, // Centered (projectile width 3%)
      y: y - 5,
      width: 3,
      height: 3,
      speed: 0.8
    });
  };

  const spawnParticles = (x: number, y: number, itemType: string, points: number) => {
    const timestamp = Date.now();
    
    // 1. Floating Score Text (or Life +1)
    const isHeart = itemType === 'heart';
    const isSpecial = itemType === 'special-nhat-linh';
    
    let text = `+${points}`;
    let color = '#FFD700';

    if (isHeart) {
        text = '+1 ❤️';
        color = '#EC4899';
    } else if (isSpecial) {
        text = 'ULTIMATE!';
        color = '#3b82f6';
    }

    particlesRef.current.push({
        id: timestamp + Math.random(),
        x: x,
        y: y - 5,
        vx: 0,
        vy: -0.1, // Float up slowly
        life: 1.0,
        decay: 0.02,
        color: color, 
        size: isSpecial ? 8 : 5, 
        type: 'text',
        text: text
    });

    // 2. Confetti Burst
    // Determine colors based on item
    let colors = ['#FFFFFF'];
    if (itemType === 'gift-red') colors = ['#EF4444', '#FCD34D', '#FFFFFF']; // Red, Gold, White
    else if (itemType === 'gift-green') colors = ['#10B981', '#EF4444', '#FFFFFF']; // Green, Red, White
    else if (itemType === 'sock') colors = ['#DC2626', '#FFFFFF', '#FECACA']; // Red, White, Pink
    else if (itemType === 'heart') colors = ['#EC4899', '#FBCFE8', '#FFFFFF']; // Pinks
    else if (itemType === 'special-nhat-linh') colors = ['#3b82f6', '#FCD34D', '#FFFFFF', '#1e3a8a']; // Blue, Gold

    for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.2 + Math.random() * 0.4;
        
        particlesRef.current.push({
            id: timestamp + Math.random(),
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 0.2, // Initial upward velocity bias
            life: 1.0,
            decay: 0.015 + Math.random() * 0.02,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 1 + Math.random() * 1.5,
            type: 'confetti',
            rotation: Math.random() * 360,
            rotationSpeed: (Math.random() - 0.5) * 15
        });
    }
  };

  const addLife = (x: number, y: number) => {
      // Max 5 lives
      if (livesRef.current < 5) {
          livesRef.current += 1;
          setLives(livesRef.current);
      }
      soundManager.playLifeUp();
      spawnParticles(x, y, 'heart', 0);
  };

  const activateNhatLinhEffect = () => {
      soundManager.playUltimate();
      setIsUltimateActive(true);
      
      // Calculate bonus points from all active items
      let bonusPoints = 0;
      itemsRef.current.forEach(item => {
          if (item.type !== 'special-nhat-linh') {
              bonusPoints += item.points + 20; // Extra bonus for blast
              // Create a localized explosion for each
              spawnParticles(item.x + item.width/2, item.y + item.width/2, item.type, item.points);
          }
      });

      // Clear all items immediately
      itemsRef.current = [];
      projectilesRef.current = [];

      // Add points
      const oldScore = scoreRef.current;
      scoreRef.current = oldScore + bonusPoints + 100; // 100 base bonus
      setScore(scoreRef.current);

      // Maximize Lives
      livesRef.current = 5;
      setLives(5);

      // Reset after animation
      setTimeout(() => {
          setIsUltimateActive(false);
          lastSpawnTimeRef.current = Date.now() + 1000; // Delay spawning slightly
      }, 3000); // 3 seconds cutscene
  };

  const update = useCallback((time: number) => {
    // Allow loop in GAME_OVER to animate particles, but stop game logic
    if (gameState !== 'PLAYING' && gameState !== 'GAME_OVER') return;

    const deltaTime = time - lastTimeRef.current;
    lastTimeRef.current = time;
    
    // Time correction factor (target 60fps ~ 16.67ms)
    const dt = deltaTime / 16.67;

    // --- ALWAYS RUN: Particle System (Visuals) ---
    particlesRef.current = particlesRef.current.filter(p => {
        p.life -= p.decay * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        
        if (p.type === 'confetti') {
            p.vy += 0.02 * dt; // Gravity
            p.rotation = (p.rotation || 0) + (p.rotationSpeed || 0) * dt;
        }

        return p.life > 0;
    });

    // --- CONDITIONAL RUN: Game Logic (Gameplay) ---
    if (gameState === 'PLAYING' && !isUltimateActive) {
        const currentScore = scoreRef.current;
        const level = Math.floor(currentScore / 500);
        
        // 1. Mode Switching Logic (Every 500 points)
        const shouldBeShootMode = level % 2 !== 0; // 0-499: Catch, 500-999: Shoot, 1000-1499: Catch
        const expectedMode = shouldBeShootMode ? 'SHOOT' : 'CATCH';
        
        if (gameModeRef.current !== expectedMode) {
            gameModeRef.current = expectedMode;
            setGameMode(expectedMode);
            soundManager.playModeSwitch();
            
            // Show Notification
            setNotification(expectedMode === 'SHOOT' ? 'CHẾ ĐỘ BẮN QUÀ!' : 'CHẾ ĐỘ HỨNG QUÀ!');
            setTimeout(() => setNotification(null), 2000);

            // Clear items/projectiles to be fair during switch
            itemsRef.current = [];
            projectilesRef.current = [];
        }

        speedMultiplierRef.current = 1 + (level * 0.25);

        // 2. Player Movement
        const moveSpeed = 0.08 * deltaTime;
        if (keysPressed.current['ArrowLeft']) {
           playerXRef.current = Math.max(0, playerXRef.current - moveSpeed);
        }
        if (keysPressed.current['ArrowRight']) {
           playerXRef.current = Math.min(100 - PLAYER_WIDTH, playerXRef.current + moveSpeed);
        }

        const playerRect = {
           x: playerXRef.current,
           y: 82, // The cat is roughly at bottom 82% to 92%
           w: PLAYER_WIDTH,
           h: 8
        };

        // 3. SHOOT MODE: Auto Fire & Projectile Physics
        if (gameModeRef.current === 'SHOOT') {
            if (time - lastShotTimeRef.current > 300) { // Fire every 300ms
                spawnProjectile(playerRect.x + playerRect.w / 2, playerRect.y);
                lastShotTimeRef.current = time;
            }

            projectilesRef.current = projectilesRef.current.filter(p => {
                p.y -= p.speed * dt; // Move Up
                return p.y > -5; // Remove if off screen
            });
        }

        // 4. Item Movement & Logic
        let caughtPoints = 0;
        let gameOverTriggered = false;
        let lifeLost = false;
        
        itemsRef.current = itemsRef.current.filter(item => {
            // Move item
            item.y += item.speed * dt * 1.5;
            item.rotation += 1 * dt;

            // -- COLLISION CHECK 1: PLAYER VS ITEM --
            const playerCollision = 
                item.x < playerRect.x + playerRect.w &&
                item.x + item.width > playerRect.x &&
                item.y < playerRect.y + playerRect.h &&
                item.y + item.width > playerRect.y;

            if (playerCollision) {
                if (item.type === 'special-nhat-linh') {
                    activateNhatLinhEffect();
                    return false;
                }

                if (item.type === 'heart') {
                    // HEART: ALWAYS GOOD (ADD LIFE)
                    addLife(item.x + item.width/2, item.y + item.width/2);
                    return false; // Remove item
                }

                if (gameModeRef.current === 'CATCH') {
                    // CATCH MODE: GOOD
                    caughtPoints += item.points;
                    soundManager.playCatch();
                    spawnParticles(item.x + item.width/2, item.y + item.width/2, item.type, item.points);
                    
                    // Easter Egg Logic
                    if (item.type === 'gift-red') {
                        consecutiveRedGifts.current += 1;
                        if (consecutiveRedGifts.current === 5) {
                            consecutiveRedGifts.current = 0;
                            soundManager.playCombo();
                            setIsCelebrating(true);
                            particlesRef.current.push({
                                id: Date.now() + Math.random(),
                                x: playerRect.x + PLAYER_WIDTH/2,
                                y: playerRect.y - 15,
                                vx: 0,
                                vy: -0.2,
                                life: 1.5,
                                decay: 0.015,
                                color: '#EC4899',
                                size: 8,
                                type: 'text',
                                text: 'COMBO X5!'
                            });
                            setTimeout(() => setIsCelebrating(false), 1000);
                        }
                    } else {
                        consecutiveRedGifts.current = 0;
                    }
                    return false; // Remove item
                } else {
                    // SHOOT MODE: BAD (Collision = Damage)
                    lifeLost = true;
                    livesRef.current -= 1;
                    setLives(livesRef.current);
                    if (livesRef.current <= 0) gameOverTriggered = true;
                    return false; // Remove item after hit
                }
            }

            // -- COLLISION CHECK 2: PROJECTILE VS ITEM (SHOOT MODE ONLY) --
            if (gameModeRef.current === 'SHOOT') {
                let hitByProjectile = false;
                projectilesRef.current = projectilesRef.current.filter(proj => {
                    if (hitByProjectile) return true; // Already hit by another, keep projectile? No, usually one to one.

                    const bulletCollision = 
                        item.x < proj.x + proj.width &&
                        item.x + item.width > proj.x &&
                        item.y < proj.y + proj.height &&
                        item.y + item.width > proj.y;

                    if (bulletCollision) {
                        hitByProjectile = true;
                        return false; // Remove projectile
                    }
                    return true;
                });

                if (hitByProjectile) {
                    if (item.type === 'special-nhat-linh') {
                        activateNhatLinhEffect();
                        return false;
                    } else if (item.type === 'heart') {
                        // Shooting a heart also gives a life!
                        addLife(item.x + item.width/2, item.y + item.width/2);
                    } else {
                        caughtPoints += item.points;
                        soundManager.playCatch(); // Using same catch sound for "pop"
                        spawnParticles(item.x + item.width/2, item.y + item.width/2, item.type, item.points);
                    }
                    return false; // Remove item
                }
            }

            // -- CHECK OFF SCREEN --
            if (item.y > 105) {
                // If it's a heart or special, just ignore it (no penalty)
                if (item.type === 'heart' || item.type === 'special-nhat-linh') {
                    return false;
                }

                if (gameModeRef.current === 'CATCH') {
                    // CATCH MODE: MISS = BAD
                    lifeLost = true;
                    livesRef.current -= 1;
                    setLives(livesRef.current);
                    if (livesRef.current <= 0) gameOverTriggered = true;
                }
                // SHOOT MODE: MISS = OK
                return false;
            }

            return true;
        });

        if (gameOverTriggered) {
            setGameState('GAME_OVER');
            soundManager.playGameOver();
            return;
        }

        if (lifeLost && !gameOverTriggered) {
            soundManager.playMiss();
            // Trigger Shake Effect
            setIsHit(true);
            setTimeout(() => setIsHit(false), 300);
        }

        if (caughtPoints > 0) {
            const oldScore = scoreRef.current;
            const newScore = oldScore + caughtPoints;
            scoreRef.current = newScore;
            setScore(newScore);

            // Check Milestones for Vouchers (Every 500 points)
            const oldMilestone = Math.floor(oldScore / 500);
            const newMilestone = Math.floor(newScore / 500);

            if (newMilestone > oldMilestone) {
                const milestoneScore = newMilestone * 500;
                let reward = '';
                if (milestoneScore === 500) reward = '5K';
                else if (milestoneScore === 1000) reward = '10K';
                else if (milestoneScore === 1500) reward = '10%';
                else reward = '15%'; 

                setRewardVoucher(reward);
                setGameState('REWARD');
                soundManager.playReward(); // Play Sound
                return; // Pause the loop
            }
        }

        // 5. Random Spawning with Logic
        const now = Date.now();
        const timeSinceLastSpawn = now - lastSpawnTimeRef.current;
        const minSpawnDelay = 800 / speedMultiplierRef.current; 

        if (timeSinceLastSpawn > minSpawnDelay) {
            if (Math.random() < 0.05) {
                spawnItem();
            }
        }
    }

    setTick(t => t + 1); // Trigger render
    animationFrameRef.current = requestAnimationFrame(update);
  }, [gameState, isUltimateActive]);

  useEffect(() => {
    if (gameState === 'PLAYING' || gameState === 'GAME_OVER') {
      lastTimeRef.current = performance.now(); // Ensure we don't have a huge delta when restarting
      animationFrameRef.current = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(animationFrameRef.current);
    }
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [gameState, isUltimateActive, update]);

  // Trigger Confetti on Game Over
  useEffect(() => {
    if (gameState === 'GAME_OVER') {
        // Spawn a burst of festive confetti
        const colors = ['#EF4444', '#10B981', '#FCD34D', '#FFFFFF', '#DC2626']; // Red, Green, Gold, White
        
        for (let i = 0; i < 60; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.3 + Math.random() * 0.7;
            const x = 50 + (Math.random() - 0.5) * 40; // Spread across middle
            const y = 40 + (Math.random() - 0.5) * 20; // Middle-top area

            particlesRef.current.push({
                id: Date.now() + Math.random(),
                x: 50, // Start center
                y: 50,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.5, // Explode upwards initially
                life: 2.0 + Math.random(), // Longer life for game over
                decay: 0.005 + Math.random() * 0.01,
                color: colors[Math.floor(Math.random() * colors.length)],
                size: 1.5 + Math.random() * 2,
                type: 'confetti',
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 20
            });
        }
    }
  }, [gameState]);

  // Controls Logic - Consolidated Input Handling
  const handleInputStart = (direction: 'left' | 'right') => {
    if (direction === 'left') {
        keysPressed.current['ArrowLeft'] = true;
        setIsLeftActive(true);
    } else {
        keysPressed.current['ArrowRight'] = true;
        setIsRightActive(true);
    }
  };

  const handleInputEnd = (direction: 'left' | 'right') => {
    if (direction === 'left') {
        keysPressed.current['ArrowLeft'] = false;
        setIsLeftActive(false);
    } else {
        keysPressed.current['ArrowRight'] = false;
        setIsRightActive(false);
    }
  };

  // Input Listeners (Keyboard)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
          keysPressed.current['ArrowLeft'] = true;
          setIsLeftActive(true);
      }
      if (e.key === 'ArrowRight') {
          keysPressed.current['ArrowRight'] = true;
          setIsRightActive(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
          keysPressed.current['ArrowLeft'] = false;
          setIsLeftActive(false);
      }
      if (e.key === 'ArrowRight') {
          keysPressed.current['ArrowRight'] = false;
          setIsRightActive(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (gameState === 'GAME_OVER') {
      if (score > highScore) setHighScore(score);
    }
  }, [gameState, score, highScore]);

  // Render Helpers
  const renderItem = (item: FallingItem) => {
    const style = {
      left: `${item.x}%`,
      top: `${item.y}%`,
      width: `${item.width}%`,
      transform: `rotate(${item.rotation}deg)`
    };

    let Component;
    switch(item.type) {
        case 'gift-red': Component = GiftRed; break;
        case 'gift-green': Component = GiftGreen; break;
        case 'sock': Component = ChristmasSock; break;
        case 'heart': Component = HeartItem; break;
        case 'special-nhat-linh': Component = GoldenTicket; break;
        default: Component = GiftRed;
    }

    return (
      <div key={item.id} className="absolute z-10 will-change-transform" style={style}>
        <Component className="w-full h-full drop-shadow-md" />
      </div>
    );
  };

  const renderProjectile = (proj: Projectile) => (
      <div 
        key={proj.id}
        className="absolute z-10"
        style={{
            left: `${proj.x}%`,
            top: `${proj.y}%`,
            width: `${proj.width}%`,
            height: 'auto'
        }}
      >
          <YarnBall className="w-full h-full drop-shadow-sm animate-spin" />
      </div>
  );

  const renderParticle = (p: Particle) => {
    if (p.type === 'text') {
        const isCombo = p.text?.startsWith('COMBO');
        const isLife = p.text?.includes('❤️');
        const isUltimate = p.text === 'ULTIMATE!';
        return (
            <div 
                key={p.id} 
                className={`absolute z-20 font-black drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)] pointer-events-none whitespace-nowrap 
                ${isCombo ? 'text-pink-500 animate-pulse' : isLife ? 'text-pink-600' : isUltimate ? 'text-yellow-300 animate-bounce' : 'text-yellow-400'}`}
                style={{
                    left: `${p.x}%`,
                    top: `${p.y}%`,
                    opacity: p.life,
                    transform: `translate(-50%, -50%) scale(${1 + (1 - p.life)})`,
                    fontSize: isCombo ? '2.5rem' : isLife ? '2rem' : isUltimate ? '3rem' : '2rem',
                    textShadow: '-1px -1px 0 #FFF, 1px -1px 0 #FFF, -1px 1px 0 #FFF, 1px 1px 0 #FFF'
                }}
            >
                {p.text}
            </div>
        );
    }
    return (
        <div 
            key={p.id}
            className="absolute z-20 pointer-events-none rounded-sm"
            style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                width: '8px',
                height: '8px',
                backgroundColor: p.color,
                opacity: p.life,
                transform: `translate(-50%, -50%) rotate(${p.rotation}deg)`,
            }}
        />
    );
  };

  // Progress Bar Logic
  const windowSize = 1500;
  const currentWindowIndex = Math.floor(score / windowSize);
  const windowStart = currentWindowIndex * windowSize;
  const progressPercent = Math.min(100, Math.max(0, ((score - windowStart) / windowSize) * 100));
  
  const milestones = [1, 2, 3].map(i => {
      const value = windowStart + (i * 500);
      return {
          value,
          percent: (i * 500 / windowSize) * 100,
          visible: score < value // Hide if reached
      };
  });

  return (
    <div className={`relative w-full h-full max-w-md mx-auto bg-slate-50/90 overflow-hidden shadow-2xl flex flex-col snow-bg ring-8 ring-red-500 ring-offset-4 ring-offset-green-700 rounded-lg isolate select-none transition-transform ${isHit ? 'translate-x-1 translate-y-1' : ''}`}>
      
      {/* Animation Styles */}
      <style>{`
        @keyframes flip-jump {
          0% { transform: scale(1) translateY(0); }
          40% { transform: scale(1.1) translateY(-20%) rotate(10deg); }
          50% { transform: scale(1.1) translateY(-25%) rotate(180deg); }
          60% { transform: scale(1.1) translateY(-20%) rotate(350deg); }
          100% { transform: scale(1) translateY(0) rotate(360deg); }
        }
        .animate-flip-jump {
          animation: flip-jump 0.8s ease-in-out;
        }
        @keyframes notif-slide {
            0% { transform: translateY(-100%) scale(0.5); opacity: 0; }
            20% { transform: translateY(0) scale(1.1); opacity: 1; }
            80% { transform: translateY(0) scale(1); opacity: 1; }
            100% { transform: translateY(-50%) scale(0.8); opacity: 0; }
        }
        @keyframes zoom-spin {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.2) rotate(360deg); opacity: 1; }
          100% { transform: scale(1) rotate(720deg); opacity: 1; }
        }
      `}</style>

      {/* --- HUD --- */}
      <div className="absolute top-4 left-4 right-4 z-30 pointer-events-none flex flex-col gap-3">
        {/* Top Row: Score/Lives + Pause */}
        <div className="flex justify-between items-start">
            <div className="flex flex-col gap-2 pointer-events-auto">
                {/* Score & Lives Group */}
                <div className="flex items-center gap-2">
                    {/* Score */}
                    <div className="bg-green-700/90 backdrop-blur border-2 border-yellow-400 rounded-2xl px-4 py-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]">
                        <p className="text-xs uppercase font-bold text-green-100">Điểm (Score)</p>
                        <p className="text-2xl font-black text-white leading-none drop-shadow-md">{score}</p>
                    </div>

                    {/* Lives (Hearts) */}
                    <div className="flex bg-white/50 backdrop-blur rounded-2xl px-2 py-2 border-2 border-red-200">
                        {/* We use Array(5) to show up to 5 slots, as lives can increase now */}
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`${i < lives ? 'block' : 'hidden'} animate-in zoom-in duration-300`}>
                                <Heart 
                                    className={`w-6 h-6 transition-colors duration-300 text-red-600 fill-red-600 drop-shadow-sm`} 
                                />
                            </div>
                        ))}
                    </div>
                </div>
                
                {highScore > 0 && (
                <div className="bg-yellow-400/90 backdrop-blur border-2 border-orange-600 rounded-2xl px-4 py-2 shadow-sm scale-90 origin-top-left w-fit">
                    <p className="text-[10px] uppercase font-bold text-yellow-900">Cao nhất</p>
                    <p className="text-lg font-black text-yellow-900 leading-none">{highScore}</p>
                </div>
                )}
            </div>

            {/* Mode Indicator & Pause */}
            <div className="flex flex-col gap-2 items-end">
                {gameState === 'PLAYING' && (
                    <button 
                        onClick={pauseGame}
                        className="pointer-events-auto bg-red-600 hover:bg-red-700 text-white border-2 border-red-800 rounded-xl p-3 shadow-md active:translate-y-1 transition-all"
                    >
                        <Pause className="w-6 h-6" />
                    </button>
                )}
                
                {/* Mode Icon */}
                <div className="bg-white/80 rounded-full p-2 border-2 border-blue-200 shadow-sm">
                    {gameMode === 'CATCH' ? (
                        <Gift className="w-6 h-6 text-green-600" />
                    ) : (
                        <Crosshair className="w-6 h-6 text-pink-600 animate-pulse" />
                    )}
                </div>
            </div>
        </div>

        {/* Progress Bar Row */}
        {gameState !== 'START' && (
            <div className="w-full relative h-10 mt-1 pointer-events-auto">
                 {/* Bar Background */}
                <div className="absolute top-1/2 -translate-y-1/2 w-full h-5 bg-black/20 backdrop-blur-md rounded-full border-2 border-white/50 overflow-hidden">
                     {/* Fill */}
                     <div 
                        className="h-full bg-gradient-to-r from-red-500 via-white to-red-500 bg-[length:20px_20px] rounded-full transition-all duration-300 ease-out relative" 
                        style={{ width: `${progressPercent}%` }}
                    >
                    </div>
                </div>

                {/* Milestones */}
                {milestones.map((m) => (
                    <div 
                        key={m.value}
                        className={`absolute top-1/2 -translate-y-1/2 transition-all duration-300 ${m.visible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
                        style={{ left: `${m.percent}%`, transform: 'translate(-50%, -50%)' }}
                    >
                        <div className="flex flex-col items-center">
                            <div className="relative">
                                <div className="absolute inset-0 bg-yellow-300 rounded-full blur-[4px] animate-pulse"></div>
                                <div className="relative bg-white border-2 border-green-600 rounded-full p-1 shadow-sm">
                                    <Gift className="w-4 h-4 text-red-600" />
                                </div>
                            </div>
                            <span className="text-[10px] font-bold text-green-800 bg-white/90 px-1 rounded-md mt-1 shadow-sm border border-green-200">
                                {m.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* --- Mode Switch Notification Overlay --- */}
      {notification && (
          <div className="absolute top-[20%] left-0 right-0 z-40 flex justify-center pointer-events-none">
              <div 
                className="bg-black/70 backdrop-blur-md text-white text-3xl font-black py-4 px-8 rounded-2xl border-4 border-yellow-400 shadow-2xl uppercase tracking-wider text-center"
                style={{ animation: 'notif-slide 2s ease-in-out forwards' }}
              >
                  {notification}
                  <div className="text-sm font-normal normal-case text-yellow-200 mt-1">
                      {gameMode === 'SHOOT' ? '(Tiêu diệt quà! / Shoot gifts!)' : '(Hứng lấy quà! / Catch gifts!)'}
                  </div>
              </div>
          </div>
      )}

      {/* --- NHAT LINH ULTIMATE CUTSCENE OVERLAY --- */}
      {isUltimateActive && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center pointer-events-none overflow-hidden">
              {/* Dark BG */}
              <div className="absolute inset-0 bg-black/70 backdrop-blur-md animate-in fade-in duration-300"></div>
              
              {/* Explosion Background */}
              <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-[150%] h-[150%] bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full blur-3xl opacity-30 animate-pulse"></div>
              </div>

              {/* Huge Nhat Linh Character */}
              <div 
                  className="relative z-10 w-64 h-64"
                  style={{ animation: 'zoom-spin 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
              >
                   <div className="absolute inset-0 bg-white/50 rounded-full blur-xl animate-pulse"></div>
                   <NhatLinhHero className="w-full h-full drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" />
              </div>

              {/* Text */}
              <div className="relative z-10 mt-8 text-center animate-in slide-in-from-bottom duration-700">
                  <h2 className="text-4xl font-black text-white italic tracking-tighter drop-shadow-[0_4px_0_#000]">NHẬT LINH</h2>
                  <h3 className="text-2xl font-bold text-yellow-400 uppercase drop-shadow-[0_2px_0_#000]">Đến rồi đây!</h3>
                  <div className="mt-4 bg-white/20 backdrop-blur rounded-xl px-4 py-2 border border-white/40">
                      <p className="text-lg font-bold text-white">+MAX MÁU</p>
                      <p className="text-lg font-bold text-white">+BONUS ĐIỂM</p>
                  </div>
              </div>
          </div>
      )}

      {/* --- Game Area --- */}
      <div className="flex-grow relative overflow-hidden pointer-events-none">
        
        {itemsRef.current.map(renderItem)}
        {projectilesRef.current.map(renderProjectile)}
        {particlesRef.current.map(renderParticle)}

        {/* Player (Cami) */}
        <div 
          className="absolute bottom-[10%] z-20 transition-transform duration-75 ease-linear will-change-transform"
          style={{
            left: `${playerXRef.current}%`,
            width: `${PLAYER_WIDTH}%`,
            height: 'auto'
          }}
        >
          <div className={`origin-center ${isCelebrating ? 'animate-flip-jump' : ''}`}>
             <CamiCat className="w-full h-full drop-shadow-xl" />
          </div>
        </div>

        {/* Ground/Floor Decor */}
        <div className="absolute bottom-0 w-full h-[15%] bg-white border-t-4 border-blue-50 rounded-t-[60%] scale-110 shadow-inner"></div>
        <div className="absolute bottom-0 w-full h-[10%] bg-blue-50/50 border-t-4 border-blue-100 rounded-t-[40%] scale-125 translate-y-2"></div>

      </div>

      {/* --- Controls --- */}
      <div className="h-24 bg-white/80 backdrop-blur-md z-30 flex gap-4 p-4 border-t-4 border-red-200 touch-none select-none">
        <button 
          className={`flex-1 rounded-2xl border-b-4 flex items-center justify-center shadow-sm group touch-none select-none transition-all duration-75 ${
              isLeftActive 
              ? 'bg-green-200 border-green-500 translate-y-1 scale-95 shadow-none' 
              : 'bg-green-50 border-green-200 hover:bg-green-100'
          }`}
          onContextMenu={(e) => e.preventDefault()}
          onTouchStart={(e) => { e.preventDefault(); handleInputStart('left'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleInputEnd('left'); }}
          onMouseDown={() => handleInputStart('left')}
          onMouseUp={() => handleInputEnd('left')}
          onMouseLeave={() => handleInputEnd('left')}
        >
           <ArrowLeft className={`w-12 h-12 transition-transform duration-75 ${isLeftActive ? 'text-green-800 scale-90' : 'text-green-700'}`} />
        </button>
        <button 
          className={`flex-1 rounded-2xl border-b-4 flex items-center justify-center shadow-sm group touch-none select-none transition-all duration-75 ${
              isRightActive 
              ? 'bg-green-200 border-green-500 translate-y-1 scale-95 shadow-none' 
              : 'bg-green-50 border-green-200 hover:bg-green-100'
          }`}
          onContextMenu={(e) => e.preventDefault()}
          onTouchStart={(e) => { e.preventDefault(); handleInputStart('right'); }}
          onTouchEnd={(e) => { e.preventDefault(); handleInputEnd('right'); }}
          onMouseDown={() => handleInputStart('right')}
          onMouseUp={() => handleInputEnd('right')}
          onMouseLeave={() => handleInputEnd('right')}
        >
            <ArrowRight className={`w-12 h-12 transition-transform duration-75 ${isRightActive ? 'text-green-800 scale-90' : 'text-green-700'}`} />
        </button>
      </div>

      {/* --- Overlays (Start, Pause, Reward, Game Over) --- */}
      
      {/* Start Screen */}
      {gameState === 'START' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-900/40 backdrop-blur-sm p-6 text-center">
          <div className="animate-bounce mb-8">
            <Logo />
          </div>
          
          <div className="bg-white p-6 rounded-3xl border-4 border-red-600 shadow-[8px_8px_0px_0px_#166534] max-w-xs w-full">
            <h2 className="text-xl font-bold mb-4 text-green-800">Cách chơi (How to play)</h2>
            <div className="text-left text-sm text-gray-600 mb-6 space-y-2">
                <p>🎁 <strong>Chế độ Hứng:</strong> Hứng quà để ghi điểm.</p>
                <p>🧶 <strong>Chế độ Bắn:</strong> Di chuyển để tiêu diệt quà.</p>
                <p>❤️ <strong>Trái tim:</strong> Hồi 1 mạng.</p>
                <p>🌟 <strong>Nhật Linh:</strong> Siêu phẩm nổ tung tất cả & Hồi full máu!</p>
            </div>

            <button 
              onClick={startGame}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xl font-black py-4 rounded-xl border-b-4 border-red-900 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Play fill="currentColor" /> BẮT ĐẦU
            </button>
          </div>
        </div>
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <div className="bg-white p-6 rounded-3xl border-4 border-green-600 shadow-[8px_8px_0px_0px_#B91C1C] max-w-xs w-full text-center relative">
                 <div className="absolute -top-6 -left-6 transform -rotate-12">
                    <GiftGreen className="w-16 h-16" />
                 </div>

                <h2 className="text-3xl font-black text-red-600 mb-6 uppercase tracking-wider">TẠM DỪNG</h2>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={resumeGame}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-3 rounded-xl border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        <Play className="w-5 h-5" fill="currentColor" /> TIẾP TỤC
                    </button>
                    <button 
                        onClick={quitToMain}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg font-bold py-3 rounded-xl border-b-4 border-gray-300 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        <Home className="w-5 h-5" /> MÀN HÌNH CHÍNH
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Reward Modal */}
      {gameState === 'REWARD' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-md p-6">
            <div className="bg-red-50 p-1 rounded-3xl border-4 border-yellow-500 shadow-[0px_0px_30px_rgba(255,215,0,0.5)] max-w-xs w-full relative animate-in zoom-in duration-300">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-yellow-400 rounded-full border-4 border-white flex items-center justify-center shadow-lg z-10">
                    <Gift className="w-12 h-12 text-red-600" />
                </div>
                
                <div className="bg-white rounded-[20px] p-6 pt-12 text-center border-2 border-red-100 overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[radial-gradient(circle,#FF0000_2px,transparent_2px)] bg-[length:20px_20px]"></div>

                    <h2 className="text-2xl font-black text-red-600 mb-2 uppercase">Chúc mừng!</h2>
                    <p className="text-gray-600 font-medium mb-4 leading-relaxed">
                        Bạn đã trúng thưởng Voucher mua sắm giảm giá <br/>
                        <span className="text-3xl font-black text-yellow-500 block my-2 drop-shadow-sm">{rewardVoucher}</span>
                        tại <span className="font-bold text-gray-800">Cami Kids HD</span>
                    </p>

                    <button 
                        onClick={resumeGame}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-lg font-black py-3 rounded-xl border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all shadow-md"
                    >
                        NHẬN & TIẾP TỤC
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Game Over Screen */}
      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-sm p-6 text-center">
          <div className="bg-white p-8 rounded-3xl border-4 border-red-700 shadow-[8px_8px_0px_0px_#FFF] max-w-xs w-full relative overflow-hidden">
            
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-100 rounded-full blur-xl opacity-50"></div>

            <h2 className="text-3xl font-black text-gray-800 mb-2">GAME OVER!</h2>
            <p className="text-gray-500 font-bold mb-6">Bạn đã làm rất tốt!</p>
            
            <div className="bg-green-50 rounded-2xl p-4 mb-6 border-2 border-green-200">
               <p className="text-sm text-green-600 font-bold uppercase tracking-wider">Tổng điểm</p>
               <p className="text-5xl font-black text-green-700">{score}</p>
            </div>

            <div className="flex flex-col gap-3">
                <button 
                onClick={startGame}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-xl font-black py-4 rounded-xl border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                <RotateCcw /> CHƠI LẠI
                </button>
                <button 
                onClick={quitToMain}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg font-bold py-3 rounded-xl border-b-4 border-gray-300 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                <Home className="w-5 h-5" /> MÀN HÌNH CHÍNH
                </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};