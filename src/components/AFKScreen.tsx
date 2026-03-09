import React, { useState, useEffect, useCallback } from 'react';
import { MousePointer2, Keyboard, Zap, Ghost } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AFKScreenProps {
    onAction: () => void;
    timeoutSeconds?: number;
}

const FOREST_FACTS = [
    "Rainforests occupy less than 7% of Earth's land surface but house 50% of its species.",
    "A single large tree can provide a day's supply of oxygen for up to four people.",
    "Banyan trees can grow so large they look like entire forests of their own.",
    "The Amazon rainforest produces about 20% of the world's oxygen.",
    "Trees talk to each other through an underground fungal network nicknamed the 'Wood Wide Web'.",
    "Some trees can live for over 4,000 years, witness to millennia of history.",
    "The world's tallest tree, Hyperion, stands at over 380 feet tall.",
    "Forests are home to over 80% of the world's terrestrial biodiversity."
];

const AFKScreen: React.FC<AFKScreenProps> = ({ onAction, timeoutSeconds = 30 }) => {
    const [isAFK, setIsAFK] = useState(false);
    const { theme } = useTheme();
    const [lastActivity, setLastActivity] = useState(Date.now());
    const [factIndex, setFactIndex] = useState(0);

    const resetActivity = useCallback(() => {
        setLastActivity(Date.now());
        if (isAFK) {
            setIsAFK(false);
            onAction();
        }
    }, [isAFK, onAction]);

    useEffect(() => {
        const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, resetActivity));

        const interval = setInterval(() => {
            const now = Date.now();
            if (now - lastActivity > timeoutSeconds * 1000) {
                setIsAFK(true);
            }
        }, 1000);

        return () => {
            events.forEach(event => document.removeEventListener(event, resetActivity));
            clearInterval(interval);
        };
    }, [lastActivity, timeoutSeconds, resetActivity]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isAFK) {
            interval = setInterval(() => {
                setFactIndex(prev => (prev + 1) % FOREST_FACTS.length);
            }, 5000);
        }
        return () => clearInterval(interval);
    }, [isAFK]);

    if (!isAFK) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden transition-all duration-700">
            {/* Immersive Backdrop */}
            <div className="absolute inset-0 bg-[var(--theme-bg-base)]/80 backdrop-blur-[20px]" />

            {/* Dynamic Pattern Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,var(--theme-glow)_0%,transparent_70%)] animate-pulse-slow" />
                <div className="absolute top-[20%] left-[10%] w-64 h-64 bg-[var(--theme-accent)]/20 rounded-full blur-[80px] animate-float-slow" />
                <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-[var(--theme-accent-alt)]/20 rounded-full blur-[100px] animate-float-slow" style={{ animationDelay: '2s' }} />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center gap-8 p-12 text-center max-w-2xl">
                {/* Floating Icon Hexagon */}
                <div className="relative group">
                    <div className="absolute -inset-8 bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-alt)] rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity duration-1000 animate-pulse" />
                    <div className="relative w-32 h-32 flex items-center justify-center glass-panel rounded-[2rem] border-2 border-[var(--theme-accent)] shadow-[0_0_50px_var(--theme-glow)] animate-bounce-slow">
                        <Ghost className="w-16 h-16 text-[var(--theme-accent)] drop-shadow-[0_0_15px_var(--theme-glow)]" />
                    </div>
                </div>

                {/* Text Content */}
                <div className="space-y-4">
                    <h2 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[var(--theme-text)] via-[var(--theme-accent)] to-[var(--theme-text-dim)] tracking-tighter drop-shadow-xl">
                        STILL THERE?
                    </h2>
                    <p className="text-[var(--theme-text)] text-lg md:text-xl font-medium tracking-widest uppercase opacity-90">
                        The jungle doesn't wait for anyone.
                    </p>
                </div>

                {/* Dynamic Fact Section */}
                <div className="glass-panel p-6 rounded-3xl border border-[var(--theme-border)] bg-[var(--theme-surface)]/40 relative overflow-hidden group min-h-[140px] flex flex-col justify-center">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--theme-accent)] to-[var(--theme-accent-alt)]" />
                    <div className="flex items-start gap-4 text-left">
                        <div className="p-2 rounded-lg bg-[var(--theme-accent)]/10 text-[var(--theme-accent)] mt-1 shrink-0">
                            <Zap className="w-4 h-4" />
                        </div>
                        <div className="space-y-1">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-accent)] opacity-80">
                                Jungle Lore
                            </span>
                            <p
                                key={factIndex}
                                className="text-sm md:text-base text-[var(--theme-text)] font-medium leading-relaxed animate-[fadeIn_0.5s_ease-out]"
                            >
                                {FOREST_FACTS[factIndex]}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Action Indicators */}
                <div className="flex gap-12 mt-4">
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-accent)] animate-pulse">
                            <MousePointer2 className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-text-dim)]">MOVE MOUSE</span>
                    </div>
                    <div className="flex flex-col items-center gap-3">
                        <div className="p-4 rounded-2xl bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-accent-alt)] animate-pulse" style={{ animationDelay: '0.5s' }}>
                            <Keyboard className="w-6 h-6" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-text-dim)]">PRESS ANY KEY</span>
                    </div>
                </div>
            </div>

            {/* Scanning Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-10">
                <div className="w-full h-[1px] bg-[var(--theme-accent)] absolute top-0 animate-[scan_4s_linear_infinite]" />
            </div>
        </div>
    );
};


export default AFKScreen;
