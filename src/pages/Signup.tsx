import { useState } from 'react';
import { createUserWithEmailAndPassword, sendEmailVerification, signInWithPopup } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../services/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, AlertCircle, Volume2, VolumeX } from 'lucide-react';
import { FallingSnakes } from '../components/FallingSnakes';
import { useAudio } from '../context/AudioContext';

const EMAIL_STORAGE_KEY = 'jungle-auth-email';

const getStoredEmail = () => {
    if (typeof window === 'undefined') return '';
    try {
        return sessionStorage.getItem(EMAIL_STORAGE_KEY) || '';
    } catch {
        return '';
    }
};

const storeEmail = (value: string) => {
    if (typeof window === 'undefined') return;
    try {
        sessionStorage.setItem(EMAIL_STORAGE_KEY, value);
    } catch {
        // ignore
    }
};

const validateEmail = (value: string): string => {
    if (!value.trim()) return 'Email is required.';
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!pattern.test(value.trim())) return 'Enter a valid email address.';
    return '';
};

const mapSignupError = (code?: string): string => {
    switch (code) {
        case 'auth/email-already-in-use':
            return 'An account with this email already exists. Try logging in instead.';
        case 'auth/invalid-email':
            return 'Enter a valid email address.';
        case 'auth/weak-password':
            return 'Password is too weak. Use at least 8 characters with letters and numbers.';
        case 'auth/operation-not-allowed':
            return 'Email/password sign up is not enabled in Firebase.';
        default:
            return 'Failed to create account. Please try again.';
    }
};

