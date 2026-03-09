import { useEffect, useState } from 'react';
import { getLeaderboard, type LeaderboardEntry } from '../services/leaderboard';
import { Trophy, Medal, Award, Loader2, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Leaderboard = () => {
    const navigate = useNavigate();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        getLeaderboard()
            .then((data) => {
                if (!cancelled) setEntries(data);
            })
            .catch((err) => {
                if (!cancelled) setError(err.message || 'Failed to load leaderboard');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    const rankIcon = (rank: number) => {
        if (rank === 1) return <Medal className="w-7 h-7 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]" />;
        if (rank === 2) return <Medal className="w-7 h-7 text-slate-300 drop-shadow-[0_0_8px_rgba(148,163,184,0.7)]" />;
        if (rank === 3) return <Medal className="w-7 h-7 text-orange-400 drop-shadow-[0_0_8px_rgba(251,146,60,0.7)]" />;
        return <span className="text-gray-400 font-bold w-6 text-center">{rank}</span>;
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden bg-[var(--theme-bg-base)]">
            {/* Ambient Backgrounds */}
            <div className="peripheral-glow" style={{ opacity: 0.4 }} />

            <div className="max-w-2xl mx-auto relative z-10">
                <button
                    onClick={() => navigate('/home')}
                    className="group flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-text-dim)] hover:text-[var(--theme-accent)] hover:border-[var(--theme-accent)] transition-all backdrop-blur-md shadow-lg mb-8"
                >
                    <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-wider">Back to Lobby</span>
                </button>
                <div className="flex items-center justify-center gap-3 mb-8">
                    <Trophy className="w-10 h-10 text-[var(--theme-accent)] drop-shadow-[0_0_15px_var(--theme-glow)]" />
                    <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-alt)]">
                        Leaderboard
                    </h1>
                </div>
                <p className="text-center text-[var(--theme-text-dim)] text-sm mb-6">
                    Legends ranked by best score, consistency and game mastery.
                </p>

                {loading && (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-10 h-10 animate-spin text-[var(--theme-accent)]" />
                    </div>
                )}

                {error && (
                    <div className="bg-red-500/15 border border-red-400/50 text-red-100 px-4 py-3 rounded-xl text-center">
                        {error}
                    </div>
                )}

                {!loading && !error && entries.length === 0 && (
                    <div className="glass-panel bg-[var(--theme-surface)] rounded-2xl p-8 text-center text-[var(--theme-text-dim)] border border-[var(--theme-border)]">
                        <Award className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No scores yet. Be the first to verify your email and play!</p>
                    </div>
                )}

                {!loading && !error && entries.length > 0 && (
                    <ul className="space-y-2">
                        {entries.map((entry, index) => {
                            const rank = index + 1;
                            const isTopThree = rank <= 3;

                            return (
                                <li
                                    key={entry.userId}
                                    className={[
                                        'glass-panel flex items-center gap-4 p-4 rounded-xl border transition-all duration-200',
                                        isTopThree
                                            ? 'bg-gradient-to-r from-[var(--theme-surface-strong)] via-[var(--theme-surface)] to-[var(--theme-surface)] border-[var(--theme-accent)]/60 shadow-[0_0_25px_var(--theme-glow)] scale-[1.02]'
                                            : 'bg-[var(--theme-surface)] border-[var(--theme-border)] hover:border-[var(--theme-accent)]/50',
                                    ].join(' ')}
                                >
                                    <div className="flex flex-col items-center justify-center w-12">
                                        {rankIcon(rank)}
                                        {isTopThree && (
                                            <span className="mt-1 text-[10px] font-black uppercase tracking-widest text-[var(--theme-text-dim)]">
                                                #{rank}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-[var(--theme-text)] truncate">
                                            {entry.displayName}
                                        </p>
                                        <p className="text-xs text-[var(--theme-text-dim)]">
                                            Best streak:{' '}
                                            <span className="text-[var(--theme-accent)]">{entry.bestStreak}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-bold text-[var(--theme-accent)]">
                                            {entry.bestScore}
                                        </p>
                                        <p className="text-xs text-[var(--theme-text-dim)]/70">best score</p>
                                        <p className="text-[11px] text-[var(--theme-text-dim)] mt-1">
                                            Games:{' '}
                                            <span className="text-[var(--theme-text)] font-semibold">
                                                {entry.totalGames}
                                            </span>
                                            {' · '}
                                            Avg:{' '}
                                            <span className="text-[var(--theme-text)] font-semibold">
                                                {entry.avgScore.toFixed(1)}
                                            </span>
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default Leaderboard;
