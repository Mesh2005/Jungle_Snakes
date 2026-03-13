import { useEffect, useCallback, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePrefetchRound } from '../hooks/usePrefetchRound';
import { useSnakeGame } from '../hooks/useSnakeGame';
import GameBoard from '../components/GameBoard';
import RoundPanel from '../components/RoundPanel';
import Modal from '../components/ui/Modal';
import { doc, setDoc, getDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { submitLeaderboardEntry } from '../services/leaderboard';
import { RefreshCw, Play, Trophy, Home, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getRankInfo } from '../utils/rank';
import { playClickSound } from '../utils/clickSound';
import { useAudio } from '../context/AudioContext';
import { checkNewlyUnlockedAchievements } from '../utils/achievements';
import { ACHIEVEMENTS } from '../data/achievements';

type HeartQuizQuestion = {
    question: string;
    correctAnswer: number;
};

const GamePage = () => {
    const { user, emailVerified, isAdmin } = useAuth();
    const navigate = useNavigate();
    const { currentRound, advanceRound, loading: roundLoading } = usePrefetchRound();

    // Total score from DB to calculate rank
    const [totalScore, setTotalScore] = useState(0);

    const { playVFX, musicEnabled, setMusicEnabled } = useAudio();

    const [showQuickControls, setShowQuickControls] = useState(false);

    // One-time heart restoration quiz state (very simple math for kids)
    const [heartQuizUsed, setHeartQuizUsed] = useState(false);
    const [heartQuizOpen, setHeartQuizOpen] = useState(false);
    const [quizQuestion, setQuizQuestion] = useState<HeartQuizQuestion | null>(null);
    const [quizOptions, setQuizOptions] = useState<string[]>([]);
    const [quizAnswered, setQuizAnswered] = useState(false);
    const [quizCorrect, setQuizCorrect] = useState<boolean | null>(null);
    const [reviveCountdown, setReviveCountdown] = useState<number | null>(null);

    useEffect(() => {
        if (!user) return;
        const fetchTotalScore = async () => {
            const snap = await getDoc(doc(db, 'users', user.uid));
            if (snap.exists()) {
                setTotalScore(snap.data().totalScore || 0);
            }
        };
        fetchTotalScore();
    }, [user]);

    // Get difficulty from localStorage
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

    useEffect(() => {
        const savedDifficulty = localStorage.getItem('difficulty');
        if (savedDifficulty && ['easy', 'medium', 'hard'].includes(savedDifficulty)) {
            setDifficulty(savedDifficulty as 'easy' | 'medium' | 'hard');
        }
    }, []);

    const saveStats = useCallback(async (score: number, streak: number, foodEaten: number, secondsPlayed: number) => {
        if (!user) return;

        const userRef = doc(db, 'users', user.uid);
        try {
            const snap = await getDoc(userRef);
            const data = snap.data() || {};

            const bestScore = Math.max(data.bestScore || 0, score);
            const bestStreak = Math.max(data.bestStreak || 0, streak);

            const updatedStats = {
                bestScore,
                bestStreak,
                totalGames: (data.totalGames || 0) + 1,
                totalScore: (data.totalScore || 0) + score,
                totalFoodEaten: (data.totalFoodEaten || 0) + foodEaten,
                totalTimePlayedSeconds: (data.totalTimePlayedSeconds || 0) + secondsPlayed,
                unlockedAchievements: data.unlockedAchievements || []
            };

            const newlyUnlocked = checkNewlyUnlockedAchievements(updatedStats);

            if (newlyUnlocked.length > 0) {
                updatedStats.unlockedAchievements = [...updatedStats.unlockedAchievements, ...newlyUnlocked];
                // Reward XP from new achievements
                newlyUnlocked.forEach(id => {
                    const ach = ACHIEVEMENTS.find(a => a.id === id);
                    if (ach) updatedStats.totalScore += ach.xpReward;
                });
            }

            setTotalScore(updatedStats.totalScore);

            await setDoc(userRef, {
                ...updatedStats,
                lastPlayedAt: serverTimestamp(),
            }, { merge: true });

            if ((emailVerified || isAdmin) && user.email) {
                submitLeaderboardEntry(user.uid, user.email, bestScore, bestStreak).catch((err) =>
                    console.error("Failed to update leaderboard", err)
                );
            }
        } catch (err) {
            console.error("Failed to save stats", err);
        }
    }, [user, emailVerified, isAdmin]);

    const loadHeartQuizQuestion = useCallback(() => {
        // Very easy arithmetic: small numbers, add or subtract, always non-negative
        const a = Math.floor(Math.random() * 10); // 0-9
        const b = Math.floor(Math.random() * 10); // 0-9
        const useAddition = Math.random() < 0.7; // mostly addition

        let question: string;
        let correct: number;

        if (useAddition) {
            question = `${a} + ${b} = ?`;
            correct = a + b;
        } else {
            const bigger = Math.max(a, b);
            const smaller = Math.min(a, b);
            question = `${bigger} - ${smaller} = ?`;
            correct = bigger - smaller;
        }

        // Generate 3 simple wrong answers near the correct one
        const optionSet = new Set<number>();
        optionSet.add(correct);
        while (optionSet.size < 4) {
            const delta = Math.floor(Math.random() * 3) + 1; // 1-3
            const sign = Math.random() < 0.5 ? -1 : 1;
            let candidate = correct + sign * delta;
            if (candidate < 0) candidate = correct + delta;
            optionSet.add(candidate);
        }

        const optionsArray = Array.from(optionSet).map(String);
        // Shuffle
        for (let i = optionsArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [optionsArray[i], optionsArray[j]] = [optionsArray[j], optionsArray[i]];
        }

        setQuizQuestion({ question, correctAnswer: correct });
        setQuizOptions(optionsArray);
    }, []);

    const {
        snake, foods, powerups, invisibleUntil, direction, status, score, streak, highStreak, timeLeft, lives, roundVariant, hotStreakLevel,
        startGame, pauseGame, resumeGame, stopGame, changeDirection, GRID_SIZE, reviveWithHalfHeart, forceGameOver
    } = useSnakeGame(
        currentRound,
        advanceRound,
        saveStats,
        difficulty,
        () => {
            // Hearts have dropped to zero inside the game hook
            if (heartQuizUsed) {
                forceGameOver();
                return;
            }
            setHeartQuizOpen(true);
            setQuizAnswered(false);
            setQuizCorrect(null);
            loadHeartQuizQuestion();
        }
    );

    // Play sounds on events
    useEffect(() => {
        if (status === 'GAME_OVER') {
            playVFX('death');
        }
    }, [status, playVFX]);

    const prevScore = useRef(0);
    useEffect(() => {
        if (status === 'PLAYING' && score > prevScore.current) {
            playVFX('food');
        }
        prevScore.current = score;
    }, [score, status, playVFX]);

    const handleStartGame = useCallback(() => {
        // Reset quiz and overlay state, then start a fresh run
        setHeartQuizUsed(false);
        setHeartQuizOpen(false);
        setQuizQuestion(null);
        setQuizOptions([]);
        setQuizAnswered(false);
        setQuizCorrect(null);
        setReviveCountdown(null);
        setShowQuickControls(false);
        startGame();
    }, [startGame]);

    const handleResumeGame = useCallback(() => {
        resumeGame();
    }, [resumeGame]);


    // Listen for difficulty changes from Settings page;
    // don't change difficulty in the middle of a running game
    useEffect(() => {
        const handleDifficultyChange = (e: CustomEvent) => {
            if (!e.detail || !['easy', 'medium', 'hard'].includes(e.detail)) return;
            if (status === 'PLAYING') return;
            setDifficulty(e.detail);
        };
        window.addEventListener('difficultyChanged', handleDifficultyChange as EventListener);
        return () => window.removeEventListener('difficultyChanged', handleDifficultyChange as EventListener);
    }, [status]);

    // Keyboard controls (desktop)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'W', 's', 'S', 'a', 'A', 'd', 'D'];
            if (keys.includes(e.key) && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                e.preventDefault();
            }

            switch (e.key) {
                case 'w': case 'W': case 'ArrowUp': changeDirection('UP'); break;
                case 's': case 'S': case 'ArrowDown': changeDirection('DOWN'); break;
                case 'a': case 'A': case 'ArrowLeft': changeDirection('LEFT'); break;
                case 'd': case 'D': case 'ArrowRight': changeDirection('RIGHT'); break;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [changeDirection]);

    // Touch controls (mobile): swipe to change direction
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);
    useEffect(() => {
        const handleTouchStart = (e: TouchEvent) => {
            if (e.touches.length !== 1) return;
            const t = e.touches[0];
            touchStartRef.current = { x: t.clientX, y: t.clientY };
        };

        const handleTouchEnd = (e: TouchEvent) => {
            if (!touchStartRef.current || e.changedTouches.length === 0) return;
            const start = touchStartRef.current;
            const t = e.changedTouches[0];
            const dx = t.clientX - start.x;
            const dy = t.clientY - start.y;
            const distance = Math.hypot(dx, dy);

            // Ignore tiny swipes
            if (distance < 24) {
                touchStartRef.current = null;
                return;
            }

            if (Math.abs(dx) > Math.abs(dy)) {
                changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
            } else {
                changeDirection(dy > 0 ? 'DOWN' : 'UP');
            }

            touchStartRef.current = null;
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [changeDirection]);

    // Disable page scroll while actively playing
    useEffect(() => {
        const previousOverflow = document.body.style.overflow;

        if (status === 'PLAYING') {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [status]);

    // Hide quick controls when game resets or ends
    useEffect(() => {
        if (status === 'IDLE' || status === 'GAME_OVER') {
            setShowQuickControls(false);
        }
    }, [status]);

    const handleQuizAnswer = (option: string) => {
        if (!quizQuestion || quizAnswered) return;
        const correct = option === String(quizQuestion.correctAnswer);
        setQuizAnswered(true);
        setQuizCorrect(correct);
        setHeartQuizUsed(true);

        if (correct) {
            // Restore hearts to 50%, then show a short countdown before resuming play
            reviveWithHalfHeart();
            setHeartQuizOpen(false);
            setReviveCountdown(3);
        }
    };

    const handleQuizGiveUpOrContinue = () => {
        setHeartQuizUsed(true);
        setHeartQuizOpen(false);
        forceGameOver();
    };

    // After a successful revive quiz, show 3-2-1 countdown then resume the game
    useEffect(() => {
        if (reviveCountdown === null) return;
        if (reviveCountdown <= 0) {
            setReviveCountdown(null);
            handleResumeGame();
            return;
        }

        const id = window.setTimeout(() => {
            setReviveCountdown((prev) => (prev === null ? null : prev - 1));
        }, 1000);

        return () => window.clearTimeout(id);
    }, [reviveCountdown, handleResumeGame]);

    return (
        <div className="min-h-screen md:h-[calc(100vh-4rem)] pt-20 pb-6 flex flex-col md:flex-row max-w-7xl mx-auto px-6 md:px-8 gap-6 md:gap-8 md:overflow-hidden">
            {/* Left Panel: Round Info */}
            <div className="w-full md:w-1/4 flex flex-col gap-4 md:max-h-full md:overflow-y-auto">
                <button
                    onClick={() => navigate('/home')}
                    className="p-5 rounded-xl bg-[var(--theme-surface)] hover:bg-[var(--theme-surface-strong)] transition-colors flex items-center justify-center gap-3 text-base font-bold text-[var(--theme-accent)] border border-[var(--theme-accent)]/60 w-full relative z-10"
                >
                    <Home className="w-5 h-5 flex-shrink-0" />
                    <span className="whitespace-nowrap">Back to Lobby</span>
                </button>
                <RoundPanel
                    round={currentRound}
                    loading={roundLoading}
                    timeLeft={timeLeft}
                    obscured={status === 'IDLE' || status === 'PAUSED'}
                />

                {/* Mobile-only Stats */}
                <div className="md:hidden glass-panel p-5 rounded-xl flex justify-between gap-4 bg-[var(--theme-surface)] border border-[var(--theme-border)]">
                    <div className="text-center">
                        <p className="text-xs text-[var(--theme-text-dim)] uppercase">Score</p>
                        <p className="text-xl font-bold text-[var(--theme-text)]">{score}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-[var(--theme-text-dim)] uppercase">Heart</p>
                        <p className="text-xl font-bold text-[var(--theme-accent)]">{lives}%</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-[var(--theme-text-dim)] uppercase">Streak</p>
                        <p className="text-xl font-bold text-[var(--theme-accent)]">{streak}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-xs text-[var(--theme-text-dim)] uppercase">Best</p>
                        <p className="text-xl font-bold text-[var(--theme-accent-alt)]">{highStreak}</p>
                    </div>
                </div>
            </div>

            {/* Floating music toggle (right side center for this page) */}
            <div className="fixed right-4 top-1/2 -translate-y-1/2 z-40 md:right-8">
                <button
                    type="button"
                    onClick={() => setMusicEnabled(!musicEnabled)}
                    aria-pressed={musicEnabled}
                    aria-label={musicEnabled ? 'Turn music off' : 'Turn music on'}
                    className="glass-panel flex flex-col items-center gap-1 px-3 py-3 rounded-2xl border border-[var(--theme-border)] bg-[var(--theme-surface-strong)]/80 hover:border-[var(--theme-accent)] hover:shadow-[0_0_25px_var(--theme-glow)] transition-all"
                >
                    <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[var(--theme-accent)]/15 text-[var(--theme-accent)]">
                        {musicEnabled ? (
                            <Volume2 className="w-5 h-5" />
                        ) : (
                            <VolumeX className="w-5 h-5" />
                        )}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--theme-text-dim)]">
                        Music {musicEnabled ? 'On' : 'Off'}
                    </span>
                </button>
            </div>

            {/* Center: Game Board */}
            <div className="w-full md:w-1/2 flex flex-col items-center gap-6 relative">
                <div
                    className="board-shell w-full max-w-2xl border-[var(--theme-border-strong)] bg-[var(--theme-bg-secondary)]/50"
                    onClick={() => {
                        if (status === 'IDLE') {
                            // Allow tapping anywhere on the board to start the game
                            handleStartGame();
                            return;
                        }
                        if (status === 'PLAYING') {
                            // Single tap pauses and reveals controls
                            pauseGame();
                            setShowQuickControls(true);
                        } else if (status === 'PAUSED') {
                            // While paused, tap just reveals controls (if hidden)
                            setShowQuickControls(true);
                        }
                    }}
                >
                    <div className="board-shell-inner aspect-square mx-auto relative">
                        <div className={`w-full h-full flex items-center justify-center transition duration-200 ${status === 'PAUSED' ? 'blur-sm' : ''}`}>
                            <GameBoard
                                snake={snake}
                                foods={foods}
                                powerups={powerups}
                                invisibleUntil={invisibleUntil}
                                gridSize={GRID_SIZE}
                                direction={direction}
                                status={status}
                                difficulty={difficulty}
                                roundVariant={roundVariant}
                            />
                        </div>
                        {reviveCountdown !== null && (
                            <div className="absolute inset-0 flex items-center justify-center bg-[var(--theme-bg-base)]/40 backdrop-blur-sm">
                                <div className="text-center">
                                    <p className="text-xs text-[var(--theme-text-dim)] mb-1 uppercase tracking-wide">
                                        Get ready
                                    </p>
                                    <p className="text-5xl font-black text-[var(--theme-accent)] drop-shadow-[0_0_20px_var(--theme-glow-strong)]">
                                        {reviveCountdown}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Start Button Overlay (when not actively playing and no revive countdown) */}
                    {status !== 'PLAYING' && reviveCountdown === null && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartGame();
                                    }}
                                    className="px-8 py-4 bg-[var(--theme-accent)] text-[var(--theme-selection-text)] font-bold text-xl rounded-full shadow-[0_0_30px_var(--theme-glow-strong)] hover:scale-105 transition-transform flex items-center gap-2 animate-pulse-slow"
                                >
                                    <Play className="fill-current" /> START GAME
                                </button>
                            </div>
                        </div>
                    )}
                    {/* Quick controls overlay when user taps (centered) */}
                    {showQuickControls && status !== 'IDLE' && status !== 'GAME_OVER' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-[var(--theme-bg-base)]/40 backdrop-blur-sm">
                            <div className="flex gap-4 pointer-events-auto">
                                {status === 'PLAYING' && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            pauseGame();
                                        }}
                                        className="px-4 py-2 rounded-full bg-[var(--theme-surface-strong)] text-sm font-semibold text-[var(--theme-text)] border border-[var(--theme-border)] shadow-[0_0_20px_var(--theme-glow)]"
                                    >
                                        Pause
                                    </button>
                                )}
                                {status === 'PAUSED' && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            // When resuming from a pause, show a short 3-2-1 countdown
                                            // and then continue the game (same as revive flow).
                                            setShowQuickControls(false);
                                            setReviveCountdown(3);
                                        }}
                                        className="px-4 py-2 rounded-full bg-[var(--theme-accent)] text-sm font-semibold text-[var(--theme-selection-text)] shadow-[0_0_20px_var(--theme-glow)]"
                                    >
                                        Resume
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        stopGame();
                                    }}
                                    className="px-4 py-2 rounded-full bg-red-600/90 text-sm font-semibold text-white border border-red-400/70 shadow-[0_0_20px_rgba(248,113,113,0.6)]"
                                >
                                    Stop
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Controls Hint */}
                <div className="text-[var(--theme-text-dim)]/60 text-sm hidden md:block">
                    Use WASD or Arrows to move
                </div>

                {/* Round variant indicator */}
                {roundVariant !== 'normal' && (
                    <div className="text-[11px] text-center text-[var(--theme-text-dim)]">
                        {roundVariant === 'storm' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--theme-surface-strong)] border border-[var(--theme-accent)]/60 text-[var(--theme-accent)]">
                                ⚡ Storm round &mdash; snake moves faster.
                            </span>
                        )}
                        {roundVariant === 'treasure' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--theme-surface-strong)] border border-[var(--theme-accent-alt)]/70 text-[var(--theme-accent-alt)]">
                                💰 Treasure round &mdash; golden food awards big bonus.
                            </span>
                        )}
                    </div>
                )}

            </div>

            {/* Right Panel: Desktop Stats */}
            <div className="hidden md:flex w-1/4 flex-col gap-4 md:max-h-full md:overflow-y-auto">
                <div className="glass-panel px-4 py-4 rounded-2xl space-y-4 bg-[var(--theme-surface)] border border-[var(--theme-border)]">
                    <h3 className="text-base font-bold text-[var(--theme-text)] border-b border-[var(--theme-border)] pb-1.5">
                        Session Stats
                    </h3>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] text-[var(--theme-text-dim)]">Score</span>
                            <span className="text-lg font-bold text-[var(--theme-text)] drop-shadow-[0_0_8px_var(--theme-glow)]">
                                {score}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] text-[var(--theme-text-dim)]">Streak</span>
                            <span className="text-lg font-bold text-[var(--theme-accent)] drop-shadow-[0_0_8px_var(--theme-glow)]">
                                {streak}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] text-[var(--theme-text-dim)]">Best Streak</span>
                            <span className="text-lg font-bold text-[var(--theme-accent-alt)]">
                                {highStreak}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] text-[var(--theme-text-dim)]">Heart</span>
                            <span className="text-lg font-bold text-[var(--theme-accent)]">
                                {lives}%
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1 pt-1.5 border-t border-[var(--theme-border)]">
                        <div className="flex items-center justify-between text-[10px]">
                            <span className="text-[var(--theme-text-dim)]">Hot streak</span>
                            <span className="text-[var(--theme-accent)] font-semibold">
                                {streak} in a row
                            </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-[var(--theme-bg-base)]/80 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-[var(--theme-accent)] via-[var(--theme-accent-alt)] to-[var(--theme-accent)] transition-all"
                                style={{ width: `${Math.min(streak, 15) / 15 * 100}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Instructions Summary */}
                <div className="glass-panel px-4 py-4 rounded-2xl flex-grow bg-[var(--theme-surface)] border border-[var(--theme-border)]">
                    <h3 className="text-sm font-bold text-[var(--theme-text)] mb-2">How to Play</h3>
                    <ul className="text-[11px] text-[var(--theme-text-dim)] space-y-1.5 list-disc list-inside">
                        <li>Look at the image on the left.</li>
                        <li>Solve the math puzzle.</li>
                        <li>Eat the food with the matching number.</li>
                        <li>Avoid walls and your own tail.</li>
                        <li>Wrong number costs a life (3 total).</li>
                        <li>Don't run out of time!</li>
                    </ul>
                </div>
            </div>

            {/* Game Over Modal */}
            <Modal isOpen={status === 'GAME_OVER'} onClose={handleStartGame} title="GAME OVER">
                <div className="text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="p-4 bg-[var(--theme-accent)]/10 rounded-full animate-bounce">
                            <Trophy className="w-12 h-12 text-[var(--theme-accent)]" />
                        </div>
                    </div>

                    <div>
                        <p className="text-[var(--theme-text-dim)] text-sm">Final Score</p>
                        <p className="text-4xl font-bold text-[var(--theme-text)] drop-shadow-[0_0_20px_var(--theme-glow)]">{score}</p>
                    </div>

                    {(() => {
                        const rankInfo = getRankInfo(totalScore);
                        return (
                            <div className="space-y-2 py-2 px-4 bg-[var(--theme-accent)]/5 rounded-2xl border border-[var(--theme-border)]">
                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                    <span className="text-[var(--theme-accent)]">LVL {rankInfo.level} - {rankInfo.rank}</span>
                                    <span className="text-[var(--theme-text-dim)]">{Math.round(rankInfo.progress)}% to next level</span>
                                </div>
                                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden p-[1px]">
                                    <div
                                        className="h-full bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-alt)] rounded-full shadow-[0_0_8px_var(--theme-glow)] transition-all duration-1000"
                                        style={{ width: `${rankInfo.progress}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })()}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[var(--theme-bg-base)]/40 p-3 rounded-lg border border-[var(--theme-border)]">
                            <p className="text-xs text-[var(--theme-text-dim)]">Streak</p>
                            <p className="text-xl font-bold text-[var(--theme-accent)]">{streak}</p>
                        </div>
                        <div className="bg-[var(--theme-bg-base)]/40 p-3 rounded-lg border border-[var(--theme-border)]">
                            <p className="text-xs text-[var(--theme-text-dim)]">Best Streak</p>
                            <p className="text-xl font-bold text-[var(--theme-accent-alt)]">{highStreak}</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleStartGame}
                            className="flex-1 py-3 bg-[var(--theme-accent)] text-[var(--theme-selection-text)] font-bold rounded-xl hover:opacity-90 transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="w-5 h-5" /> Play Again
                        </button>
                        <button
                            onClick={() => navigate('/home')}
                            className="flex-1 py-3 bg-[var(--theme-surface)] text-[var(--theme-accent)] font-bold rounded-xl border-2 border-[var(--theme-accent)]/60 hover:bg-[var(--theme-surface-strong)] hover:border-[var(--theme-accent)] transition-colors flex items-center justify-center gap-2"
                        >
                            <Home className="w-5 h-5" /> Back to Lobby
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Heart restoration quiz modal */}
            <Modal
                isOpen={heartQuizOpen}
                // While quiz is open, we control closing via buttons only
                onClose={handleQuizGiveUpOrContinue}
                title="Last Chance Quiz"
            >
                <div className="space-y-4 text-[var(--theme-text)]">
                    <p className="text-sm text-[var(--theme-text-dim)]">
                        Your hearts are gone. Play one quick quiz to restore <span className="font-semibold text-[var(--theme-accent)]">50% heart</span>,
                        or give up and end the run.
                    </p>

                    {quizQuestion && (
                        <div className="space-y-4">
                            <div>
                                <p className="font-semibold text-sm">Solve this:</p>
                                <p className="font-bold text-base mt-1">{quizQuestion.question}</p>
                            </div>
                            <div className="grid gap-2">
                                {quizOptions.map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        disabled={quizAnswered}
                                        onClick={() => handleQuizAnswer(opt)}
                                        className={`text-left px-3 py-2 rounded-lg border text-sm transition-colors ${
                                            quizAnswered
                                                ? opt === String(quizQuestion.correctAnswer)
                                                    ? 'bg-emerald-600/80 border-emerald-400 text-white'
                                                    : 'opacity-70'
                                                : 'bg-[var(--theme-surface)] border-[var(--theme-border)] hover:border-[var(--theme-accent)]'
                                        }`}
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>

                            {quizAnswered && (
                                <div className="flex items-center justify-between pt-2">
                                    <p className={`text-sm font-semibold ${quizCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {quizCorrect ? 'Correct! Hearts restored to 50% – keep playing.' : 'Wrong answer. Game over.'}
                                    </p>
                                    {!quizCorrect && (
                                        <button
                                            type="button"
                                            onClick={handleQuizGiveUpOrContinue}
                                            className="px-4 py-2 rounded-lg bg-red-600/90 text-xs font-semibold text-white border border-red-400/70"
                                        >
                                            Continue
                                        </button>
                                    )}
                                </div>
                            )}

                            {!quizAnswered && (
                                <div className="flex justify-end pt-1">
                                    <button
                                        type="button"
                                        onClick={handleQuizGiveUpOrContinue}
                                        className="px-4 py-2 rounded-lg bg-red-600/90 text-xs font-semibold text-white border border-red-400/70"
                                    >
                                        Give Up (Game Over)
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default GamePage;
