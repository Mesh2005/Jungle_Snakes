import { useState, useEffect } from 'react';

const Leaf1 = ({ className, style }: any) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.5,4.5c-2.4-3-7.5-3.3-10.4-1.2C4.1,5,3.6,9.1,5.3,12.2c0.3,0.6,0.7,1.1,1.2,1.6 c-0.5,0.7-1,1.5-1.4,2.3C4.2,17.9,5,20.4,7,19.3c0.8-0.5,1.5-1.1,2.1-1.8c1,0.5,2.1,0.8,3.2,0.8c3.8,0,7.1-2.9,7.6-6.7 C20.3,8.7,19.3,5.8,17.5,4.5z M13,16.2c-0.6,0-1.2-0.1-1.8-0.3l1.8-8c0.1-0.4-0.1-0.8-0.5-0.9c-0.4-0.1-0.8,0.1-0.9,0.5l-2,8.8 c-0.6-0.6-1.1-1.3-1.4-2.1l0.6-2.5c0.1-0.4-0.1-0.8-0.5-0.9c-0.4-0.1-0.8,0.1-0.9,0.5l-0.7,3c-0.8-1.4-1-3.1-0.4-4.6 c1.1-2.5,4-3.8,6.6-2.9C15.8,7.9,17.1,11,16.2,13.6C15.6,15.2,14.4,16.2,13,16.2z" />
    </svg>
);

const Leaf2 = ({ className, style }: any) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M21.5 2.5C21.5 2.5 14.2 2 8.5 7.7C2.8 13.4 2.2 20.8 2.2 20.8C2.2 20.8 9.6 21.4 15.4 15.6C21.1 9.9 21.5 2.5 21.5 2.5ZM12 16.5C12 16.5 14.3 12.5 17.1 9.6L13.7 13L12 16.5Z" />
    </svg>
);

const Leaf3 = ({ className, style }: any) => (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C12 2 15 6.8 18 9.5C20.5 11.7 21.8 11.5 21.8 11.5C21.8 11.5 18.8 13.2 18 13.8C17.4 14.2 16 14.5 15.2 15C14.2 15.6 13.8 16.2 13.5 17.2C13.2 18.2 13 20 13 20V22H11V20C11 20 10.8 18.2 10.5 17.2C10.2 16.2 9.8 15.6 8.8 15C8 14.5 6.6 14.2 6 13.8C5.2 13.2 2.2 11.5 2.2 11.5C2.2 11.5 3.5 11.7 6 9.5C9 6.8 12 2 12 2Z" />
    </svg>
);

