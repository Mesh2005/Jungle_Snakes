import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Play, Trophy, Users, Settings as SettingsIcon, LogOut, LayoutGrid, Zap, Flame, HelpCircle, Gamepad2 } from 'lucide-react';
import Modal from '../components/ui/Modal';
import { FallingSnakes } from '../components/FallingSnakes';
import { useTrivia } from '../hooks/useTrivia';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

type Difficulty = 'easy' | 'medium' | 'hard';

const DIFFICULTY_OPTIONS: { level: Difficulty; label: string; description: string }[] = [
    { level: 'easy', label: 'Easy', description: 'Slow snake — relax and plan your moves' },
    { level: 'medium', label: 'Medium', description: 'Normal speed — balanced challenge' },
    { level: 'hard', label: 'Hard', description: 'Fast snake — quick reflexes required' },
];

const Home = () => {
    const { user, emailVerified, isAdmin } = useAuth();
    const navigate = useNavigate();
    const [showDifficultyModal, setShowDifficultyModal] = useState(false);
    const trivia = useTrivia();
    const [displayName, setDisplayName] = useState<string | null>(null);

    useEffect(() => {
        const loadName = async () => {
            if (!user) {
                setDisplayName(null);
                return;
            }
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                const data = snap.data() as { gamerTag?: string } | undefined;
                const fallback = user.email ? user.email.split('@')[0] : 'Hunter';
                setDisplayName((data && data.gamerTag) || fallback);
            } catch {
                const fallback = user?.email ? user.email.split('@')[0] : 'Hunter';
                setDisplayName(fallback);
            }
        };
        void loadName();
    }, [user]);

    const handleChooseDifficulty = (level: Difficulty) => {
        if (!emailVerified && user && !isAdmin) {
            setShowDifficultyModal(false);
            navigate('/verify-email');
            return;
        }
        localStorage.setItem('difficulty', level);
        window.dispatchEvent(new CustomEvent('difficultyChanged', { detail: level }));
        setShowDifficultyModal(false);
        navigate('/game');
    };

    return (
        <div className="min-h-screen pt-16 flex flex-col relative bg-gradient-to-b from-[var(--theme-bg-base)] to-[var(--theme-bg-secondary)] overflow-hidden">
            {/* Extreme Global Glows */}
            <div className="peripheral-glow" />

            {/* Ambient Forest Animations */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-60">
                <FallingSnakes />

                {/* Visual depth elements */}
                <div className="absolute top-[-5%] left-[5%] text-[var(--theme-accent)]/20 animate-sway pointer-events-none" style={{ animationDuration: '20s' }}>
                    <svg width="120" height="600" viewBox="0 0 100 500" fill="currentColor">
                        <path d="M50 0 C20 100 80 200 50 300 C20 400 80 500 50 600" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
                        <path d="M50 80 L80 60 Q90 80 80 100 ZM50 250 L20 230 Q10 250 20 270 Z" />
                    </svg>
                </div>

                <div className="absolute top-[-10%] right-[8%] text-[var(--theme-accent-alt)]/20 animate-sway pointer-events-none" style={{ animationDuration: '15s', animationDelay: '2s' }}>
                    <svg width="100" height="500" viewBox="0 0 100 500" fill="currentColor">
                        <path d="M50 0 C20 100 80 200 50 300 C20 400 80 500 50 600" stroke="currentColor" strokeWidth="3" fill="none" />
                        <path d="M50 150 L80 130 Q90 150 80 170 ZM50 350 L20 330 Q10 350 20 370 Z" />
                    </svg>
                </div>

                {/* Slow moving mist/fog layers */}
                <div className="absolute top-[-10%] left-[-20%] w-[140%] h-[120%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--theme-accent)]/10 via-transparent to-transparent blur-[100px] animate-pulse-slow mix-blend-screen" style={{ animationDuration: '8s' }} />
                <div className="absolute top-[20%] right-[-10%] w-[120%] h-[100%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--theme-accent-alt)]/10 via-transparent to-transparent blur-[120px] animate-pulse-slow mix-blend-screen" style={{ animationDuration: '12s', animationDelay: '2s' }} />
                <div className="absolute bottom-[-20%] left-[10%] w-[150%] h-[100%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--theme-accent)]/15 via-transparent to-transparent blur-[150px] animate-float-slow mix-blend-screen" style={{ animationDuration: '15s' }} />

                {/* Floating ambient light particles */}
                <div className="absolute top-[30%] left-[20%] w-32 h-32 rounded-full bg-[var(--theme-accent)]/15 blur-[40px] animate-float-slow" style={{ animationDuration: '10s' }} />
                <div className="absolute top-[60%] right-[25%] w-48 h-48 rounded-full bg-[var(--theme-accent-alt)]/15 blur-[50px] animate-float-slow" style={{ animationDuration: '14s', animationDelay: '2s' }} />
                <div className="absolute bottom-[20%] left-[40%] w-40 h-40 rounded-full bg-[var(--theme-accent)]/10 blur-[45px] animate-float-slow" style={{ animationDuration: '12s', animationDelay: '4s' }} />
            </div>

            <main className="flex-grow container mx-auto px-4 flex flex-col items-center justify-center py-12 relative z-10 w-full max-w-4xl">

                {/* Game Title Header */}
                <div className="text-center mb-10 w-full">
                    {user && displayName && (
                        <p className="text-sm md:text-base font-medium tracking-[0.2em] uppercase text-[var(--theme-accent)]/80 mb-2">
                            Welcome, <span className="text-[var(--theme-accent)] font-bold">{displayName}</span>
                        </p>
                    )}
                    <h1 className="text-5xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-white via-[var(--theme-accent)] to-[var(--theme-accent-alt)] tracking-tighter drop-shadow-[0_0_20px_var(--theme-glow)]">
                        JUNGLE SNAKE
                    </h1>
                </div>

                {/* Email Verification Warning */}
                {user && !emailVerified && !isAdmin && (
                    <div className="mb-8 px-6 py-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200/90 max-w-lg w-full flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                        <span className="text-xs font-medium text-center sm:text-left">Verify your email to save progress and rank on the leaderboard.</span>
                        <button
                            type="button"
                            onClick={() => navigate('/verify-email')}
                            className="shrink-0 px-4 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-300 font-semibold text-xs transition-colors"
                        >
                            Verify Email
                        </button>
                    </div>
                )}

                {/* Main Game Menu UI */}
                <div className="w-full flex flex-col gap-6 items-center">

                    {/* Giant Play Button */}
                    <button
                        type="button"
                        onClick={() => setShowDifficultyModal(true)}
                        className="group relative w-full max-w-2xl border border-[var(--theme-border)] rounded-cl p-8 transition-all duration-300 overflow-hidden glass-panel hover:border-[var(--theme-accent)] shadow-[0_0_30px_rgba(0,0,0,0.15)] hover:shadow-[0_0_50px_var(--theme-glow)] hover:-translate-y-1"
                        style={{ borderRadius: '2rem' }}
                    >
                        <div className="absolute inset-0 bg-[var(--theme-accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--theme-accent)]/80 to-transparent" />

                        <div className="relative z-10 flex flex-col items-center justify-center gap-4">
                            <div className="w-20 h-20 rounded-full bg-[var(--theme-accent)]/20 border border-[var(--theme-accent)] flex items-center justify-center shadow-[0_0_20px_var(--theme-glow)] group-hover:scale-110 transition-transform duration-300 group-hover:bg-[var(--theme-accent)]/30">
                                <Play className="w-10 h-10 text-[var(--theme-accent)] fill-[var(--theme-accent)] translate-x-1" />
                            </div>
                            <div className="text-center">
                                <h2 className="text-3xl font-extrabold text-white tracking-widest uppercase mb-1 drop-shadow-md">Play the Game</h2>
                                <p className="text-[var(--theme-text-dim)] text-sm font-medium">Enter the fray & hunt your high score</p>
                            </div>
                        </div>
                    </button>

                    {/* Secondary Navigation Buttons Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-4">
                        {/* Daily Achievements */}
                        <div
                            onClick={() => navigate('/achievements')}
                            className="group cursor-pointer glass-panel border border-[var(--theme-border)] rounded-cl p-6 hover:border-[var(--theme-accent)] transition-all duration-300 hover:shadow-[0_0_30px_var(--theme-glow)] hover:-translate-y-1" style={{ borderRadius: '1.5rem' }}>
                            <div className="flex flex-col items-center gap-3 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/30 flex items-center justify-center group-hover:bg-[var(--theme-accent)]/20 transition-colors">
                                    <Trophy className="w-7 h-7 text-[var(--theme-accent)]" />
                                </div>
                                <div className="select-none">
                                    <h3 className="text-xl font-bold text-white mb-1">Achievements</h3>
                                    <p className="text-xs text-[var(--theme-text-dim)]">Daily mission progress</p>
                                </div>
                                <button className="mt-2 text-xs font-bold text-[var(--theme-accent)] px-4 py-2 rounded-lg bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/20 hover:bg-[var(--theme-accent)]/20 transition-all uppercase tracking-wider">View Tasks</button>
                            </div>
                        </div>

                        {/* Leaderboard */}
                        <div
                            onClick={() => navigate('/leaderboard')}
                            className="group cursor-pointer glass-panel border border-[var(--theme-border)] rounded-cl p-6 hover:border-[var(--theme-accent)] transition-all duration-300 hover:shadow-[0_0_30px_var(--theme-glow)] hover:-translate-y-1" style={{ borderRadius: '1.5rem' }}>
                            <div className="flex flex-col items-center gap-3 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/30 flex items-center justify-center group-hover:bg-[var(--theme-accent)]/20 transition-colors">
                                    <LayoutGrid className="w-7 h-7 text-[var(--theme-accent)]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Leaderboard</h3>
                                    <p className="text-xs text-[var(--theme-text-dim)]">Top 10 survivors</p>
                                </div>
                                <button className="mt-2 text-xs font-bold text-[var(--theme-accent)] px-4 py-2 rounded-lg bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/20 hover:bg-[var(--theme-accent)]/20 transition-all uppercase tracking-wider">Hall of Fame</button>
                            </div>
                        </div>

                        {/* Settings */}
                        <div
                            onClick={() => navigate('/settings')}
                            className="group cursor-pointer glass-panel border border-[var(--theme-border)] rounded-cl p-6 hover:border-[var(--theme-accent)] transition-all duration-300 hover:shadow-[0_0_30px_var(--theme-glow)] hover:-translate-y-1" style={{ borderRadius: '1.5rem' }}>
                            <div className="flex flex-col items-center gap-3 text-center">
                                <div className="w-14 h-14 rounded-2xl bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/30 flex items-center justify-center group-hover:bg-[var(--theme-accent)]/20 transition-colors">
                                    <SettingsIcon className="w-7 h-7 text-[var(--theme-accent)]" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-1">Settings</h3>
                                    <p className="text-xs text-[var(--theme-text-dim)]">Controls & Audio</p>
                                </div>
                                <button className="mt-2 text-xs font-bold text-[var(--theme-accent)] px-4 py-2 rounded-lg bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/20 hover:bg-[var(--theme-accent)]/20 transition-all uppercase tracking-wider">Configure</button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            {/* Difficulty picker modal */}
            <Modal
                isOpen={showDifficultyModal}
                onClose={() => setShowDifficultyModal(false)}
                title="SELECT MISSION INTENSITY"
            >
                <div className="flex flex-col gap-6 py-2">
                    <div className="flex flex-col md:flex-row gap-4">
                        {[
                            { level: 'easy', label: 'EASY', icon: HelpCircle, color: 'from-[var(--theme-accent)]/10 to-[var(--theme-bg-base)]', border: 'border-[var(--theme-accent)]/20', text: 'text-[var(--theme-accent)]', desc: 'Slow snake, longer timer.' },
                            { level: 'medium', label: 'NORMAL', icon: Zap, color: 'from-[var(--theme-accent-alt)]/10 to-[var(--theme-bg-base)]', border: 'border-[var(--theme-accent-alt)]/20', text: 'text-[var(--theme-accent-alt)]', desc: 'Balanced speed and scoring.' },
                            { level: 'hard', label: 'ELITE', icon: Flame, color: 'from-red-500/10 to-[var(--theme-bg-base)]', border: 'border-red-500/30', text: 'text-red-400', desc: 'Fast snake, short timer.' },
                        ].map(({ level, label, icon: Icon, color, border, text, desc }) => (
                            <button
                                key={level}
                                type="button"
                                onClick={() => handleChooseDifficulty(level as Difficulty)}
                                className={`flex-1 group relative p-6 rounded-2xl bg-gradient-to-br ${color} ${border} border hover:border-[var(--theme-accent)]/50 transition-all duration-300 hover:-translate-y-1 overflow-hidden backdrop-blur-md shadow-xl`}
                            >
                                <div className="absolute inset-0 bg-[var(--theme-accent)]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex flex-col items-center text-center gap-3 relative z-10">
                                    <div className={`p-3 rounded-xl bg-black/40 border border-[var(--theme-border)] group-hover:scale-110 transition-transform`}>
                                        <Icon className={`w-6 h-6 ${text}`} />
                                    </div>
                                    <div>
                                        <h3 className={`text-lg font-black tracking-widest ${text}`}>{label}</h3>
                                        <p className="text-[10px] text-[var(--theme-text-dim)] font-medium leading-tight mt-1 group-hover:text-[var(--theme-text)] transition-colors uppercase tracking-tighter">
                                            {desc}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowDifficultyModal(false)}
                        className="w-full py-3 rounded-xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text-dim)] text-xs font-bold uppercase tracking-widest hover:bg-[var(--theme-surface-strong)] hover:text-[var(--theme-text)] transition-all"
                    >
                        Cancel
                    </button>
                </div>
            </Modal>
        </div>
    );
};

export default Home;
