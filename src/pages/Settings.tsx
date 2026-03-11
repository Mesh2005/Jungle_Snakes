import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { Home, Volume2, Zap, Palette, Check, Music, Play } from 'lucide-react';
import { useAudio } from '../context/AudioContext';

const Settings = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();
    const { musicVolume, setMusicVolume, musicEnabled, setMusicEnabled, vfxEnabled, setVFXEnabled, playVFX } = useAudio();
    const [animationsEnabled, setAnimationsEnabled] = useState(true);

    // Load settings from localStorage on mount
    useEffect(() => {
        const savedAnimations = localStorage.getItem('animationsEnabled');
        if (savedAnimations !== null) setAnimationsEnabled(savedAnimations === 'true');
    }, []);



    useEffect(() => {
        localStorage.setItem('animationsEnabled', animationsEnabled.toString());
        const root = document.documentElement;
        if (animationsEnabled) {
            root.classList.remove('no-anim');
        } else {
            root.classList.add('no-anim');
        }
    }, [animationsEnabled]);

    const themes: { id: 'jungle' | 'neon' | 'day' | 'monochrome', name: string, colors: string[], desc: string }[] = [
        { id: 'jungle', name: 'Jungle Forest', colors: ['#062015', '#a3ff3c', '#fbbf24'], desc: 'Classic deep forest atmosphere' },
        { id: 'neon', name: 'Neon Lights', colors: ['#0f021a', '#f0abfc', '#2dd4bf'], desc: 'Electric cyberpunk glow' },
        { id: 'day', name: 'Clear Day', colors: ['#f8fafc', '#0f172a', '#3b82f6'], desc: 'Minimalist light interface' },
        { id: 'monochrome', name: 'Ink & Paper', colors: ['#000000', '#ffffff', '#888888'], desc: 'Sharp black and white contrast' },
    ];

    return (
        <div className="min-h-screen pt-20 pb-8 px-4 transition-colors duration-300">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/home')}
                        className="mb-4 glass-panel p-3 rounded-xl hover:bg-[var(--theme-surface)] transition-all flex items-center gap-2 text-sm font-semibold text-[var(--theme-accent)] border border-[var(--theme-border)] hover:scale-105"
                    >
                        <Home className="w-4 h-4" />
                        Back to Lobby
                    </button>
                    <h1 className="text-4xl font-extrabold text-[var(--theme-text)] mb-2 drop-shadow-[0_0_20px_var(--theme-glow)]">
                        Settings
                    </h1>
                    <p className="text-[var(--theme-text-dim)]">Customize your experience</p>
                </div>

                {/* Settings Sections */}
                <div className="space-y-6">
                    {/* Theme Gallery Section */}
                    <div className="glass-panel p-6 rounded-2xl">
                        <div className="flex items-center gap-3 mb-6">
                            <Palette className="w-6 h-6 text-[var(--theme-accent)]" />
                            <h2 className="text-xl font-bold text-[var(--theme-accent)] uppercase tracking-tight">Visual Theme</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {themes.map((t) => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={`relative group flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-300 ${theme === t.id
                                        ? 'border-[var(--theme-accent)] bg-[var(--theme-surface)] shadow-[0_0_20px_var(--theme-glow)]'
                                        : 'border-white/5 bg-black/20 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden border border-white/10 flex">
                                        {t.colors.map((c, i) => (
                                            <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                                        ))}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <h3 className={`font-bold ${theme === t.id ? 'text-[var(--theme-accent)]' : 'text-gray-200'}`}>{t.name}</h3>
                                        <p className="text-xs text-gray-500">{t.desc}</p>
                                    </div>
                                    {theme === t.id && (
                                        <div className="w-6 h-6 rounded-full bg-[var(--theme-accent)] flex items-center justify-center text-black">
                                            <Check className="w-4 h-4 stroke-[3px]" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Preferences Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Background Music Section */}
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <Music className="w-6 h-6 text-[var(--theme-accent)]" />
                                <h2 className="text-xl font-bold text-[var(--theme-accent)]">Background Music</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className="text-[var(--theme-text-dim)]">Enable music</span>
                                    <button
                                        onClick={() => setMusicEnabled(!musicEnabled)}
                                        className={`relative w-14 h-7 rounded-full transition-colors ${musicEnabled ? 'bg-[var(--theme-accent)]' : 'bg-gray-600'
                                            }`}
                                    >
                                        <span
                                            className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${musicEnabled ? 'translate-x-7' : 'translate-x-0'
                                                }`}
                                        />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[var(--theme-text-dim)]">
                                        <span>Volume</span>
                                        <span>{Math.round(musicVolume * 100)}%</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.01"
                                        value={musicVolume}
                                        onChange={(e) => setMusicVolume(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[var(--theme-accent)]"
                                    />
                                </div>

                            </div>
                        </div>

                        {/* Sound Effects (VFX) */}
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <Volume2 className="w-6 h-6 text-[var(--theme-accent)]" />
                                <h2 className="text-xl font-bold text-[var(--theme-accent)]">Sound Effects</h2>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--theme-text-dim)]">Enable VFX sounds</span>
                                <button
                                    onClick={() => setVFXEnabled(!vfxEnabled)}
                                    className={`relative w-14 h-7 rounded-full transition-colors ${vfxEnabled ? 'bg-[var(--theme-accent)]' : 'bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${vfxEnabled ? 'translate-x-7' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Animations */}
                        <div className="glass-panel p-6 rounded-2xl">
                            <div className="flex items-center gap-3 mb-6">
                                <Zap className="w-6 h-6 text-[var(--theme-accent)]" />
                                <h2 className="text-xl font-bold text-[var(--theme-accent)]">VFX</h2>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--theme-text-dim)]">Enable visual effects</span>
                                <button
                                    onClick={() => setAnimationsEnabled(!animationsEnabled)}
                                    className={`relative w-14 h-7 rounded-full transition-colors ${animationsEnabled ? 'bg-[var(--theme-accent)]' : 'bg-gray-600'
                                        }`}
                                >
                                    <span
                                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${animationsEnabled ? 'translate-x-7' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
