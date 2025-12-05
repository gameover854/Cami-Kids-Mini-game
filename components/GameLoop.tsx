
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { GameState, GameMode, FallingItem, PLAYER_WIDTH, Particle, Projectile } from '../types';
import { CamiCat, GiftRed, GiftGreen, ChristmasSock, Logo, YarnBall, HeartItem, GoldenTicket, NhatLinhHero, ChristmasTree, Snowman, CandyCane, SnowflakeItem, Ornament, GingerbreadMan, Snowball, AngryEyes } from './Assets';
import { Play, RotateCcw, ArrowLeft, ArrowRight, Pause, Home, Gift, Heart, Crosshair, Dna, X, Volume2, VolumeX, Snowflake, ShoppingBag, ExternalLink, History, Copy, CheckCircle2, Grid3x3, Circle, Sword } from 'lucide-react';
import { soundManager } from '../SoundManager';

const ITEM_TYPES = ['gift-red', 'gift-green', 'sock', 'snowflake', 'ornament', 'gingerbread'] as const;

// Lucky Wheel Config with Christmas Colors
// Red (#DC2626), Green (#16A34A), Gold (#FBBF24), Silver (#94A3B8), Ice (#38BDF8)
const WHEEL_SEGMENTS = [
  { label: '5K', value: '5K', color: '#DC2626', weight: 30, textColor: '#FFFFFF' },   // Red (Santa)
  { label: '10K', value: '10K', color: '#16A34A', weight: 25, textColor: '#FFFFFF' }, // Green (Tree)
  { label: '10%', value: '10%', color: '#FBBF24', weight: 20, textColor: '#92400E' }, // Gold (Star)
  { label: '1 Cái nịt', value: '1 Cái nịt', color: '#94A3B8', weight: 15, textColor: '#FFFFFF', isSmall: true }, // Silver (Coal/Snow)
  { label: '15%', value: '15%', color: '#38BDF8', weight: 8, textColor: '#FFFFFF' },  // Ice Blue (Frost)
  { label: '50%', value: '50%', color: '#BE185D', weight: 2, textColor: '#FFFFFF' },  // Berry Red (Rare)
];

const SHOP_URL = "https://www.facebook.com/profile.php?id=61576193061980";
const MAX_SPINS = 3; // Daily limit

interface VoucherRecord {
    code: string;
    value: string;
    date: string;
    expiryDate?: string; // Added expiration date
}

