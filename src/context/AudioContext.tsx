/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useTheme } from './ThemeContext';

import jungleSrc from '../assets/jungle.mp3';
import neonSrc from '../assets/neon.mp3';
import clearDaySrc from '../assets/clearday.mp3';
import inkSrc from '../assets/ink.mp3';

interface AudioContextType {
    musicVolume: number;
    setMusicVolume: (v: number) => void;
    musicEnabled: boolean;
    setMusicEnabled: (v: boolean) => void;
    vfxEnabled: boolean;
    setVFXEnabled: (v: boolean) => void;
    playVFX: (type: 'click' | 'powerup' | 'death' | 'food') => void;
}

const Ctx = createContext<AudioContextType | undefined>(undefined);

// Map theme → audio file
const TRACK: Record<string, string> = {
    jungle: jungleSrc,
    neon: neonSrc,
    day: clearDaySrc,
    monochrome: inkSrc,
};

// ─── VFX Audio Context (singleton) ───────────────────────────────────────────
let _vfxCtx: AudioContext | null = null;
function getVfxCtx(): AudioContext {
    if (!_vfxCtx) {
        const W = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
        const AC = W.AudioContext ?? W.webkitAudioContext;
        if (!AC) throw new Error('AudioContext not supported');
        const ctx = new AC();
        _vfxCtx = ctx;
        return ctx;
    }
    return _vfxCtx;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { theme } = useTheme();

    const [musicVolume, setMVS] = useState(() => parseFloat(localStorage.getItem('musicVolume') ?? '0.5'));
    const [musicEnabled, setMES] = useState(() => localStorage.getItem('musicEnabled') !== 'false');
    const [vfxEnabled, setVES] = useState(() => localStorage.getItem('soundEnabled') !== 'false');

    // The currently playing <audio> element
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const unlockedRef = useRef(false);

    const themeRef = useRef(theme);
    const volRef = useRef(musicVolume);
    const enableRef = useRef(musicEnabled);
    useEffect(() => { themeRef.current = theme; }, [theme]);
    useEffect(() => { volRef.current = musicVolume; }, [musicVolume]);
    useEffect(() => { enableRef.current = musicEnabled; }, [musicEnabled]);

    // ── Core: switch to a new track ───────────────────────────────────────────
    const switchTrack = (newTheme: string, vol: number, enabled: boolean) => {
        // Fade out current track
        const prev = audioRef.current;
        if (prev && !prev.paused) {
            const fadeOut = setInterval(() => {
                if (prev.volume > 0.05) {
                    prev.volume = Math.max(0, prev.volume - 0.05);
                } else {
                    prev.pause();
                    prev.src = '';
                    clearInterval(fadeOut);
                }
            }, 40);
        } else if (prev) {
            prev.pause();
            prev.src = '';
        }

        if (!enabled) { audioRef.current = null; return; }

        const src = TRACK[newTheme] ?? TRACK['jungle'];
        const audio = new Audio(src);
        audio.loop = true;
        audio.volume = 0; // start silent, fade in
        audioRef.current = audio;

        audio.play().then(() => {
            // Fade in
            const fadeIn = setInterval(() => {
                if (audio.volume < vol - 0.05) {
                    audio.volume = Math.min(vol, audio.volume + 0.04);
                } else {
                    audio.volume = vol;
                    clearInterval(fadeIn);
                }
            }, 40);
        }).catch(err => {
            console.warn('[Audio] play() failed:', err);
        });
    };

    // ── First-interaction unlock ───────────────────────────────────────────────
    useEffect(() => {
        const unlock = () => {
            if (unlockedRef.current) return;
            unlockedRef.current = true;
            console.log('[Audio] unlocked by user interaction');
            switchTrack(themeRef.current, volRef.current, enableRef.current);
            ['mousedown', 'keydown', 'touchstart'].forEach(ev =>
                document.removeEventListener(ev, unlock));
        };
        ['mousedown', 'keydown', 'touchstart'].forEach(ev =>
            document.addEventListener(ev, unlock));
        return () => ['mousedown', 'keydown', 'touchstart'].forEach(ev =>
            document.removeEventListener(ev, unlock));
    }, []);

    // ── Switch track when theme changes ───────────────────────────────────────
    useEffect(() => {
        if (unlockedRef.current) {
            switchTrack(theme, volRef.current, enableRef.current);
        }
    }, [theme]);

    // ── Live volume control ───────────────────────────────────────────────────
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        if (!musicEnabled) {
            audio.pause();
        } else {
            audio.volume = musicVolume;
            if (audio.paused) {
                audio.play().catch(() => { });
            }
        }
    }, [musicVolume, musicEnabled]);

    // ── Setters ───────────────────────────────────────────────────────────────
    const setMusicVolume = (v: number) => { setMVS(v); localStorage.setItem('musicVolume', String(v)); };
    const setMusicEnabled = (v: boolean) => { setMES(v); localStorage.setItem('musicEnabled', String(v)); };
    const setVFXEnabled = (v: boolean) => { setVES(v); localStorage.setItem('soundEnabled', String(v)); };

    // ── VFX (Web Audio API) ───────────────────────────────────────────────────
    const playVFX = (type: 'click' | 'powerup' | 'death' | 'food') => {
        if (!vfxEnabled) return;
        const ctx = getVfxCtx();
        if (ctx.state === 'suspended') ctx.resume();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        switch (type) {
            case 'click':
                osc.type = 'sine';
                osc.frequency.setValueAtTime(700, now);
                osc.frequency.exponentialRampToValueAtTime(450, now + 0.04);
                gain.gain.setValueAtTime(0.12, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.07);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(now); osc.stop(now + 0.07);
                break;

            case 'food': {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(523, now);
                osc.frequency.exponentialRampToValueAtTime(784, now + 0.12);
                gain.gain.setValueAtTime(0.18, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);
                osc.connect(gain); gain.connect(ctx.destination);
                osc.start(now); osc.stop(now + 0.18);
                break;
            }

            case 'powerup': {
                // Sparkle ascending arpeggio
                [262, 330, 392, 523, 659].forEach((f, i) => {
                    const o = ctx.createOscillator();
                    const g = ctx.createGain();
                    o.type = 'sine'; o.frequency.value = f;
                    g.gain.setValueAtTime(0, now + i * 0.06);
                    g.gain.linearRampToValueAtTime(0.15, now + i * 0.06 + 0.02);
                    g.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.06 + 0.1);
                    o.connect(g); g.connect(ctx.destination);
                    o.start(now + i * 0.06); o.stop(now + i * 0.06 + 0.12);
                });
                return;
            }

            case 'death': {
                const lp = ctx.createBiquadFilter();
                lp.type = 'lowpass'; lp.frequency.value = 400;
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(60, now + 0.6);
                gain.gain.setValueAtTime(0.25, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.65);
                osc.connect(lp); lp.connect(gain); gain.connect(ctx.destination);
                osc.start(now); osc.stop(now + 0.7);
                return;
            }
        }
    };

    // ── Cleanup ────────────────────────────────────────────────────────────────
    useEffect(() => () => {
        audioRef.current?.pause();
        _vfxCtx?.close();
    }, []);

    return (
        <Ctx.Provider value={{
            musicVolume, setMusicVolume,
            musicEnabled, setMusicEnabled,
            vfxEnabled, setVFXEnabled,
            playVFX,
        }}>
            {children}
        </Ctx.Provider>
    );
};

export const useAudio = () => {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error('useAudio must be inside AudioProvider');
    return ctx;
};