const Signup = () => {
    const [email, setEmail] = useState<string>(() => getStoredEmail());
    const [password, setPassword] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [gamerTag, setGamerTag] = useState('');
    const [error, setError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [loading, setLoading] = useState(false);
    const { musicEnabled, setMusicEnabled } = useAudio();
    const navigate = useNavigate();

    const getProviderErrorMsg = (code: string) => {
        switch (code) {
            case 'auth/operation-not-allowed':
                return 'Google sign-in is not enabled. Enable it in Firebase Console → Authentication → Sign-in method.';
            case 'auth/unauthorized-domain':
                return 'This domain is not authorized. Add it in Firebase Console → Authentication → Settings → Authorized domains.';
            case 'auth/popup-blocked':
                return 'Popup was blocked. Allow popups for this site and try again.';
            case 'auth/popup-closed-by-user':
                return '';
            case 'auth/account-exists-with-different-credential':
                return 'An account already exists with this email. Try logging in instead.';
            default:
                return null;
        }
    };

    const handleGoogleSignup = async () => {
        setLoading(true);
        setError('');
        try {
            if (!gamerTag.trim()) {
                setError('Please choose a game name to show on your profile.');
                setLoading(false);
                return;
            }
            const cred = await signInWithPopup(auth, googleProvider);
            const u = cred.user;
            const fallbackTag = u.email ? u.email.split('@')[0] : 'Jungle Hunter';
            await setDoc(
                doc(db, 'users', u.uid),
                {
                    gamerTag: gamerTag.trim() || fallbackTag,
                },
                { merge: true }
            );
            navigate('/home', { replace: true });
        } catch (err: any) {
            if (err?.code === 'auth/popup-closed-by-user') {
                // Ignore
            } else {
                const msg = getProviderErrorMsg(err?.code) || err?.message || 'Failed to sign up with Google.';
                setError(msg);
                console.error('Provider signup error:', err?.code, err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gamerTag.trim()) {
            return setError('Please choose a game name to show on your profile.');
        }
        const emailValidation = validateEmail(email);
        if (emailValidation) {
            setEmailError(emailValidation);
            return;
        }
        if (password !== confirmPass) {
            return setError("Passwords don't match");
        }

        setLoading(true);
        setError('');
        setEmailError('');

        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            if (userCred?.user) {
                const fallbackTag = email ? email.split('@')[0] : 'Jungle Hunter';
                await setDoc(
                    doc(db, 'users', userCred.user.uid),
                    {
                        gamerTag: gamerTag.trim() || fallbackTag,
                    },
                    { merge: true }
                );
                await sendEmailVerification(userCred.user);
            }
            navigate('/verify-email', { replace: true });
        } catch (err: any) {
            setError(mapSignupError(err?.code) || err?.message || 'Failed to create account.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen bg-[var(--theme-bg-base)] flex items-center justify-center px-4 py-8 text-[var(--theme-text)] overflow-hidden">
            {/* dynamic theme glows */}
            <div className="pointer-events-none absolute -top-40 -right-32 w-80 h-80 bg-[var(--theme-accent)]/10 blur-3xl rounded-full" />
            <div className="pointer-events-none absolute -bottom-40 -left-24 w-72 h-72 bg-[var(--theme-accent-alt)]/10 blur-3xl rounded-full" />
            <FallingSnakes />

            <div className="relative w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-10 items-center z-10">
                {/* Left: Game name + benefits */}
                <div className="order-2 md:order-1 space-y-6">
                    <p className="text-xs uppercase tracking-[0.35em] text-[var(--theme-accent)] mb-2">
                        Create your hunter profile
                    </p>
                    <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[var(--theme-accent)] via-[var(--theme-text)] to-[var(--theme-accent-alt)] drop-shadow-[0_0_20px_var(--theme-glow)]">
                            JUNGLE SNAKE
                        </span>
                        <span className="block mt-2 text-[var(--theme-text-dim)] text-lg md:text-xl font-semibold">
                            Sign up to start tracking your legend.
                        </span>
                    </h1>

                    <ul className="space-y-3 text-[var(--theme-text-dim)] text-sm mt-4">
                        <li className="glass-panel bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl px-4 py-3">
                            <span className="font-semibold text-[var(--theme-accent)]">Save best scores & streaks</span>
                            <p className="text-xs text-[var(--theme-text-dim)]/80">
                                Your highest scores and hottest streaks stay linked to your account.
                            </p>
                        </li>
                        <li className="glass-panel bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl px-4 py-3">
                            <span className="font-semibold text-[var(--theme-accent)]">Play across devices</span>
                            <p className="text-xs text-[var(--theme-text-dim)]/80">
                                Log in from anywhere and keep your game progress in sync.
                            </p>
                        </li>
                    </ul>
                </div>

                {/* Right: Signup card */}
                <div
                    className={`order-1 md:order-2 w-full max-w-md mx-auto glass-panel bg-[var(--theme-surface)] border border-[var(--theme-border-strong)] rounded-3xl shadow-2xl shadow-[var(--theme-glow)] p-8 space-y-8 backdrop-blur-xl transition-opacity ${loading ? 'opacity-70 pointer-events-none' : ''
                        }`}
                    aria-busy={loading}
                >
                    <div className="flex flex-col items-center gap-3">
                        <div
                            className="inline-flex items-center justify-center rounded-full bg-[var(--theme-bg-base)]/70 border border-[var(--theme-border)] p-1 text-[11px] font-semibold"
                            role="tablist"
                            aria-label="Authentication"
                        >
                            <button
                                type="button"
                                className="px-3 py-1.5 rounded-full text-[var(--theme-accent)]/80 hover:text-[var(--theme-accent)] transition-colors"
                                role="tab"
                                aria-selected="false"
                                onClick={() => navigate('/login')}
                            >
                                Log in
                            </button>
                            <button
                                type="button"
                                className="px-3 py-1.5 rounded-full bg-[var(--theme-accent)] text-black shadow-sm"
                                role="tab"
                                aria-selected="true"
                            >
                                Sign up
                            </button>
                        </div>

                        <div className="text-center space-y-1">
                            <h2 className="text-2xl font-bold text-[var(--theme-accent)] tracking-tight">Create your account</h2>
                            <p className="text-xs text-[var(--theme-text-dim)]">
                                Just a few details and you are in.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/15 border border-red-400/50 text-red-100 px-4 py-3 rounded-xl flex items-center gap-2 text-xs" role="alert">
                            <AlertCircle className="w-4 h-4" aria-hidden="true" /> {error}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSignup}>
                        <div className="space-y-4">
                            <div className="relative">
                                <input
                                    id="signup-gamertag"
                                    type="text"
                                    required
                                    maxLength={30}
                                    className="w-full px-4 py-3 bg-[var(--theme-bg-base)]/40 border border-[var(--theme-border)] rounded-xl focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent text-[var(--theme-text)] placeholder-[var(--theme-text-dim)]/50 outline-none transition-all"
                                    placeholder="Game name / gamer tag (e.g. Hunter)"
                                    value={gamerTag}
                                    onChange={(e) => setGamerTag(e.target.value)}
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3.5 text-[var(--theme-accent)]/70 w-5 h-5" aria-hidden="true" />
                                <input
                                    id="signup-email"
                                    type="email"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-[var(--theme-bg-base)]/40 border border-[var(--theme-border)] rounded-xl focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent text-[var(--theme-text)] placeholder-[var(--theme-text-dim)]/50 outline-none transition-all"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setEmail(value);
                                        storeEmail(value);
                                        if (emailError) {
                                            setEmailError(validateEmail(value));
                                        }
                                    }}
                                    onBlur={(e) => setEmailError(validateEmail(e.target.value))}
                                    aria-invalid={!!emailError || !!error}
                                    aria-describedby={emailError ? 'signup-email-error' : undefined}
                                />
                            </div>
                            {emailError && (
                                <p id="signup-email-error" className="text-[11px] text-red-300 mt-1">
                                    {emailError}
                                </p>
                            )}
                            <div className="space-y-2">
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3.5 text-[var(--theme-accent)]/70 w-5 h-5" aria-hidden="true" />
                                    <input
                                        id="signup-password"
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-4 py-3 bg-[var(--theme-bg-base)]/40 border border-[var(--theme-border)] rounded-xl focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent text-[var(--theme-text)] placeholder-[var(--theme-text-dim)]/50 outline-none transition-all"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        aria-describedby="password-rules"
                                    />
                                </div>
                                <div
                                    id="password-rules"
                                    className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-[11px] text-[var(--theme-text-dim)]"
                                >
                                    {[
                                        { ok: password.length >= 8, label: '8+ chars' },
                                        { ok: /[A-Za-z]/.test(password), label: 'Letter' },
                                        { ok: /\d/.test(password), label: 'Number' },
                                    ].map((rule) => (
                                        <div
                                            key={rule.label}
                                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full border ${rule.ok
                                                    ? 'border-[var(--theme-accent)]/60 bg-[var(--theme-bg-base)]/60 text-[var(--theme-accent)]'
                                                    : 'border-[var(--theme-border)] bg-[var(--theme-bg-base)]/40 text-[var(--theme-text-dim)]/60'
                                                }`}
                                        >
                                            <span
                                                className={`w-1.5 h-1.5 rounded-full ${rule.ok ? 'bg-[var(--theme-accent)]' : 'bg-[var(--theme-text-dim)]/40'
                                                    }`}
                                                aria-hidden="true"
                                            />
                                            <span>{rule.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3.5 text-[var(--theme-accent)]/70 w-5 h-5" aria-hidden="true" />
                                <input
                                    id="signup-confirm-password"
                                    type="password"
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-[var(--theme-bg-base)]/40 border border-[var(--theme-border)] rounded-xl focus:ring-2 focus:ring-[var(--theme-accent)] focus:border-transparent text-[var(--theme-text)] placeholder-[var(--theme-text-dim)]/50 outline-none transition-all"
                                    placeholder="Confirm password"
                                    value={confirmPass}
                                    onChange={(e) => setConfirmPass(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-[var(--theme-accent)] to-[var(--theme-accent-alt)] shadow-[0_0_25px_var(--theme-glow)] hover:shadow-[0_0_35px_var(--theme-glow-strong)] hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : <><UserPlus className="w-4 h-4" /> Sign Up</>}
                        </button>
                    </form>

                    <div className="flex items-center my-4">
                        <div className="flex-1 h-px bg-[var(--theme-border)]" />
                        <span className="px-3 text-[11px] uppercase tracking-[0.2em] text-[var(--theme-text-dim)]">or sign up with</span>
                        <div className="flex-1 h-px bg-[var(--theme-border)]" />
                    </div>

                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleGoogleSignup}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-[var(--theme-bg-base)]/60 border border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-surface)] transition-colors disabled:opacity-60"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="text-center text-xs text-[var(--theme-text-dim)]">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-[var(--theme-accent)] hover:underline">
                            Log in instead
                        </Link>
                    </div>
                </div>
            </div>

            {/* Floating music toggle (right-center) */}
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
        </div>
    );
};

export default Signup;