// Lightweight Snowfall Component
const SnowfallOverlay = React.memo(() => {
  // Generate flakes once to avoid re-renders impacting performance
  const flakes = useMemo(() => {
    return [...Array(40)].map((_, i) => ({
      id: i,
      left: Math.random() * 100 + '%',
      animationDuration: 8 + Math.random() * 10 + 's', // Slow, gentle fall (8-18s)
      animationDelay: -(Math.random() * 10) + 's', // Start at different times
      opacity: 0.2 + Math.random() * 0.4, // Subtle opacity
      size: 4 + Math.random() * 6 + 'px', // Varying sizes
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {flakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute bg-white rounded-full opacity-60"
          style={{
            left: flake.left,
            width: flake.size,
            height: flake.size,
            top: '-20px', // Start above screen
            opacity: flake.opacity,
            animation: `snow-fall ${flake.animationDuration} linear infinite`,
            animationDelay: flake.animationDelay,
          }}
        />
      ))}
    </div>
  );
});

export const GameLoop: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('START');
  const [gameMode, setGameMode] = useState<GameMode>('CATCH');
  const [score, setScore] = useState(0);
  
  // Initialize HighScore from LocalStorage
  const [highScore, setHighScore] = useState(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('cami_highscore');
          return saved ? parseInt(saved, 10) : 0;
      }
      return 0;
  });

  // Initialize Voucher History from LocalStorage
  const [voucherHistory, setVoucherHistory] = useState<VoucherRecord[]>(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('cami_vouchers');
          return saved ? JSON.parse(saved) : [];
      }
      return [];
  });

  // Initialize Daily Spin Count from LocalStorage
  const [spinsToday, setSpinsToday] = useState(() => {
      if (typeof window !== 'undefined') {
          const today = new Date().toLocaleDateString('vi-VN');
          const savedDate = localStorage.getItem('cami_spin_date');
          const savedCount = localStorage.getItem('cami_spin_count');

          if (savedDate !== today) {
              // Reset if it's a new day
              return 0;
          }
          return savedCount ? parseInt(savedCount, 10) : 0;
      }
      return 0;
  });
  
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const [rewardVoucher, setRewardVoucher] = useState<string>('');
  const [lives, setLives] = useState(3);
  const [isHit, setIsHit] = useState(false); // For visual shake feedback
  const [notification, setNotification] = useState<string | null>(null); // For Mode Switch Overlay
  const [modeSwitchEffect, setModeSwitchEffect] = useState<GameMode | null>(null); // For Visual Flash
  
  // Audio State
  const [isMuted, setIsMuted] = useState(false);

  // Ultimate State (Nhat Linh)
  const [isUltimateActive, setIsUltimateActive] = useState(false);

  // Boss Battle State
  const [bossHp, setBossHp] = useState(100);
  const bossMaxHp = 100;
  const bossPositionRef = useRef({ x: 50, y: 15 }); // Centered top
  const bossDirectionRef = useRef(1); // 1 = right, -1 = left
  const bossProjectilesRef = useRef<Projectile[]>([]);
  const lastBossAttackTimeRef = useRef(0);
  const bossStateRef = useRef<'IDLE' | 'HIT'>('IDLE');

  // Lucky Wheel State
  const [wheelRotation, setWheelRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelResult, setWheelResult] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState<string | null>(null);

  // Tic Tac Toe State
  const [tttBoard, setTttBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [tttIsPlayerTurn, setTttIsPlayerTurn] = useState(true);
  const [tttWinner, setTttWinner] = useState<string | null>(null); // 'X', 'O', 'DRAW', or null

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

  const toggleMute = () => {
      const newState = !isMuted;
      setIsMuted(newState);
      soundManager.toggleMute(newState);
  };

  const generateVoucherCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed similar looking chars
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const copyToClipboard = (code: string) => {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      soundManager.playCatch(); // Use a sound for feedback
      setTimeout(() => setCopiedCode(null), 2000);
  };

  const startGame = () => {
    soundManager.resume();
    soundManager.startMusic();
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

  const startBossBattle = () => {
      soundManager.resume();
      soundManager.startMusic();
      setScore(0);
      scoreRef.current = 0;
      setLives(5); // More lives for boss
      livesRef.current = 5;
      
      setBossHp(bossMaxHp);
      bossPositionRef.current = { x: 50, y: 15 };
      bossProjectilesRef.current = [];
      projectilesRef.current = []; // Player ammo
      itemsRef.current = []; // Clear falling items
      particlesRef.current = [];

      setGameMode('SHOOT');
      gameModeRef.current = 'SHOOT'; // Player shoots in boss battle
      
      setGameState('BOSS_BATTLE');
      lastTimeRef.current = performance.now();
  };

  const resumeGame = () => {
    soundManager.resume();
    soundManager.startMusic();
    // Reset time to prevent delta jumps
    lastTimeRef.current = performance.now();
    
    // Resume to correct state
    if (gameState === 'PAUSED') {
        // If we were in boss battle, go back there? 
        // Logic currently assumes we pause from PLAYING. 
        // If we pause from Boss Battle, we need to know.
        // For simplicity, if we paused, we go back to PLAYING unless we add a specific PAUSED_BOSS state.
        // Or we check a ref. For now, assuming standard PLAYING.
        setGameState('PLAYING');
    }
  };

  const quitToMain = () => {
    soundManager.stopMusic();
    setGameState('START');
  };

  const pauseGame = () => {
    if (gameState === 'PLAYING' || gameState === 'BOSS_BATTLE') {
      soundManager.stopMusic();
      setGameState('PAUSED');
    }
  };

  const openLuckyWheel = () => {
    soundManager.stopMusic();
    setGameState('LUCKY_WHEEL');
    setWheelResult(null);
    setVoucherCode(null);
    setWheelRotation(0);
  };
  
  const openTicTacToe = () => {
    soundManager.stopMusic();
    setGameState('TIC_TAC_TOE');
    setTttBoard(Array(9).fill(null));
    setTttIsPlayerTurn(true);
    setTttWinner(null);
  };

  const handleShopNow = () => {
    window.open(SHOP_URL, '_blank');
  };

  const spinWheel = () => {
    if (isSpinning || spinsToday >= MAX_SPINS) return;
    
    // Increment and save spin count immediately
    const newCount = spinsToday + 1;
    setSpinsToday(newCount);
    localStorage.setItem('cami_spin_count', newCount.toString());
    localStorage.setItem('cami_spin_date', new Date().toLocaleDateString('vi-VN'));

    soundManager.resume();
    setIsSpinning(true);
    setWheelResult(null);
    setVoucherCode(null);

    // 1. Determine Result based on Weights
    const totalWeight = WHEEL_SEGMENTS.reduce((sum, seg) => sum + seg.weight, 0);
    let randomWeight = Math.random() * totalWeight;
    let selectedIndex = 0;
    
    for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
        randomWeight -= WHEEL_SEGMENTS[i].weight;
        if (randomWeight <= 0) {
            selectedIndex = i;
            break;
        }
    }

    // 2. Calculate Rotation to land on this segment
    // Segment i covers angles: [i * segAngle, (i+1) * segAngle] relative to wheel start.
    // The pointer is at 0 (Top).
    // The part of wheel under pointer is: normalizedAngle = (360 - (rotation % 360)) % 360
    // We want normalizedAngle to be inside segment i.
    
    const segmentAngle = 360 / WHEEL_SEGMENTS.length;
    const startAngle = selectedIndex * segmentAngle;
    
    // Pick a random angle within the segment (with 10% padding to avoid edges)
    const padding = segmentAngle * 0.1;
    const targetOffset = padding + Math.random() * (segmentAngle - 2 * padding);
    const targetNormalizedAngle = startAngle + targetOffset;
    
    // Calculate required final rotation
    // finalRotation = 360 * spins + (360 - targetNormalizedAngle)
    const minSpins = 5;
    const extraSpins = Math.floor(Math.random() * 4); // 0-3 extra spins
    const spins = minSpins + extraSpins;
    const finalRotation = (spins * 360) + (360 - targetNormalizedAngle);
    
    setWheelRotation(finalRotation);

    setTimeout(() => {
        const result = WHEEL_SEGMENTS[selectedIndex];
        setWheelResult(result.value);
        setIsSpinning(false);
        
        if (result.value === '1 Cái nịt') {
            soundManager.playMiss();
        } else {
            soundManager.playReward();
            const code = generateVoucherCode();
            setVoucherCode(code);
            
            // Date Calculation
            const now = new Date();
            const expiryDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // Add 2 days (48h)

            // Save to LocalStorage History
            const newRecord: VoucherRecord = {
                code: code,
                value: result.value,
                date: now.toLocaleDateString('vi-VN'),
                expiryDate: expiryDate.toLocaleDateString('vi-VN')
            };
            const updatedHistory = [newRecord, ...voucherHistory];
            setVoucherHistory(updatedHistory);
            localStorage.setItem('cami_vouchers', JSON.stringify(updatedHistory));

            // Confetti for win
            const colors = ['#EF4444', '#FCD34D', '#3B82F6', '#EC4899'];
            for (let i = 0; i < 30; i++) {
                particlesRef.current.push({
                        id: Date.now() + Math.random(),
                        x: 50,
                        y: 50,
                        vx: (Math.random() - 0.5) * 0.8,
                        vy: (Math.random() - 0.5) * 0.8,
                        life: 1.5,
                        decay: 0.01,
                        color: colors[Math.floor(Math.random() * colors.length)],
                        size: 2 + Math.random() * 2,
                        type: 'confetti',
                        rotation: Math.random() * 360
                });
            }
            // Force render for particles
            setTick(t => t + 1);
        }

    }, 4000); // Duration matches CSS transition
  };

  // --- TIC TAC TOE LOGIC ---

  const checkTTTWinner = (board: (string | null)[]) => {
      const lines = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
          [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
          [0, 4, 8], [2, 4, 6]             // Diagonals
      ];
      for (let i = 0; i < lines.length; i++) {
          const [a, b, c] = lines[i];
          if (board[a] && board[a] === board[b] && board[a] === board[c]) {
              return board[a];
          }
      }
      return board.includes(null) ? null : 'DRAW';
  };

  const computerMove = useCallback(() => {
    if (tttWinner || tttIsPlayerTurn) return;

    // AI Delay for realism
    setTimeout(() => {
        const board = [...tttBoard];
        let move = -1;

        // 1. Check if AI can win immediately
        for (let i = 0; i < 9; i++) {
            if (!board[i]) {
                board[i] = 'O';
                if (checkTTTWinner(board) === 'O') {
                    move = i;
                    break;
                }
                board[i] = null; // Backtrack
            }
        }

        // 2. Check if Player is about to win (Block)
        if (move === -1) {
            for (let i = 0; i < 9; i++) {
                if (!board[i]) {
                    board[i] = 'X';
                    if (checkTTTWinner(board) === 'X') {
                        move = i;
                        break;
                    }
                    board[i] = null; // Backtrack
                }
            }
        }

        // 3. Take Center if available
        if (move === -1 && !board[4]) {
            move = 4;
        }

        // 4. Random available move
        if (move === -1) {
            const available = board.map((val, idx) => val === null ? idx : null).filter(val => val !== null) as number[];
            if (available.length > 0) {
                move = available[Math.floor(Math.random() * available.length)];
            }
        }

        if (move !== -1) {
            const newBoard = [...tttBoard];
            newBoard[move] = 'O';
            setTttBoard(newBoard);
            soundManager.playCatch(); // Sound effect for move
            
            const winner = checkTTTWinner(newBoard);
            if (winner) {
                setTttWinner(winner);
                if (winner === 'O') soundManager.playMiss(); // Lose sound
                else if (winner === 'DRAW') soundManager.playModeSwitch();
            } else {
                setTttIsPlayerTurn(true);
            }
        }

    }, 600);
  }, [tttBoard, tttIsPlayerTurn, tttWinner]);

  // Effect to trigger AI move
  useEffect(() => {
    if (gameState === 'TIC_TAC_TOE' && !tttIsPlayerTurn && !tttWinner) {
        computerMove();
    }
  }, [gameState, tttIsPlayerTurn, tttWinner, computerMove]);

  const handleTTTClick = (index: number) => {
      if (tttBoard[index] || !tttIsPlayerTurn || tttWinner) return;

      const newBoard = [...tttBoard];
      newBoard[index] = 'X';
      setTttBoard(newBoard);
      soundManager.playShoot(); // Player move sound

      const winner = checkTTTWinner(newBoard);
      if (winner) {
          setTttWinner(winner);
          if (winner === 'X') {
              soundManager.playReward();
               // Confetti for win
               const colors = ['#EF4444', '#FCD34D', '#3B82F6', '#EC4899'];
               for (let i = 0; i < 30; i++) {
                   particlesRef.current.push({
                           id: Date.now() + Math.random(),
                           x: 50,
                           y: 50,
                           vx: (Math.random() - 0.5) * 0.8,
                           vy: (Math.random() - 0.5) * 0.8,
                           life: 1.5,
                           decay: 0.01,
                           color: colors[Math.floor(Math.random() * colors.length)],
                           size: 2 + Math.random() * 2,
                           type: 'confetti',
                           rotation: Math.random() * 360
                   });
               }
               setTick(t => t + 1);
          }
          else if (winner === 'DRAW') soundManager.playModeSwitch();
      } else {
          setTttIsPlayerTurn(false);
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
    const isBossHit = itemType === 'boss-hit';
    
    let text = `+${points}`;
    let color = '#FFD700';

    if (isHeart) {
        text = '+1 ❤️';
        color = '#EC4899';
    } else if (isSpecial) {
        text = 'ULTIMATE!';
        color = '#3b82f6';
    } else if (isBossHit) {
        text = 'HIT!';
        color = '#EF4444';
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
    else if (itemType === 'snowflake') colors = ['#38BDF8', '#E0F2FE', '#FFFFFF']; // Blue, Light Blue, White
    else if (itemType === 'ornament') colors = ['#EAB308', '#A855F7', '#FDE047']; // Gold, Purple
    else if (itemType === 'gingerbread') colors = ['#D97706', '#92400E', '#FFFFFF']; // Brown, Dark Brown, White
    else if (itemType === 'boss-hit') colors = ['#FFFFFF', '#E0F2FE', '#38BDF8']; // Snow puff

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
    // Also allow in LUCKY_WHEEL and TIC_TAC_TOE for confetti
    if (gameState !== 'PLAYING' && gameState !== 'GAME_OVER' && gameState !== 'LUCKY_WHEEL' && gameState !== 'TIC_TAC_TOE' && gameState !== 'BOSS_BATTLE') return;

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

    const currentScore = scoreRef.current;
    
    // --- BOSS BATTLE LOGIC ---
    if (gameState === 'BOSS_BATTLE') {
        const playerRect = {
           x: playerXRef.current,
           y: 82, 
           w: PLAYER_WIDTH,
           h: 8
        };

        // 1. Move Player
        const moveSpeed = 0.08 * deltaTime;
        if (keysPressed.current['ArrowLeft']) {
           playerXRef.current = Math.max(0, playerXRef.current - moveSpeed);
        }
        if (keysPressed.current['ArrowRight']) {
           playerXRef.current = Math.min(100 - PLAYER_WIDTH, playerXRef.current + moveSpeed);
        }

        // 2. Boss Movement (Sinusoidal or bouncing)
        const bossSpeed = 0.05 * dt;
        bossPositionRef.current.x += bossDirectionRef.current * bossSpeed;
        if (bossPositionRef.current.x > 80 || bossPositionRef.current.x < 0) {
            bossDirectionRef.current *= -1; // Reverse
        }

        // 3. Boss Attack
        // Attack rate increases as HP decreases
        const attackInterval = 1000 + (bossHp / bossMaxHp) * 1000; // 1s to 2s
        if (time - lastBossAttackTimeRef.current > attackInterval) {
            lastBossAttackTimeRef.current = time;
            // Spawn Snowball
            bossProjectilesRef.current.push({
                id: Date.now(),
                x: bossPositionRef.current.x + 10, // Boss centerish
                y: bossPositionRef.current.y + 20, // Bottom of boss
                width: 5,
                height: 5,
                speed: 0.5
            });
            soundManager.playShoot();
        }

        // 4. Update Boss Projectiles
        let playerHit = false;
        bossProjectilesRef.current = bossProjectilesRef.current.filter(p => {
            p.y += p.speed * dt;
            
            // Hit Player?
            const hit = 
                p.x < playerRect.x + playerRect.w &&
                p.x + p.width > playerRect.x &&
                p.y < playerRect.y + playerRect.h &&
                p.y + p.height > playerRect.y;

            if (hit) {
                playerHit = true;
                return false;
            }

            return p.y < 100; // Remove if off screen
        });

        if (playerHit) {
             soundManager.playMiss();
             livesRef.current -= 1;
             setLives(livesRef.current);
             setIsHit(true);
             setTimeout(() => setIsHit(false), 300);
             if (livesRef.current <= 0) {
                 setGameState('GAME_OVER');
                 soundManager.playGameOver();
                 return;
             }
        }

        // 5. Player Shooting (Auto Fire)
        if (time - lastShotTimeRef.current > 250) { // Faster fire rate for boss
            spawnProjectile(playerRect.x + playerRect.w / 2, playerRect.y);
            lastShotTimeRef.current = time;
        }

        // 6. Update Player Projectiles & Check Boss Hit
        let bossHit = false;
        projectilesRef.current = projectilesRef.current.filter(p => {
            p.y -= p.speed * dt;
            
            // Boss Hitbox (Approx)
            const bossRect = {
                x: bossPositionRef.current.x,
                y: bossPositionRef.current.y,
                w: 20, // roughly size of boss svg
                h: 20
            };

            const hit = 
                p.x < bossRect.x + bossRect.w &&
                p.x + p.width > bossRect.x &&
                p.y < bossRect.y + bossRect.h &&
                p.y + p.height > bossRect.y;

            if (hit) {
                bossHit = true;
                return false;
            }
            return p.y > -5;
        });

        if (bossHit) {
            // Damage Boss
            const dmg = 2; // 50 hits to kill
            const newHp = Math.max(0, bossHp - dmg);
            setBossHp(newHp);
            soundManager.playCatch(); // Hit sound
            spawnParticles(bossPositionRef.current.x + 10, bossPositionRef.current.y + 10, 'boss-hit', 0);
            
            // Visual Feedback
            bossStateRef.current = 'HIT';
            setTimeout(() => bossStateRef.current = 'IDLE', 100);

            if (newHp <= 0) {
                // VICTORY
                soundManager.stopMusic();
                // Massive Bonus Score
                const bonus = 5000;
                setScore(score + bonus);
                scoreRef.current += bonus;
                setGameState('REWARD');
                setRewardVoucher('HỘP QUÀ KIM CƯƠNG'); // Special item
                soundManager.playReward();
                soundManager.playUltimate();
                return;
            }
        }

    } 
    // --- NORMAL GAME LOGIC ---
    else if (gameState === 'PLAYING' && !isUltimateActive) {
        const level = Math.floor(currentScore / 500);
        
        // 1. Mode Switching Logic (Every 500 points)
        const shouldBeShootMode = level % 2 !== 0; // 0-499: Catch, 500-999: Shoot, 1000-1499: Catch
        const expectedMode = shouldBeShootMode ? 'SHOOT' : 'CATCH';
        
        if (gameModeRef.current !== expectedMode) {
            gameModeRef.current = expectedMode;
            setGameMode(expectedMode);
            soundManager.playModeSwitch();
            
            // Trigger Flash Effect
            setModeSwitchEffect(expectedMode);
            setTimeout(() => setModeSwitchEffect(null), 1000);
            
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
            soundManager.stopMusic();
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
                soundManager.stopMusic();
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
  }, [gameState, isUltimateActive, bossHp]);

  useEffect(() => {
    if (gameState === 'PLAYING' || gameState === 'GAME_OVER' || gameState === 'LUCKY_WHEEL' || gameState === 'TIC_TAC_TOE' || gameState === 'BOSS_BATTLE') {
      lastTimeRef.current = performance.now(); // Ensure we don't have a huge delta when restarting
      animationFrameRef.current = requestAnimationFrame(update);
    } else {
      cancelAnimationFrame(animationFrameRef.current);
    }
    return () => {
        cancelAnimationFrame(animationFrameRef.current);
        soundManager.stopMusic(); // Stop music on unmount
    };
  }, [gameState, isUltimateActive, update]);

  // Trigger Confetti on Game Over & Save Highscore
  useEffect(() => {
    if (gameState === 'GAME_OVER') {
        // Save HighScore persistence
        if (score > highScore) {
            setHighScore(score);
            localStorage.setItem('cami_highscore', score.toString());
        }

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
  }, [gameState, score, highScore]);

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
        case 'snowflake': Component = SnowflakeItem; break;
        case 'ornament': Component = Ornament; break;
        case 'gingerbread': Component = GingerbreadMan; break;
        case 'special-nhat-linh': Component = GoldenTicket; break;
        default: Component = GiftRed;
    }

    // Move drop-shadow to the parent div to avoid filter conflict with brightness animation
    return (
      <div key={item.id} className="absolute z-10 will-change-transform drop-shadow-md" style={style}>
        <Component className="w-full h-full item-pulse" />
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

  const renderBossProjectile = (proj: Projectile) => (
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
        <Snowball className="w-full h-full drop-shadow-sm animate-spin" />
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
    <div className={`relative w-full h-full max-w-md mx-auto bg-[#fff6ea] overflow-hidden shadow-2xl flex flex-col ring-8 ring-red-500 ring-offset-4 ring-offset-green-700 rounded-lg isolate select-none transition-transform ${isHit ? 'translate-x-1 translate-y-1' : ''}`}>
      
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
        @keyframes breathing {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        @keyframes pulse-item {
            0%, 100% { transform: scale(1); filter: brightness(100%); }
            50% { transform: scale(1.15); filter: brightness(125%); }
        }
        .item-pulse {
            animation: pulse-item 1s ease-in-out infinite;
        }
        @keyframes float-up {
            0% { transform: translateY(0) scale(0.8); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
        }
        @keyframes snow-fall {
            0% { transform: translateY(0) translateX(0); }
            50% { transform: translateY(50vh) translateX(10px); }
            100% { transform: translateY(105vh) translateX(-5px); }
        }
        .christmas-pattern {
            background-image: radial-gradient(#166534 10%, transparent 11%), radial-gradient(#166534 10%, transparent 11%);
            background-size: 20px 20px;
            background-position: 0 0, 10px 10px;
            opacity: 0.1;
        }
      `}</style>
      
      {/* Background Weather Effect (Subtle Snowfall) */}
      <SnowfallOverlay />

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

            {/* Mode Indicator & Pause & Volume */}
            <div className="flex flex-col gap-2 items-end pointer-events-auto">
                 {/* Mute Button */}
                 <button 
                    onClick={toggleMute}
                    className="bg-white/90 hover:bg-white text-gray-700 border-2 border-gray-200 rounded-xl p-2 shadow-sm active:scale-95 transition-all"
                >
                    {isMuted ? <VolumeX className="w-5 h-5 text-gray-400" /> : <Volume2 className="w-5 h-5 text-green-600" />}
                </button>

                {(gameState === 'PLAYING' || gameState === 'BOSS_BATTLE') && (
                    <button 
                        onClick={pauseGame}
                        className="bg-red-600 hover:bg-red-700 text-white border-2 border-red-800 rounded-xl p-3 shadow-md active:translate-y-1 transition-all"
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

        {/* BOSS HP BAR */}
        {gameState === 'BOSS_BATTLE' && (
             <div className="w-full mt-2 relative pointer-events-auto">
                 <div className="bg-white/90 rounded-xl p-2 border-4 border-red-600 shadow-lg flex flex-col items-center">
                     <p className="text-xs font-black uppercase text-red-600 mb-1">NGƯỜI TUYẾT KHỔNG LỒ</p>
                     <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden border border-gray-400 relative">
                         <div 
                             className="h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-300"
                             style={{ width: `${(bossHp / bossMaxHp) * 100}%` }}
                         ></div>
                     </div>
                     <p className="text-[10px] font-bold text-gray-500 mt-1">{bossHp}/{bossMaxHp}</p>
                 </div>
             </div>
        )}

        {/* Progress Bar Row */}
        {gameState !== 'START' && gameState !== 'BOSS_BATTLE' && (
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

      {/* Mode Switch Visual Cue (Flash Overlay) */}
      <div className={`absolute inset-0 z-[25] pointer-events-none transition-opacity duration-300 ease-in-out ${modeSwitchEffect ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`w-full h-full border-[16px] ${
              modeSwitchEffect === 'SHOOT' 
              ? 'bg-red-600/20 border-red-600 animate-pulse' 
              : 'bg-green-600/20 border-green-500 animate-pulse'
          }`}></div>
      </div>

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
        
        {/* Render Confetti even in Lucky Wheel and TTT mode */}
        {particlesRef.current.map(renderParticle)}

        {/* Hide Game Elements in Lucky Wheel/TTT Mode (except particles) */}
        {gameState !== 'LUCKY_WHEEL' && gameState !== 'TIC_TAC_TOE' && (
            <>
                {itemsRef.current.map(renderItem)}
                {projectilesRef.current.map(renderProjectile)}
                {bossProjectilesRef.current.map(renderBossProjectile)}

                {/* BOSS RENDER */}
                {gameState === 'BOSS_BATTLE' && (
                    <div 
                        className="absolute z-10 will-change-transform drop-shadow-2xl transition-transform duration-100"
                        style={{
                            left: `${bossPositionRef.current.x}%`,
                            top: `${bossPositionRef.current.y}%`,
                            width: '20%',
                            height: 'auto',
                            transform: `translate(-50%, 0) scale(${bossStateRef.current === 'HIT' ? 1.1 : 1})`
                        }}
                    >
                        <div className="relative w-full h-full">
                            <Snowman className={`w-full h-full ${bossStateRef.current === 'HIT' ? 'brightness-50 sepia saturate-200 hue-rotate-[-50deg]' : ''}`} />
                            {bossStateRef.current === 'HIT' && (
                                <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-[80%] opacity-80 animate-pulse">
                                    <AngryEyes className="w-full" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {/* --- ACTIVE PLAYER (STANDING CAT) --- */}
                {/* Only show when NOT in START mode */}
                {gameState !== 'START' && (
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
                )}

                {/* Ground/Floor Decor */}
                <div className="absolute bottom-0 w-full h-[15%] bg-white border-t-4 border-blue-50 rounded-t-[60%] scale-110 shadow-inner"></div>
                <div className="absolute bottom-0 w-full h-[10%] bg-blue-50/50 border-t-4 border-blue-100 rounded-t-[40%] scale-125 translate-y-2"></div>
            </>
        )}

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

      {/* --- Overlays (Start, Pause, Reward, Game Over, Lucky Wheel, TicTacToe) --- */}
      
      {/* Start Screen */}
      {gameState === 'START' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-red-900/40 backdrop-blur-sm p-6 text-center overflow-hidden">
          
          {/* Header Menu Bar: Tic-Tac-Toe | Lucky Wheel | History */}
          <div className="absolute top-16 left-0 right-0 z-40 flex justify-center items-end gap-3 px-4">
              
              {/* Tic Tac Toe Button */}
              <button onClick={openTicTacToe} className="group flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95">
                <div className="w-14 h-14 rounded-2xl bg-green-500 border-2 border-white shadow-lg flex items-center justify-center relative box-border group-hover:bg-green-400">
                    <Grid3x3 className="w-8 h-8 text-white" />
                </div>
                <div className="bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-sm uppercase tracking-wide">
                    Cờ Caro
                </div>
              </button>

              {/* Lucky Wheel Button (Featured Center) */}
              <button onClick={openLuckyWheel} className="group flex flex-col items-center gap-1 -translate-y-2 transition-transform hover:scale-105 active:scale-95 mx-2">
                <div className="relative w-20 h-20 rounded-full border-4 border-white shadow-[0_8px_20px_rgba(0,0,0,0.3)] bg-white overflow-hidden box-border">
                     {/* Spinning Gradient */}
                     <div className="w-full h-full animate-[spin_4s_linear_infinite] group-hover:animate-[spin_1s_linear_infinite]" 
                          style={{
                              background: 'conic-gradient(#ef4444 0deg 60deg, #fbbf24 60deg 120deg, #10b981 120deg 180deg, #3b82f6 180deg 240deg, #f472b6 240deg 300deg, #a78bfa 300deg 360deg)'
                          }}
                     ></div>
                     {/* Center Cap */}
                     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-sm z-10"></div>
                     {/* Pointer */}
                     <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-red-600 z-20"></div>
                </div>
                <div className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full border-2 border-white shadow-md uppercase tracking-wide relative z-10">
                    Vòng Quay
                </div>
              </button>

              {/* History Button */}
              <button onClick={() => setShowHistoryModal(true)} className="group flex flex-col items-center gap-1 transition-transform hover:scale-105 active:scale-95">
                 <div className="w-14 h-14 rounded-2xl bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center relative box-border group-hover:bg-blue-400">
                     <History className="w-8 h-8 text-white" />
                 </div>
                 <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-white shadow-sm uppercase tracking-wide">
                    Kho Quà
                 </div>
              </button>

          </div>

          <div className="animate-bounce mb-8 mt-32 relative z-20">
            <Logo />
          </div>
          
          <div className="bg-white p-6 rounded-3xl border-4 border-red-600 shadow-[8px_8px_0px_0px_#166534] max-w-xs w-full relative z-20 flex flex-col gap-3">
            <h2 className="text-xl font-bold mb-2 text-green-800">Chọn Chế Độ Chơi</h2>

            <button 
              onClick={startGame}
              className="w-full bg-red-600 hover:bg-red-700 text-white text-xl font-black py-4 rounded-xl border-b-4 border-red-900 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Play fill="currentColor" /> HỨNG QUÀ
            </button>

            <button 
              onClick={startBossBattle}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xl font-black py-4 rounded-xl border-b-4 border-orange-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
            >
              <Sword className="w-6 h-6" /> ĐẤU BOSS
            </button>
          </div>
        </div>
      )}
      
      {/* History Modal */}
      {showHistoryModal && (
          <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/70 backdrop-blur-md p-6 animate-in fade-in duration-200">
             <div className="w-full max-w-sm bg-white rounded-3xl p-6 border-4 border-blue-500 shadow-2xl relative max-h-[80%] flex flex-col">
                 <button 
                    onClick={() => setShowHistoryModal(false)}
                    className="absolute -top-4 -right-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full border-2 border-white shadow-md transition-all active:scale-95"
                 >
                     <X className="w-6 h-6"/>
                 </button>

                 <h2 className="text-2xl font-black text-blue-600 text-center mb-4 uppercase">Kho Quà Của Bạn</h2>
                 
                 <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                     {voucherHistory.length === 0 ? (
                         <div className="text-center py-10 text-gray-400">
                             <Gift className="w-16 h-16 mx-auto mb-2 opacity-50" />
                             <p>Bạn chưa có mã quà tặng nào.</p>
                             <p className="text-sm">Hãy quay Vòng Quay May Mắn nhé!</p>
                         </div>
                     ) : (
                         voucherHistory.map((record, index) => (
                             <div key={index} className="bg-blue-50 border-2 border-blue-200 rounded-xl p-3 flex justify-between items-center group hover:bg-blue-100 transition-colors">
                                 <div className="flex flex-col">
                                     <p className="text-xs font-bold text-gray-400">{record.date}</p>
                                     {record.expiryDate && (
                                         <p className="text-[10px] font-bold text-orange-500">HSD: {record.expiryDate}</p>
                                     )}
                                     <p className="font-bold text-gray-700 text-sm mt-1">Voucher: <span className="text-red-500">{record.value}</span></p>
                                     <p className="font-mono font-black text-lg text-blue-700">{record.code}</p>
                                 </div>
                                 <button 
                                    onClick={() => copyToClipboard(record.code)}
                                    className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 active:bg-gray-100 hover:text-blue-600 transition-colors relative"
                                 >
                                    {copiedCode === record.code ? <CheckCircle2 className="w-5 h-5 text-green-500"/> : <Copy className="w-5 h-5"/>}
                                 </button>
                             </div>
                         ))
                     )}
                 </div>
                 
                 <button 
                    onClick={handleShopNow}
                    className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"
                 >
                    <ShoppingBag className="w-5 h-5"/> DÙNG VOUCHER NGAY
                 </button>
             </div>
          </div>
      )}

      {/* TIC TAC TOE GAME OVERLAY */}
      {gameState === 'TIC_TAC_TOE' && (
          <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md p-6">
              <div className="bg-[#fff6ea] rounded-3xl p-6 border-4 border-green-600 shadow-[0_0_40px_rgba(22,101,52,0.4)] flex flex-col items-center relative max-w-sm w-full animate-in zoom-in duration-300">
                   
                   {/* Header */}
                   <div className="text-center mb-6">
                       <h2 className="text-2xl font-black text-green-700 uppercase">Cờ Caro</h2>
                       <p className="text-gray-500 text-xs font-bold">Bạn (X) vs Cami Cat (O)</p>
                   </div>

                   {/* Game Board */}
                   <div className="grid grid-cols-3 gap-3 bg-green-800 p-3 rounded-xl shadow-inner mb-6">
                       {tttBoard.map((cell, idx) => (
                           <button
                               key={idx}
                               onClick={() => handleTTTClick(idx)}
                               className={`w-16 h-16 rounded-lg bg-white shadow-sm flex items-center justify-center text-4xl font-black transition-all active:scale-95
                                   ${!cell && !tttWinner && tttIsPlayerTurn ? 'hover:bg-gray-50 cursor-pointer' : ''}
                                   ${cell === 'X' ? 'text-red-500' : 'text-green-600'}
                               `}
                           >
                               {cell === 'X' && <CandyCane className="w-10 h-10" />}
                               {cell === 'O' && <div className="w-10 h-10 rounded-full border-4 border-green-600 flex items-center justify-center"><ChristmasTree className="w-6 h-6"/></div>}
                           </button>
                       ))}
                   </div>

                   {/* Status Message */}
                   <div className="mb-6 h-8 text-center font-bold">
                       {tttWinner ? (
                           <span className={`text-xl ${tttWinner === 'X' ? 'text-red-500 animate-bounce' : tttWinner === 'O' ? 'text-gray-600' : 'text-blue-500'}`}>
                               {tttWinner === 'X' ? 'BẠN THẮNG RỒI! 🎉' : tttWinner === 'O' ? 'CAMI THẮNG RỒI! 😿' : 'HÒA RỒI! 🤝'}
                           </span>
                       ) : (
                           <span className="text-gray-600 flex items-center gap-2 justify-center">
                               {tttIsPlayerTurn ? (
                                   <>Đến lượt bạn <CandyCane className="w-4 h-4 text-red-500"/></>
                               ) : (
                                   <>Cami đang nghĩ... <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce"></div></>
                               )}
                           </span>
                       )}
                   </div>

                   {/* Controls */}
                   <div className="flex flex-col gap-2 w-full">
                        <button 
                            onClick={() => {
                                setTttBoard(Array(9).fill(null));
                                setTttIsPlayerTurn(true);
                                setTttWinner(null);
                                soundManager.playModeSwitch();
                            }}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-md border-b-4 border-green-800 active:border-b-0 active:translate-y-1"
                        >
                            CHƠI LẠI
                        </button>
                        <button 
                            onClick={quitToMain}
                            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3 rounded-xl border-b-4 border-gray-300 active:border-b-0 active:translate-y-1"
                        >
                            THOÁT
                        </button>
                   </div>
              </div>
          </div>
      )}

      {/* Lucky Wheel Screen - Christmas Themed */}
      {gameState === 'LUCKY_WHEEL' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md p-6">
             {/* Decorative Background for Modal Context */}
             <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle,#DC2626_2px,transparent_3px)] bg-[length:30px_30px]"></div>

             <div className="w-full max-w-xs relative animate-in zoom-in duration-300">
                 {/* Close Button */}
                 <button 
                    onClick={quitToMain}
                    className="absolute -top-14 right-0 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full border border-white/50 backdrop-blur-sm transition-all active:scale-95"
                 >
                     <X className="w-8 h-8"/>
                 </button>

                 {/* Main Card */}
                 <div className="bg-[#fff6ea] rounded-3xl p-6 pt-8 border-4 border-red-600 shadow-[0_0_40px_rgba(220,38,38,0.4)] flex flex-col items-center relative overflow-hidden">
                    {/* Corner Decorations */}
                    <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none opacity-20">
                         <div className="christmas-pattern w-full h-full"></div>
                    </div>
                    <div className="absolute top-2 left-2 pointer-events-none">
                         <ChristmasTree className="w-10 h-10 -rotate-12 opacity-80"/>
                    </div>
                    <div className="absolute top-2 right-2 pointer-events-none">
                         <Snowman className="w-8 h-8 rotate-12 opacity-80"/>
                    </div>

                    <h2 className="text-2xl font-black text-red-600 mb-6 uppercase text-center tracking-wide leading-tight drop-shadow-sm">
                        <span className="text-green-700 text-lg block mb-1 font-bold">Giáng Sinh</span>
                        Vòng Quay May Mắn
                    </h2>

                    {/* The Wheel Container */}
                    <div className="relative w-64 h-64 mb-8">
                        {/* Outer Wreath/Border */}
                        <div className="absolute inset-[-12px] rounded-full border-[6px] border-dashed border-green-600 opacity-60 animate-spin-slow" style={{ animationDuration: '20s' }}></div>

                        {/* Pointer */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                             <div className="w-8 h-10 bg-gradient-to-b from-yellow-400 to-yellow-600 clip-path-polygon-[50%_100%,0_0,100%_0] drop-shadow-lg flex items-start justify-center pt-1">
                                 <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                             </div>
                        </div>

                        {/* Rotating Wheel */}
                        <div 
                            className="w-full h-full rounded-full border-8 border-red-700 shadow-inner relative overflow-hidden transition-transform cubic-bezier(0.25, 0.1, 0.25, 1)"
                            style={{ 
                                transform: `rotate(${wheelRotation}deg)`,
                                transitionDuration: isSpinning ? '4s' : '0s',
                                background: `conic-gradient(
                                    ${WHEEL_SEGMENTS.map((seg, i) => {
                                        const start = (i * 360) / WHEEL_SEGMENTS.length;
                                        const end = ((i + 1) * 360) / WHEEL_SEGMENTS.length;
                                        return `${seg.color} ${start}deg ${end}deg`;
                                    }).join(', ')}
                                )`
                            }}
                        >
                            {/* Segment Dividers */}
                            {WHEEL_SEGMENTS.map((_, i) => (
                                <div 
                                    key={`line-${i}`}
                                    className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-white/20 origin-bottom"
                                    style={{ transform: `translateX(-50%) rotate(${(i * 360) / WHEEL_SEGMENTS.length}deg)` }}
                                />
                            ))}

                            {/* Labels */}
                            {WHEEL_SEGMENTS.map((seg, i) => {
                                const angle = (360 / WHEEL_SEGMENTS.length) * i + (360 / WHEEL_SEGMENTS.length) / 2;
                                return (
                                    <div 
                                        key={i}
                                        className="absolute top-1/2 left-1/2 flex items-center justify-center text-center font-black select-none"
                                        style={{ 
                                            transform: `translate(-50%, -50%) rotate(${angle}deg) translateY(-80px) rotate(90deg)`,
                                            color: seg.textColor,
                                            width: '100px',
                                            textShadow: '0px 1px 2px rgba(0,0,0,0.3)',
                                            fontSize: seg.isSmall ? '12px' : '18px',
                                            lineHeight: '1.1'
                                        }}
                                    >
                                        <span>{seg.label}</span>
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Center Cap - Snowflake Style */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-white rounded-full border-4 border-yellow-500 shadow-lg z-10 flex items-center justify-center">
                            <Snowflake className="w-8 h-8 text-blue-400" />
                        </div>
                    </div>

                    <button 
                        onClick={spinWheel}
                        disabled={isSpinning || !!wheelResult || spinsToday >= MAX_SPINS}
                        className={`w-full text-xl font-black py-4 rounded-xl border-b-4 flex items-center justify-center gap-2 transition-all relative overflow-hidden group ${
                            isSpinning || !!wheelResult || spinsToday >= MAX_SPINS
                            ? 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white border-red-800 active:border-b-0 active:translate-y-1 shadow-lg'
                        }`}
                    >
                        {/* Snow overlay on button */}
                        {!isSpinning && !wheelResult && spinsToday < MAX_SPINS && (
                             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/snow.png')] opacity-30 pointer-events-none"></div>
                        )}
                        {spinsToday >= MAX_SPINS 
                            ? 'HẾT LƯỢT HÔM NAY' 
                            : (isSpinning ? 'ĐANG QUAY...' : `QUAY NGAY (${MAX_SPINS - spinsToday})`)
                        }
                    </button>
                    
                    {/* Limit Message */}
                    {spinsToday >= MAX_SPINS && (
                        <div className="mt-3 bg-red-100 border-l-4 border-red-500 text-red-700 p-2 text-sm font-bold text-center rounded animate-in fade-in slide-in-from-bottom-2">
                            <p>Bạn đã hết 3 lượt quay hôm nay.</p>
                            <p className="text-xs font-normal">Quay lại ngày mai để nhận thêm nhé!</p>
                        </div>
                    )}
                 </div>
             </div>

             {/* Result Modal - Christmas Themed */}
             {wheelResult && (
                 <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center bg-black/60 p-6 animate-in fade-in duration-300">
                    <div className="bg-[#fff6ea] p-1 rounded-3xl border-4 border-green-600 shadow-[0_0_50px_rgba(255,255,255,0.4)] animate-in zoom-in duration-500 relative max-w-sm w-full">
                        {/* Holly decoration */}
                        <div className="absolute -top-4 -right-4 w-12 h-12 bg-red-600 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                             <div className="w-8 h-8 bg-green-700 rotate-45 transform"></div>
                        </div>

                        <div className="bg-white/50 backdrop-blur-sm rounded-[20px] p-8 text-center border-2 border-dashed border-red-300">
                            {wheelResult === '1 Cái nịt' ? (
                                <>
                                    <h3 className="text-xl font-bold text-gray-500 uppercase mb-2">Rất tiếc!</h3>
                                    <div className="text-4xl font-black text-gray-600 my-4 drop-shadow-md flex flex-col items-center">
                                         <span className="text-6xl mb-2">🌑</span>
                                         Còn đúng {wheelResult}
                                    </div>
                                    <p className="text-sm text-gray-400 mb-6 font-bold">Chúc bạn may mắn lần sau</p>
                                    <button 
                                        onClick={quitToMain}
                                        className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-xl shadow-md border-b-4 border-gray-700 active:border-b-0 active:translate-y-1"
                                    >
                                        ĐÓNG
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-xl font-bold text-green-700 uppercase mb-1">Chúc mừng Giáng Sinh!</h3>
                                    <p className="text-sm font-semibold text-gray-500">Bạn nhận được Voucher</p>
                                    
                                    <div className="text-6xl font-black text-red-600 my-2 drop-shadow-md scale-110">{wheelResult}</div>
                                    
                                    {voucherCode && (
                                        <div className="bg-yellow-50 border-2 border-dashed border-yellow-400 p-2 rounded-lg mb-4">
                                            <p className="text-xs text-yellow-800 font-bold uppercase mb-1">Mã Quà Tặng:</p>
                                            <p className="text-2xl font-mono font-black text-gray-800 tracking-widest">{voucherCode}</p>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-2">
                                        <button 
                                            onClick={handleShopNow}
                                            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-bold py-3 rounded-xl shadow-md border-b-4 border-red-800 active:border-b-0 active:translate-y-1 flex items-center justify-center gap-2"
                                        >
                                            <ShoppingBag className="w-5 h-5"/> MUA SẮM NGAY <ExternalLink className="w-4 h-4 opacity-70"/>
                                        </button>

                                        <button 
                                            onClick={quitToMain}
                                            className="w-full bg-white hover:bg-gray-50 text-gray-500 font-bold py-2 rounded-xl border-2 border-transparent hover:border-gray-200 transition-all text-sm"
                                        >
                                            VỀ MÀN HÌNH CHÍNH
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                 </div>
             )}
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
                        {rewardVoucher === 'HỘP QUÀ KIM CƯƠNG' ? 
                            'Bạn đã tiêu diệt BOSS và nhận được phần thưởng đặc biệt!' :
                            'Bạn đã trúng thưởng Voucher mua sắm giảm giá'
                        }
                        <br />
                        <span className="text-2xl font-black text-red-600 block mt-2">{rewardVoucher}</span>
                    </p>
                    <div className="flex gap-2">
                        {rewardVoucher !== 'HỘP QUÀ KIM CƯƠNG' && (
                            <button 
                                onClick={handleShopNow}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl border-b-4 border-red-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-1"
                            >
                                <ShoppingBag className="w-5 h-5" /> NHẬN QUÀ
                            </button>
                        )}
                        <button 
                            onClick={quitToMain}
                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl border-b-4 border-gray-300 active:border-b-0 active:translate-y-1 transition-all"
                        >
                            {rewardVoucher === 'HỘP QUÀ KIM CƯƠNG' ? 'VỀ TRANG CHỦ' : 'TIẾP TỤC'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Game Over Modal */}
      {gameState === 'GAME_OVER' && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm p-6">
            <div className="bg-white p-6 rounded-3xl border-4 border-gray-700 shadow-[8px_8px_0px_0px_#000] max-w-xs w-full text-center relative">
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 transform rotate-12">
                   <ChristmasSock className="w-20 h-20 drop-shadow-lg" />
                </div>

                <h2 className="text-3xl font-black text-gray-800 mb-2 mt-8 uppercase">HẾT GIỜ!</h2>
                <div className="text-5xl font-black text-red-600 mb-2 drop-shadow-md">{score}</div>
                <p className="text-gray-500 font-bold mb-6 uppercase text-xs tracking-widest">Điểm của bạn</p>
                
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={startGame}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-3 rounded-xl border-b-4 border-green-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                    >
                        <RotateCcw className="w-5 h-5" /> CHƠI LẠI
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
