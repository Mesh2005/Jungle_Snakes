import { useState, useEffect, useCallback, useRef } from 'react';
import { useAudio } from '../context/AudioContext';
import type { RoundData } from './usePrefetchRound';

type Position = { x: number; y: number };
type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';
type GameStatus = 'IDLE' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

interface Food {
    id: string;
    x: number;
    y: number;
    value: number;
    isCorrect: boolean;
    isTreasure?: boolean;
}

export type PowerupType = 'extra_life' | 'time_bonus' | 'shield' | 'invisible' | 'double_score' | 'bounce_back' | 'slow';

export interface Powerup {
    id: string;
    x: number;
    y: number;
    type: PowerupType;
    spawnAt: number; // Date.now() for despawn after 8s
}

const POWERUP_TYPES: PowerupType[] = ['extra_life', 'time_bonus', 'shield', 'invisible', 'double_score', 'bounce_back', 'slow'];

const POWERUP_DURATION_MS = {
    invisible: 5000,
    double_score: 8000,
    slow: 6000
};
const POWERUP_SPAWN_INTERVAL_MS = 15000; // spawn every 15s
const POWERUP_LIFETIME_MS = 8000;        // despawn after 8s if not eaten

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }, { x: 10, y: 11 }, { x: 10, y: 12 }];

// Speed based on difficulty (lower = faster)
const getSpeedForDifficulty = (difficulty: 'easy' | 'medium' | 'hard'): number => {
    switch (difficulty) {
        case 'easy': return 160;   // Slow but not sluggish
        case 'medium': return 110;  // Balanced
        case 'hard': return 85;     // Challenging but responsive
        default: return 110;
    }
};

