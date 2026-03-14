import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { Trophy, Home, Shield, Sparkles, TrendingUp, CheckCircle2, Award } from 'lucide-react';
import { ACHIEVEMENTS } from '../data/achievements';
import type { Achievement, AchievementCategory } from '../data/achievements';
import type { UserStats } from '../utils/achievements';

const CATEGORIES: { id: AchievementCategory | 'all'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'all', label: 'All', icon: Award },
    { id: 'progression', label: 'Progress', icon: TrendingUp },
    { id: 'skill', label: 'Skill', icon: Trophy },
    { id: 'collection', label: 'Collection', icon: Sparkles },
    { id: 'special', label: 'Special', icon: Shield },
];

const Achievements = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState<AchievementCategory | 'all'>('all');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchStats = async () => {
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                if (snap.exists()) {
                    setStats(snap.data() as UserStats);
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--theme-bg-base)]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[var(--theme-accent)]/20 border-t-[var(--theme-accent)] rounded-full animate-spin" />
                    <p className="text-[var(--theme-accent)] font-bold tracking-widest uppercase animate-pulse">Scanning Archive...</p>
                </div>
            </div>
        );
    }

    const unlockedCount = stats?.unlockedAchievements?.length || 0;
    const progressPercent = Math.round((unlockedCount / ACHIEVEMENTS.length) * 100);

    const filteredAchievements = ACHIEVEMENTS.filter(ach =>
        activeCategory === 'all' || ach.category === activeCategory
    );

    const getProgress = (ach: Achievement) => {
        if (stats?.unlockedAchievements?.includes(ach.id)) return 100;

        switch (ach.requirement.type) {
            case 'games': return Math.min(100, ((stats?.totalGames || 0) / ach.requirement.value) * 100);
            case 'score': return Math.min(100, ((stats?.bestScore || 0) / ach.requirement.value) * 100);
            case 'food': return Math.min(100, ((stats?.totalFoodEaten || 0) / ach.requirement.value) * 100);
            case 'streak': return Math.min(100, ((stats?.bestStreak || 0) / ach.requirement.value) * 100);
            case 'time': return Math.min(100, ((stats?.totalTimePlayedSeconds || 0) / ach.requirement.value) * 100);
            default: return 0;
        }
    };

    const getDisplayValue = (ach: Achievement) => {
        switch (ach.requirement.type) {
            case 'games': return `${stats?.totalGames || 0} / ${ach.requirement.value}`;
            case 'score': return `${stats?.bestScore || 0} / ${ach.requirement.value}`;
            case 'food': return `${stats?.totalFoodEaten || 0} / ${ach.requirement.value}`;
            case 'streak': return `${stats?.bestStreak || 0} / ${ach.requirement.value}`;
            case 'time': return `${Math.floor((stats?.totalTimePlayedSeconds || 0) / 60)} / ${Math.floor(ach.requirement.value / 60)} min`;
            default: return '';
        }
    };

    return (
        <div className="min-h-screen pt-24 pb-16 relative bg-[var(--theme-bg-base)] overflow-x-hidden">
            <div className="peripheral-glow" style={{ opacity: 0.4 }} />

            <main className="container mx-auto px-4 relative z-10 max-w-6xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <button
                            onClick={() => navigate('/home')}
                            className="flex items-center gap-2 text-xs font-bold text-[var(--theme-accent)] uppercase tracking-widest hover:translate-x-[-4px] transition-transform mb-4"
                        >
                            <Home className="w-4 h-4" /> Back to Lobby
                        </button>
                        <h1 className="text-4xl md:text-6xl font-black text-[var(--theme-text)] tracking-tighter drop-shadow-xl flex items-center gap-4">
                            ACHIEVEMENTS
                            <Award className="w-10 h-10 md:w-14 md:h-14 text-[var(--theme-accent)] animate-pulse" />
                        </h1>
                        <p className="text-[var(--theme-text-dim)] font-medium max-w-lg">
                            Track your legendary feats across the jungle. Unlock rewards and gain prestige.
                        </p>
                    </div>

                    <div className="glass-panel p-6 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)]/60 min-w-[240px]">
                        <div className="flex items-center justify-between mb-3 text-xs font-black uppercase tracking-widest">
                            <span className="text-[var(--theme-text-dim)]">Total Completion</span>
                            <span className="text-[var(--theme-accent)]">{unlockedCount} / {ACHIEVEMENTS.length}</span>
                        </div>
                        <div className="w-full h-4 bg-[var(--theme-bg-base)]/60 rounded-full p-1 border border-[var(--theme-border)]">
                            <div
                                className="h-full bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-alt)] rounded-full shadow-[0_0_15px_var(--theme-glow)] transition-all duration-1000"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        <p className="mt-3 text-[10px] text-[var(--theme-text-dim)] text-center font-bold tracking-tighter uppercase">
                            {progressPercent}% Journey Complete
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-10">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${activeCategory === cat.id
                                ? 'bg-[var(--theme-accent)] text-[var(--theme-selection-text)] shadow-[0_0_20px_var(--theme-glow)]'
                                : 'bg-[var(--theme-surface)] text-[var(--theme-text-dim)] border border-[var(--theme-border)] hover:border-[var(--theme-accent)]/50'
                                }`}
                        >
                            <cat.icon className="w-4 h-4" />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAchievements.map(ach => {
                        const isUnlocked = stats?.unlockedAchievements?.includes(ach.id);
                        const progress = getProgress(ach);
                        const Icon = ach.icon;

                        return (
                            <div
                                key={ach.id}
                                className={`group relative glass-panel rounded-3xl p-6 border transition-all duration-500 overflow-hidden ${isUnlocked
                                    ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/5 shadow-[0_10px_40px_rgba(0,0,0,0.3)]'
                                    : 'border-[var(--theme-border)] bg-[var(--theme-surface)]/40 grayscale-[0.6] opacity-80'
                                    }`}
                            >
                                {/* Glow Effect for Unlocked */}
                                {isUnlocked && (
                                    <div className="absolute -top-20 -right-20 w-40 h-40 bg-[var(--theme-accent)]/10 blur-[50px] rounded-full group-hover:scale-150 transition-transform duration-1000" />
                                )}

                                <div className="flex items-start justify-between mb-4 relative z-10">
                                    <div className={`p-4 rounded-2xl ${isUnlocked
                                        ? 'bg-gradient-to-br from-[var(--theme-accent)] to-[var(--theme-accent-alt)] shadow-[0_0_20px_var(--theme-glow)]'
                                        : 'bg-[var(--theme-bg-base)] border border-[var(--theme-border)]'
                                        }`}>
                                        <Icon className={`w-6 h-6 ${isUnlocked ? 'text-[var(--theme-selection-text)]' : 'text-[var(--theme-text-dim)]'}`} />
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${isUnlocked
                                            ? 'bg-[var(--theme-accent)] text-[var(--theme-selection-text)]'
                                            : 'bg-[var(--theme-surface)] text-[var(--theme-text-dim)] border border-[var(--theme-border)]'
                                            }`}>
                                            +{ach.xpReward} XP
                                        </span>
                                        {isUnlocked && <CheckCircle2 className="w-5 h-5 text-[var(--theme-accent)] mt-2" />}
                                    </div>
                                </div>

                                <div className="relative z-10">
                                    <h3 className={`text-xl font-black mb-1 tracking-tight ${isUnlocked ? 'text-[var(--theme-text)]' : 'text-[var(--theme-text-dim)]'}`}>
                                        {ach.title}
                                    </h3>
                                    <p className="text-xs text-[var(--theme-text-dim)]/80 font-medium leading-relaxed mb-6">
                                        {ach.description}
                                    </p>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                            <span className="text-[var(--theme-text-dim)]">Progress</span>
                                            <span className={isUnlocked ? 'text-[var(--theme-accent)]' : 'text-[var(--theme-text-dim)]'}>
                                                {getDisplayValue(ach)}
                                            </span>
                                        </div>
                                        <div className="w-full h-1.5 bg-[var(--theme-bg-base)]/80 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-1000 rounded-full ${isUnlocked
                                                    ? 'bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-alt)]'
                                                    : 'bg-[var(--theme-text-dim)]/30'
                                                    }`}
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Watermark Background */}
                                <Icon className="absolute -bottom-4 -right-4 w-32 h-32 text-[var(--theme-text)]/5 -rotate-12 pointer-events-none group-hover:rotate-0 transition-transform duration-700" />
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
};

export default Achievements;