export const FallingSnakes = () => {
    const [fadeBurst, setFadeBurst] = useState(false);

    useEffect(() => {
        // Start fading the extra burst of fireflies after 3.5 seconds
        const timer = setTimeout(() => {
            setFadeBurst(true);
        }, 3500);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="ambient-jungle">
            {/* Initial Burst Fireflies (They fade out smoothly) */}
            <div className={`transition-opacity duration-[4000ms] ${fadeBurst ? 'opacity-0' : 'opacity-100'}`}>
                <div className="absolute rounded-full bg-[var(--theme-accent)] blur-[2px] animate-firefly shadow-[0_0_10px_var(--theme-glow)]" style={{ left: '8%', bottom: '-5%', width: '5px', height: '5px', animationDelay: '0.1s', animationDuration: '5s' }} />
                <div className="absolute rounded-full bg-[var(--theme-accent-alt)] blur-[2px] animate-firefly shadow-[0_0_10px_var(--theme-glow)]" style={{ left: '18%', bottom: '-5%', width: '7px', height: '7px', animationDelay: '0.5s', animationDuration: '7s' }} />
                <div className="absolute rounded-full bg-[var(--theme-accent)] blur-[2px] animate-firefly shadow-[0_0_10px_var(--theme-glow)]" style={{ left: '28%', bottom: '-5%', width: '4px', height: '4px', animationDelay: '0.2s', animationDuration: '4.5s' }} />
                <div className="absolute rounded-full bg-[var(--theme-accent)] blur-[2px] animate-firefly shadow-[0_0_10px_var(--theme-glow)]" style={{ left: '38%', bottom: '-5%', width: '6px', height: '6px', animationDelay: '0.8s', animationDuration: '8s' }} />
                <div className="absolute rounded-full bg-[var(--theme-accent-alt)] blur-[2px] animate-firefly shadow-[0_0_10px_var(--theme-glow)]" style={{ left: '48%', bottom: '-5%', width: '5px', height: '5px', animationDelay: '0.3s', animationDuration: '6s' }} />
                <div className="absolute rounded-full bg-[var(--theme-accent)] blur-[2px] animate-firefly shadow-[0_0_10px_var(--theme-glow)]" style={{ left: '58%', bottom: '-5%', width: '8px', height: '8px', animationDelay: '0.6s', animationDuration: '7.5s' }} />
                <div className="absolute rounded-full bg-[var(--theme-accent)] blur-[2px] animate-firefly shadow-[0_0_10px_var(--theme-glow)]" style={{ left: '68%', bottom: '-5%', width: '4px', height: '4px', animationDelay: '0.4s', animationDuration: '5.5s' }} />
                <div className="absolute rounded-full bg-[var(--theme-accent-alt)] blur-[2px] animate-firefly shadow-[0_0_10px_var(--theme-glow)]" style={{ left: '78%', bottom: '-5%', width: '6px', height: '6px', animationDelay: '0.7s', animationDuration: '8.5s' }} />
                <div className="absolute rounded-full bg-[var(--theme-accent)] blur-[2px] animate-firefly shadow-[0_0_10px_var(--theme-glow)]" style={{ left: '88%', bottom: '-5%', width: '5px', height: '5px', animationDelay: '0.2s', animationDuration: '6.5s' }} />
                <div className="absolute rounded-full bg-[var(--theme-accent)] blur-[2px] animate-firefly shadow-[0_0_10px_var(--theme-glow)]" style={{ left: '98%', bottom: '-5%', width: '6px', height: '6px', animationDelay: '0.9s', animationDuration: '7s' }} />
            </div>

            {/* Base Permanent Fireflies */}
            <div className="absolute rounded-full bg-[var(--theme-accent)] blur-[2px] animate-firefly shadow-[0_0_10px_var(--theme-glow)]" style={{ left: '10%', bottom: '-10%', width: '6px', height: '6px', animationDelay: '0s', animationDuration: '15s' }} />
            <div className="absolute rounded-full bg-[var(--theme-accent)] blur-[2px] animate-firefly shadow-[0_0_10px_var(--theme-glow)]" style={{ left: '25%', bottom: '-10%', width: '4px', height: '4px', animationDelay: '2s', animationDuration: '18s' }} />
            <div className="absolute rounded-full bg-[var(--theme-accent-alt)] blur-[2px] animate-firefly shadow-[0_0_10px_var(--theme-glow)]" style={{ left: '45%', bottom: '-10%', width: '8px', height: '8px', animationDelay: '4s', animationDuration: '14s' }} />
            <div className="absolute rounded-full bg-[var(--theme-accent)] blur-[2px] animate-firefly shadow-[0_0_10px_var(--theme-glow)]" style={{ left: '65%', bottom: '-10%', width: '5px', height: '5px', animationDelay: '1s', animationDuration: '20s' }} />
            <div className="absolute rounded-full bg-[var(--theme-accent)] blur-[2px] animate-firefly shadow-[0_0_10px_var(--theme-glow)]" style={{ left: '85%', bottom: '-10%', width: '7px', height: '7px', animationDelay: '7s', animationDuration: '16s' }} />

            {/* Diverse Leaves Layer */}
            <Leaf1 className="absolute text-[var(--theme-accent)]/20 animate-falling-leaf" style={{ left: '15%', top: '-10%', width: '32px', height: '32px', animationDelay: '2s', animationDuration: '14s', '--initial-rotation': '15deg' } as React.CSSProperties} />
            <Leaf2 className="absolute text-[var(--theme-accent)]/15 animate-falling-leaf" style={{ left: '35%', top: '-10%', width: '24px', height: '24px', animationDelay: '5s', animationDuration: '18s', '--initial-rotation': '-20deg' } as React.CSSProperties} />
            <Leaf3 className="absolute text-[var(--theme-accent-alt)]/20 animate-falling-leaf" style={{ left: '55%', top: '-10%', width: '28px', height: '28px', animationDelay: '0.5s', animationDuration: '12s', '--initial-rotation': '45deg' } as React.CSSProperties} />
            <Leaf1 className="absolute text-[var(--theme-accent)]/20 animate-falling-leaf" style={{ left: '75%', top: '-10%', width: '42px', height: '42px', animationDelay: '8s', animationDuration: '16s', '--initial-rotation': '-10deg' } as React.CSSProperties} />
            <Leaf2 className="absolute text-[var(--theme-accent)]/25 animate-falling-leaf" style={{ left: '90%', top: '-10%', width: '20px', height: '20px', animationDelay: '3s', animationDuration: '15s', '--initial-rotation': '30deg' } as React.CSSProperties} />
            <Leaf3 className="absolute text-[var(--theme-accent-alt)]/15 animate-falling-leaf" style={{ left: '8%', top: '-10%', width: '30px', height: '30px', animationDelay: '9s', animationDuration: '17s', '--initial-rotation': '-40deg' } as React.CSSProperties} />
            <Leaf2 className="absolute text-[var(--theme-accent)]/20 animate-falling-leaf" style={{ left: '48%', top: '-10%', width: '26px', height: '26px', animationDelay: '1s', animationDuration: '13s', '--initial-rotation': '60deg' } as React.CSSProperties} />
            <Leaf1 className="absolute text-[var(--theme-accent)]/15 animate-falling-leaf" style={{ left: '62%', top: '-10%', width: '38px', height: '38px', animationDelay: '11s', animationDuration: '19s', '--initial-rotation': '10deg' } as React.CSSProperties} />
            <Leaf3 className="absolute text-[var(--theme-text-dim)]/15 animate-falling-leaf" style={{ left: '82%', top: '-10%', width: '22px', height: '22px', animationDelay: '6s', animationDuration: '22s', '--initial-rotation': '-80deg' } as React.CSSProperties} />

        </div>
    );
};