export const useSnakeGame = (
    currentRound: RoundData | null,
    advanceRound: () => void,
    saveStats?: (score: number, streak: number, foodEaten: number, secondsPlayed: number) => void, // Callback to save when game ends
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
) => {
    const { playVFX } = useAudio();
    const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
    const [direction, setDirection] = useState<Direction>('UP');
    const [foods, setFoods] = useState<Food[]>([]);
    const [status, setStatus] = useState<GameStatus>('IDLE');
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [highStreak, setHighStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10);
    const [lives, setLives] = useState(100); // treated as heart % now
    const [powerups, setPowerups] = useState<Powerup[]>([]);
    const [invisibleUntil, setInvisibleUntil] = useState(0);
    const [slowUntil, setSlowUntil] = useState(0);
    const [roundVariant, setRoundVariant] = useState<'normal' | 'storm' | 'treasure'>('normal');
    const [foodEaten, setFoodEaten] = useState(0);
    const sessionStartTimeRef = useRef(0);

    // Refs for loop state to avoid closure staleness
    const directionRef = useRef<Direction>('UP');
    const livesRef = useRef(100); // heart % mirror
    const lastLoseLifeAtRef = useRef(0); // throttle: only one life loss per 2 seconds
    const shieldRef = useRef(false);     // shield: absorbs one wrong-eat/timeout or wall/tail hit
    const bounceBackRef = useRef(false); // bounce_back: one wall hit reverses direction
    const doubleScoreUntilRef = useRef(0);
    const snakeRef = useRef<Position[]>(INITIAL_SNAKE);
    const foodsRef = useRef<Food[]>([]);
    const nextDirectionRef = useRef<Direction>('UP'); // Buffer for next tick
    const gameLoopRef = useRef<number | null>(null);
    const timerRef = useRef<number | null>(null);

    // Initialize round (spawn foods)
    const initRound = useCallback(() => {
        if (!currentRound) return;
        const round = currentRound;

        // Decide round variant (chance-based)
        let variant: 'normal' | 'storm' | 'treasure' = 'normal';
        const roll = Math.random();
        if (roll < 0.1) {
            variant = 'storm';
        } else if (roll < 0.2) {
            variant = 'treasure';
        }
        setRoundVariant(variant);

        // Spawn 4 foods
        const newFoods: Food[] = [];
        const occupied = new Set(snake.map(s => `${s.x},${s.y}`));

        const getRandomPos = () => {
            let x: number, y: number, key: string;
            do {
                x = Math.floor(Math.random() * GRID_SIZE);
                y = Math.floor(Math.random() * GRID_SIZE);
                key = `${x},${y}`;
            } while (occupied.has(key) || newFoods.some(f => f.x === x && f.y === y));
            return { x, y };
        };

        // Correct food - clamp solution to 0-9 range
        const f1 = getRandomPos();
        const solutionValue = Math.max(0, Math.min(9, round.solution));
        newFoods.push({ id: 'correct', ...f1, value: solutionValue, isCorrect: true, isTreasure: variant === 'treasure' });

        // 3 Decoys - values between 0-9
        for (let i = 0; i < 3; i++) {
            const pos = getRandomPos();
            let val: number = 0;
            // Ensure unique unused values (0-9 range)
            do {
                val = Math.floor(Math.random() * 10); // 0-9
            } while (val === solutionValue || newFoods.some(f => f.value === val));
            newFoods.push({ id: `decoy-${i}`, ...pos, value: val, isCorrect: false });
        }

        setFoods(newFoods);
        setTimeLeft(10); // Reset timer
    }, [currentRound, snake]);

    // Start Game
    const startGame = () => {
        setSnake(INITIAL_SNAKE);
        setDirection('UP');
        directionRef.current = 'UP';
        nextDirectionRef.current = 'UP';
        setScore(0);
        setStreak(0);
        setLives(100);
        livesRef.current = 100;
        lastLoseLifeAtRef.current = 0;
        shieldRef.current = false;
        bounceBackRef.current = false;
        doubleScoreUntilRef.current = 0;
        setInvisibleUntil(0);
        setSlowUntil(0);
        setPowerups([]);
        setFoodEaten(0);
        sessionStartTimeRef.current = Date.now();
        setStatus('PLAYING');
        if (currentRound) initRound(); // Re-init round
    };

    const pauseGame = () => {
        if (status !== 'PLAYING') return;
        setStatus('PAUSED');
    };

    const resumeGame = () => {
        if (status !== 'PAUSED') return;
        setStatus('PLAYING');
    };

    const stopGame = () => {
        // Reset to idle state without saving stats
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setStatus('IDLE');
        setSnake(INITIAL_SNAKE);
        setDirection('UP');
        directionRef.current = 'UP';
        nextDirectionRef.current = 'UP';
        setFoods([]);
        setTimeLeft(10);
        setStreak(0);
        setScore(0);
        setLives(100);
        livesRef.current = 100;
        lastLoseLifeAtRef.current = 0;
        shieldRef.current = false;
        bounceBackRef.current = false;
        doubleScoreUntilRef.current = 0;
        setInvisibleUntil(0);
        setSlowUntil(0);
        setPowerups([]);
    };

    // Game Over
    const gameOver = useCallback(() => {
        setStatus('GAME_OVER');
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        const secondsPlayed = Math.floor((Date.now() - sessionStartTimeRef.current) / 1000);
        saveStats?.(score, Math.max(streak, highStreak), foodEaten, secondsPlayed);
    }, [score, streak, highStreak, foodEaten, saveStats]);

    // Input Handler
    const changeDirection = (newDir: Direction) => {
        const opp = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        if (opp[newDir] !== directionRef.current) {
            nextDirectionRef.current = newDir;
        }
    };

    // Single place to apply heart damage (wrong eat OR timeout). Throttled so only one chunk per 2s. Shield blocks one loss.
    const loseLife = useCallback(() => {
        if (shieldRef.current) {
            shieldRef.current = false;
            advanceRound();
            setTimeLeft(10);
            setStreak(0);
            return;
        }
        const now = Date.now();
        if (now - lastLoseLifeAtRef.current < 2000) return; // already lost a life recently
        lastLoseLifeAtRef.current = now;

        setStreak(0);
        livesRef.current = Math.max(0, livesRef.current - 25);
        setLives(livesRef.current);
        playVFX('death');
        if (livesRef.current <= 0) {
            gameOver();
        } else {
            advanceRound();
            setTimeLeft(10);
        }
    }, [advanceRound, gameOver, playVFX]);

    // Keep refs in sync for spawn logic
    snakeRef.current = snake;
    foodsRef.current = foods;

    // Apply powerup effect and remove powerup
    const applyPowerup = useCallback((p: Powerup) => {
        setPowerups(prev => prev.filter(u => u.id !== p.id));
        const now = Date.now();
        switch (p.type) {
            case 'extra_life':
                livesRef.current = Math.min(100, livesRef.current + 20);
                setLives(livesRef.current);
                break;
            case 'time_bonus':
                setTimeLeft(t => Math.min(15, t + 5));
                break;
            case 'shield':
                shieldRef.current = true;
                break;
            case 'invisible':
                setInvisibleUntil(now + POWERUP_DURATION_MS.invisible);
                break;
            case 'double_score':
                doubleScoreUntilRef.current = now + POWERUP_DURATION_MS.double_score;
                break;
            case 'bounce_back':
                bounceBackRef.current = true;
                break;
            case 'slow':
                setSlowUntil(now + POWERUP_DURATION_MS.slow);
                break;
        }
        playVFX('powerup');
    }, [playVFX]);

    // Clear expired invisible
    useEffect(() => {
        if (invisibleUntil <= 0) return;
        const delay = Math.max(0, invisibleUntil - Date.now());
        const t = setTimeout(() => setInvisibleUntil(0), delay);
        return () => clearTimeout(t);
    }, [invisibleUntil]);

    // Clear expired slow
    useEffect(() => {
        if (slowUntil <= 0) return;
        const delay = Math.max(0, slowUntil - Date.now());
        const t = setTimeout(() => setSlowUntil(0), delay);
        return () => clearTimeout(t);
    }, [slowUntil]);

    // Game Loop - slow powerup doubles interval (snake moves half as often)
    useEffect(() => {
        if (status !== 'PLAYING') return;

        const baseSpeed = getSpeedForDifficulty(difficulty);
        const isSlow = slowUntil > 0 && Date.now() < slowUntil;
        const isStorm = roundVariant === 'storm';

        let speed = isSlow ? baseSpeed * 2 : baseSpeed;
        if (isStorm) {
            speed = Math.max(40, Math.floor(speed * 0.85)); // slight speed-up on storm rounds
        }

        const moveSnake = () => {
            setSnake(prev => {
                const head = { ...prev[0] };
                directionRef.current = nextDirectionRef.current; // Commit direction

                switch (directionRef.current) {
                    case 'UP': head.y -= 1; break;
                    case 'DOWN': head.y += 1; break;
                    case 'LEFT': head.x -= 1; break;
                    case 'RIGHT': head.x += 1; break;
                }

                // Wall Collision - shield or bounce_back absorbs one hit
                if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
                    if (bounceBackRef.current) {
                        bounceBackRef.current = false;
                        const opp: Record<Direction, Direction> = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
                        nextDirectionRef.current = opp[directionRef.current];
                        return prev; // don't move, next tick will go opposite
                    }
                    if (shieldRef.current) {
                        shieldRef.current = false;
                        return prev;
                    }
                    gameOver();
                    return prev;
                }

                // Self Collision - shield absorbs one hit (no game over, revert move)
                if (prev.some((s, i) => i !== prev.length - 1 && s.x === head.x && s.y === head.y)) {
                    if (shieldRef.current) {
                        shieldRef.current = false;
                        return prev; // don't move, shield consumed
                    }
                    gameOver();
                    return prev;
                }

                const newSnake = [head, ...prev];

                // Check Food Collision
                const eatenIndex = foods.findIndex(f => f.x === head.x && f.y === head.y);
                if (eatenIndex !== -1) {
                    const eaten = foods[eatenIndex];
                    if (eaten.isCorrect) {
                        // CORRECT - 2x score powerup doubles points
                        const base = 10 + (streak * 2);
                        const points = Date.now() < doubleScoreUntilRef.current ? base * 2 : base;
                        setScore(s => s + points);
                        setStreak(s => {
                            const newS = s + 1;
                            if (newS > highStreak) setHighStreak(newS);
                            setFoodEaten(prev => prev + 1);

                            // Combo bonus every 3 correct answers in a row: extra score + small heart heal
                            if (newS > 0 && newS % 3 === 0) {
                                const comboBonus = 50;
                                setScore(prev => prev + comboBonus);
                                setTimeLeft(prev => Math.min(prev + 1, 20)); // tiny time reward
                                livesRef.current = Math.min(100, livesRef.current + 10);
                                setLives(livesRef.current);
                            }

                            return newS;
                        });
                        advanceRound();
                    } else {
                        // WRONG - lose one life (loseLife is throttled so timer can't double-reduce)
                        loseLife();
                    }
                    // Don't pop tail (grow)
                } else {
                    // Check powerup collision
                    const powerupAt = powerups.find(p => p.x === head.x && p.y === head.y);
                    if (powerupAt) {
                        applyPowerup(powerupAt);
                    }
                    newSnake.pop(); // Move normally (or after eating powerup - no growth)
                }
                return newSnake;
            });
            setDirection(directionRef.current); // Sync state for UI
        };

        gameLoopRef.current = window.setInterval(moveSnake, speed);
        return () => {
            if (gameLoopRef.current) clearInterval(gameLoopRef.current);
        };
    }, [status, foods, powerups, streak, highStreak, advanceRound, gameOver, difficulty, loseLife, applyPowerup, slowUntil, roundVariant]);

    // Round Timer
    useEffect(() => {
        if (status !== 'PLAYING') return;

        timerRef.current = window.setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    // Time's up - lose one life (loseLife throttles so wrong-eat + timeout = only 1 life)
                    loseLife();
                    return 10;
                }
                return t - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status, loseLife]);

    // Re-init round when ID changes
    useEffect(() => {
        if (status === 'PLAYING' && currentRound) {
            initRound();
        }
    }, [currentRound?.id, status]); // Only refetch foods when ID changes or status becomes playing

    // Spawn one powerup every 15s while playing (at random empty cell)
    useEffect(() => {
        if (status !== 'PLAYING') return;
        const id = setInterval(() => {
            const snakePos = snakeRef.current;
            const foodsPos = foodsRef.current;
            setPowerups(prev => {
                const occupied = new Set<string>();
                snakePos.forEach(s => occupied.add(`${s.x},${s.y}`));
                foodsPos.forEach(f => occupied.add(`${f.x},${f.y}`));
                prev.forEach(p => occupied.add(`${p.x},${p.y}`));
                let x: number, y: number, key: string;
                let tries = 0;
                do {
                    x = Math.floor(Math.random() * GRID_SIZE);
                    y = Math.floor(Math.random() * GRID_SIZE);
                    key = `${x},${y}`;
                    if (++tries > 100) return prev;
                } while (occupied.has(key));
                const type = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
                return [...prev, { id: `powerup-${Date.now()}`, x, y, type, spawnAt: Date.now() }];
            });
        }, POWERUP_SPAWN_INTERVAL_MS);
        return () => clearInterval(id);
    }, [status]);

    // Despawn powerups older than 8s
    useEffect(() => {
        if (status !== 'PLAYING') return;
        const id = setInterval(() => {
            const now = Date.now();
            setPowerups(prev => prev.filter(p => now - p.spawnAt < POWERUP_LIFETIME_MS));
        }, 2000);
        return () => clearInterval(id);
    }, [status]);

    const hotStreakLevel = Math.floor(streak / 3);

    return {
        snake,
        foods,
        powerups,
        invisibleUntil,
        direction,
        status,
        score,
        streak,
        highStreak,
        timeLeft,
        lives,
        roundVariant,
        foodEaten,
        hotStreakLevel,
        startGame,
        pauseGame,
        resumeGame,
        stopGame,
        changeDirection,
        GRID_SIZE
    };
};
