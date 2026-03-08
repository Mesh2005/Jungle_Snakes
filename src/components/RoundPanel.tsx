import React from 'react';
import type { RoundData } from '../hooks/usePrefetchRound';
import { Loader2 } from 'lucide-react';

interface RoundPanelProps {
    round: RoundData | null;
    loading: boolean;
    timeLeft: number;
}

const RoundPanel: React.FC<RoundPanelProps> = ({ round, loading, timeLeft }) => {
    return (
        <div className="glass-panel p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center space-y-6 h-full min-h-[300px] bg-[var(--theme-surface)] border border-[var(--theme-border)]">
            <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-[var(--theme-accent)] drop-shadow-[0_0_10px_var(--theme-glow)]">Target</h2>
                <p className="text-xs text-[var(--theme-text-dim)]">Identify the number!</p>
            </div>

            <div className="relative w-full aspect-square max-w-[200px] bg-[var(--theme-bg-base)]/50 rounded-lg overflow-hidden flex items-center justify-center border border-[var(--theme-border)] shadow-inner">
                {loading ? (
                    <Loader2 className="w-8 h-8 text-[var(--theme-accent)] animate-spin" />
                ) : round ? (
                    <img
                        src={round.question}
                        alt="Solve this"
                        className="w-full h-full object-contain"
                    />
                ) : (
                    <span className="text-[var(--theme-text-dim)]">No Data</span>
                )}

                {/* Timer Overlay */}
                <div className={`absolute top-2 right-2 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg border-2 ${timeLeft <= 3 ? 'bg-red-500/80 border-red-400 text-white animate-pulse' : 'bg-[var(--theme-bg-secondary)] border-[var(--theme-accent)] text-[var(--theme-accent)]'
                    }`}>
                    {timeLeft}
                </div>
            </div>

            <div className="text-center space-y-2">
                <p className="text-sm font-medium text-[var(--theme-text)]">
                    Find the food with the matching number.
                </p>
                <p className="text-xs text-[var(--theme-text-dim)]">
                    Wrong food resets your streak!
                </p>
            </div>
        </div>
    );
};

export default RoundPanel;
