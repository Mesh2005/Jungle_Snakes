import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Trophy, Calendar, Zap, Home, Sparkles, Crown, Star, Flame, Award, Target, TrendingUp, Brain, Gamepad2, Settings } from 'lucide-react';
import { FallingSnakes } from '../components/FallingSnakes';
import { getRankInfo } from '../utils/rank';
import StatCard from '../components/ui/StatCard';

interface UserStats {
    bestScore?: number;
    bestStreak?: number;
    totalGames?: number;
    totalScore?: number;
    gamerTag?: string;
    bio?: string;
    favoriteGame?: string;
    avatarKey?: string;
}

const AVATAR_PRESETS = [
    { key: 'default', label: 'Hunter', bg: 'from-jungle-lime/40 via-jungle-fern/50 to-jungle-amber/40', icon: User },
    { key: 'crown', label: 'Forest King', bg: 'from-yellow-400/50 via-jungle-amber/60 to-jungle-600/70', icon: Crown },
    { key: 'star', label: 'Star Runner', bg: 'from-jungle-500/50 via-jungle-300/60 to-jungle-lime/70', icon: Star },
    { key: 'flame', label: 'Streak Master', bg: 'from-orange-500/50 via-red-500/50 to-jungle-700/80', icon: Flame },
];

const Profile = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [gamerTag, setGamerTag] = useState('');
    const [bio, setBio] = useState('');
    const [favoriteGame, setFavoriteGame] = useState('');
    const [avatarKey, setAvatarKey] = useState<string>('default');

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchStats = async () => {
            try {
                const docRef = doc(db, 'users', user.uid);
                const snap = await getDoc(docRef);
                if (snap.exists()) {
                    const data = snap.data() as UserStats;
                    setStats(data);

                    const fallbackTag = user.email ? user.email.split('@')[0] : 'Jungle Hunter';
                    setGamerTag(data.gamerTag || fallbackTag);
                    setBio(data.bio || '');
                    setFavoriteGame(data.favoriteGame || '');
                    setAvatarKey(data.avatarKey || 'default');
                } else {
                    const fallbackTag = user.email ? user.email.split('@')[0] : 'Jungle Hunter';
                    setGamerTag(fallbackTag);
                    setBio('');
                    setFavoriteGame('');
                    setAvatarKey('default');
                }
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, navigate]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSaving(true);
        try {
            const userRef = doc(db, 'users', user.uid);
            await setDoc(
                userRef,
                {
                    gamerTag: gamerTag.trim() || (user.email ? user.email.split('@')[0] : 'Jungle Hunter'),
                    bio: bio.trim(),
                    favoriteGame: favoriteGame.trim(),
                    avatarKey,
                },
                { merge: true }
            );
            setStats((prev) => ({
                ...(prev || {}),
                gamerTag: gamerTag.trim() || (user.email ? user.email.split('@')[0] : 'Jungle Hunter'),
                bio: bio.trim(),
                favoriteGame: favoriteGame.trim(),
                avatarKey,
            }));
        } catch (err) {
            console.error('Failed to save profile', err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen pt-20 flex items-center justify-center text-[var(--theme-accent)] animate-pulse font-bold tracking-widest uppercase bg-[var(--theme-bg-base)]">Loading Gamer ID...</div>;

    const currentPreset = AVATAR_PRESETS.find(p => p.key === avatarKey) || AVATAR_PRESETS[0];
    const rankInfo = getRankInfo(stats?.totalScore || 0);

    return (
        <div className="min-h-screen pt-24 pb-16 relative bg-[var(--theme-bg-base)] overflow-x-hidden">
            {/* Ambient Backgrounds */}
            <div className="peripheral-glow" style={{ opacity: 0.5 }} />
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-30">
                <FallingSnakes />
                <div className="absolute top-0 left-[-10%] w-[30%] h-full bg-gradient-to-b from-[var(--theme-accent)]/15 to-transparent blur-3xl animate-sunbeam" />
                <div className="absolute top-[20%] right-[-10%] w-[120%] h-[100%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[var(--theme-accent)]/5 via-transparent to-transparent blur-[120px] animate-pulse-slow" />
            </div>

            <main className="container mx-auto px-4 relative z-10 max-w-5xl">
                {/* Header Actions */}
                <div className="flex items-center mb-8">
                    <button
                        onClick={() => navigate('/home')}
                        className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text-dim)] hover:text-[var(--theme-accent)] hover:border-[var(--theme-accent)] transition-all backdrop-blur-md shadow-lg"
                    >
                        <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-bold uppercase tracking-wider">Back to Lobby</span>
                    </button>
                </div>

                {/* Creative Gamer ID Card */}
                <div className="relative group mb-10">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[var(--theme-accent)] via-[var(--theme-accent-alt)] to-[var(--theme-accent)] rounded-[2rem] blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>
                    <div className="relative glass-panel rounded-[2rem] p-1 overflow-hidden border border-[var(--theme-border)] bg-[var(--theme-surface-strong)]/40">
                        <div className="bg-[var(--theme-bg-base)]/60 rounded-[1.9rem] p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 md:gap-12">
                            {/* Avatar Section */}
                            <div className="relative">
                                <div className={`w-40 h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden bg-gradient-to-br from-[var(--theme-accent)]/20 via-[var(--theme-surface)] to-[var(--theme-accent-alt)]/20 flex items-center justify-center border-4 border-[var(--theme-accent)]/30 p-4 shadow-2xl relative z-10`}>
                                    <currentPreset.icon className="w-24 h-24 text-[var(--theme-accent)] drop-shadow-[0_0_15px_var(--theme-glow)]" />
                                </div>
                                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[var(--theme-surface-strong)] border border-[var(--theme-accent)] text-[var(--theme-accent)] text-[10px] font-black uppercase tracking-[0.2em] shadow-lg whitespace-nowrap z-20">
                                    RANK: {rankInfo.rank}
                                </div>
                            </div>

                            {/* Info Section */}
                            <div className="flex-grow text-center md:text-left space-y-4">
                                <div>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                        <h1 className="text-4xl md:text-5xl font-black text-[var(--theme-text)] tracking-tighter drop-shadow-lg">
                                            {gamerTag}
                                        </h1>
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/30 text-[var(--theme-accent)] text-xs font-bold">
                                            <Award className="w-3.5 h-3.5" /> ID Verified
                                        </div>
                                    </div>
                                    <p className="text-[var(--theme-text-dim)] text-sm font-medium tracking-wide flex items-center justify-center md:justify-start gap-2">
                                        <Target className="w-4 h-4 text-[var(--theme-accent-alt)]" /> {user?.email}
                                    </p>
                                </div>

                                <div className="space-y-4 bg-[var(--theme-surface)] p-5 rounded-2xl border border-[var(--theme-border)] max-w-md mx-auto md:mx-0">
                                    <div className="flex items-center justify-between text-xs mb-1 font-bold">
                                        <span className="text-[var(--theme-text-dim)] uppercase tracking-widest flex items-center gap-2">
                                            <TrendingUp className="w-3.5 h-3.5" /> Rank Progress
                                        </span>
                                        <span className="text-[var(--theme-accent)] font-black tracking-widest">LVL {rankInfo.level}</span>
                                    </div>
                                    <div className="w-full h-3 bg-[var(--theme-bg-base)]/60 rounded-full overflow-hidden border border-[var(--theme-border)] p-[2px]">
                                        <div
                                            className="h-full bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-alt)] rounded-full shadow-[0_0_10px_var(--theme-glow)] transition-all duration-1000"
                                            style={{ width: `${rankInfo.progress}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-[9px] text-[var(--theme-text-dim)]/70 font-bold uppercase tracking-tighter">
                                        <span>Current XP: {stats?.totalScore || 0}</span>
                                        <span>Next Rank at: {rankInfo.nextLevelAt}</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-2">
                                    <div className="px-3 py-1.5 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center gap-2 text-xs">
                                        <Sparkles className="w-4 h-4 text-[var(--theme-accent-alt)]" />
                                        <span className="text-[var(--theme-text-dim)]">Total Score: <span className="text-[var(--theme-text)] font-bold">{stats?.totalScore?.toLocaleString() || 0}</span></span>
                                    </div>
                                    <div className="px-3 py-1.5 rounded-lg bg-[var(--theme-surface)] border border-[var(--theme-border)] flex items-center gap-2 text-xs">
                                        <Calendar className="w-4 h-4 text-[var(--theme-accent)]" />
                                        <span className="text-[var(--theme-text-dim)]">Member Since: <span className="text-[var(--theme-text)] font-bold">March 2024</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-8 items-start">
                    {/* Left: Bio & Details Wrapper */}
                    <div className="space-y-6">
                        <section className="glass-panel p-8 rounded-[2rem] border border-[var(--theme-border)] relative overflow-hidden group bg-[var(--theme-surface)]">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Brain className="w-24 h-24 text-[var(--theme-text)]" />
                            </div>
                            <h2 className="text-xl font-black text-[var(--theme-text)] mb-4 uppercase tracking-tighter flex items-center gap-3">
                                <span className="w-2 h-8 rounded-full bg-[var(--theme-accent)] shadow-[0_0_15px_var(--theme-glow)]" />
                                Hunter's Dossier
                            </h2>
                            <p className="text-[var(--theme-text-dim)] text-sm leading-relaxed min-h-[100px] italic">
                                {bio || "The jungle is silent. This hunter has yet to leave their mark. Update your bio to tell your story..."}
                            </p>
                            {favoriteGame && (
                                <div className="mt-6 flex items-center gap-3 p-3 rounded-xl bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/20">
                                    <Gamepad2 className="w-5 h-5 text-[var(--theme-accent)]" />
                                    <span className="text-xs text-[var(--theme-text-dim)] font-medium">Addicted to: <span className="text-[var(--theme-accent)] font-bold">{favoriteGame}</span></span>
                                </div>
                            )}
                        </section>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-panel p-5 rounded-2xl border border-[var(--theme-border)] flex flex-col items-center gap-2 bg-[var(--theme-surface)]">
                                <Trophy className="w-6 h-6 text-[var(--theme-accent-alt)] drop-shadow-[0_0_8px_var(--theme-glow)]" />
                                <span className="text-2xl font-black text-[var(--theme-text)]">{stats?.bestScore || 0}</span>
                                <span className="text-[10px] text-[var(--theme-text-dim)] uppercase tracking-widest font-bold">Apex Score</span>
                            </div>
                            <div className="glass-panel p-5 rounded-2xl border border-[var(--theme-border)] flex flex-col items-center gap-2 bg-[var(--theme-surface)]">
                                <Zap className="w-6 h-6 text-[var(--theme-accent)] drop-shadow-[0_0_8px_var(--theme-glow)]" />
                                <span className="text-2xl font-black text-[var(--theme-text)]">{stats?.bestStreak || 0}</span>
                                <span className="text-[10px] text-[var(--theme-text-dim)] uppercase tracking-widest font-bold">Max Streak</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Customization Form */}
                    <section className="glass-panel p-8 rounded-[2rem] border border-[var(--theme-border)] bg-[var(--theme-surface)]">
                        <h2 className="text-xl font-black text-[var(--theme-text)] mb-8 uppercase tracking-tighter flex items-center gap-3">
                            <Settings className="w-6 h-6 text-[var(--theme-accent)]" />
                            ID Customization
                        </h2>

                        <form onSubmit={handleSaveProfile} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-black text-[var(--theme-title)]/60 uppercase tracking-[0.2em] px-1">Choose Identity Preset</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {AVATAR_PRESETS.map((p) => (
                                        <button
                                            key={p.key}
                                            type="button"
                                            onClick={() => setAvatarKey(p.key)}
                                            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${avatarKey === p.key
                                                ? 'bg-[var(--theme-accent)]/20 border-[var(--theme-accent)] shadow-[0_0_20px_var(--theme-glow)]'
                                                : 'bg-[var(--theme-surface-strong)]/40 border-[var(--theme-border)] hover:border-[var(--theme-accent)]/50'
                                                }`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--theme-accent)]/30 to-[var(--theme-accent-alt)]/30 flex items-center justify-center`}>
                                                <p.icon className="w-5 h-5 text-[var(--theme-text)]" />
                                            </div>
                                            <span className="text-[10px] font-black text-[var(--theme-text)] uppercase">{p.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[var(--theme-text-dim)] uppercase tracking-[0.2em] px-1">Gamer Tag</label>
                                    <input
                                        type="text"
                                        value={gamerTag}
                                        onChange={(e) => setGamerTag(e.target.value)}
                                        className="w-full bg-[var(--theme-bg-base)]/40 border border-[var(--theme-border)] rounded-xl px-4 py-3 text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)] transition-colors"
                                        placeholder="e.g. WolfHunter_99"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black text-[var(--theme-text-dim)] uppercase tracking-[0.2em] px-1">Favorite Game</label>
                                    <input
                                        type="text"
                                        value={favoriteGame}
                                        onChange={(e) => setFavoriteGame(e.target.value)}
                                        className="w-full bg-[var(--theme-bg-base)]/40 border border-[var(--theme-border)] rounded-xl px-4 py-3 text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)] transition-colors"
                                        placeholder="Snake, Tetris, etc."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black text-[var(--theme-text-dim)] uppercase tracking-[0.2em] px-1">ID Dossier (Bio)</label>
                                <textarea
                                    rows={4}
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className="w-full bg-[var(--theme-bg-base)]/40 border border-[var(--theme-border)] rounded-2xl px-4 py-3 text-sm text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)] transition-colors resize-none"
                                    placeholder="Write your legend here..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-alt)] text-[var(--theme-selection-text)] font-black uppercase tracking-[0.2em] text-sm hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_30px_var(--theme-glow)] disabled:opacity-50"
                            >
                                {saving ? "Updating ID..." : "Update Gamer Profile"}
                            </button>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default Profile;
