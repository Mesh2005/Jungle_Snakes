import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendEmailVerification } from 'firebase/auth';
import { useAuth } from '../context/AuthContext';
import { auth } from '../services/firebase';
import { Mail, CheckCircle, Loader2, AlertCircle, Send } from 'lucide-react';

const VerifyEmail = () => {
    const { user, emailVerified, isAdmin, refreshUser, loading } = useAuth();
    const navigate = useNavigate();
    const [checking, setChecking] = useState(false);
    const [resending, setResending] = useState(false);
    const [resendDone, setResendDone] = useState(false);
    const [message, setMessage] = useState<'idle' | 'verified' | 'not_yet'>('idle');

    const handleCheckVerification = async () => {
        if (!user) return;
        setChecking(true);
        setMessage('idle');
        try {
            await refreshUser();
            const current = auth.currentUser;
            if (current?.emailVerified) {
                setMessage('verified');
                navigate('/home', { replace: true });
            } else {
                setMessage('not_yet');
            }
        } catch {
            setMessage('not_yet');
        } finally {
            setChecking(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--theme-bg-base)] text-[var(--theme-text)]">
                <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-accent)]" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 bg-[var(--theme-bg-base)] text-[var(--theme-text)]">
                <div className="text-center space-y-4">
                    <p className="text-[var(--theme-accent)]">You must be signed in to verify your email.</p>
                    <Link to="/login" className="text-[var(--theme-accent)] underline font-semibold">Go to Login</Link>
                </div>
            </div>
        );
    }

    if (emailVerified || isAdmin) {
        navigate('/home', { replace: true });
        return null;
    }

    return (
        <div className="min-h-screen md:h-screen flex items-center justify-center px-4 md:px-6 py-10 md:py-0 bg-[var(--theme-bg-base)] text-[var(--theme-text)] overflow-hidden relative">
            <div className="pointer-events-none absolute -top-40 -right-32 w-80 h-80 bg-[var(--theme-accent)]/18 blur-3xl rounded-full" />
            <div className="pointer-events-none absolute -bottom-40 -left-24 w-72 h-72 bg-[var(--theme-accent-alt)]/16 blur-3xl rounded-full" />

            <div className="relative w-full max-w-md mx-auto glass-panel bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-2xl shadow-2xl p-8 space-y-6 backdrop-blur-xl z-10">
                <div className="flex justify-center">
                    <div className="p-4 bg-[var(--theme-accent)]/20 rounded-full">
                        <Mail className="w-12 h-12 text-[var(--theme-accent)]" />
                    </div>
                </div>
                <div className="text-center space-y-3">
                    <h1 className="text-2xl font-bold text-[var(--theme-text)]">Verify your email to enter the jungle</h1>
                    <p className="text-sm text-[var(--theme-text-dim)]">
                        To play ranked games and appear on the leaderboard, you need to confirm your email.
                    </p>
                    <p className="text-sm text-[var(--theme-text-dim)]">
                        We sent a verification link to
                    </p>
                    <p className="font-semibold text-[var(--theme-accent)] break-all">{user.email}</p>
                    <p className="text-xs text-[var(--theme-text-dim)] mt-2">
                        Click the link in that email to verify your account, then return here and tap the button below.
                    </p>
                </div>

                {message === 'not_yet' && (
                    <div className="bg-amber-500/15 border border-amber-400/50 text-amber-100 px-4 py-3 rounded-xl flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        Still not verified. Make sure you clicked the link in the email, then try again.
                    </div>
                )}

                <button
                    type="button"
                    onClick={handleCheckVerification}
                    disabled={checking}
                    className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-[var(--theme-selection-text)] bg-[var(--theme-accent)] shadow-[0_0_25px_var(--theme-glow)] hover:shadow-[0_0_35px_var(--theme-glow-strong)] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {checking ? (
                        <><Loader2 className="w-5 h-5 animate-spin" /> Checking...</>
                    ) : (
                        <><CheckCircle className="w-5 h-5" /> I've verified my email</>
                    )}
                </button>

                <div className="flex flex-col gap-2">
                    <button
                        type="button"
                        onClick={async () => {
                            if (!user || resending) return;
                            setResending(true);
                            setResendDone(false);
                            try {
                                await sendEmailVerification(user);
                                setResendDone(true);
                            } catch {
                                setMessage('not_yet');
                            } finally {
                                setResending(false);
                            }
                        }}
                        disabled={resending}
                        className="w-full flex justify-center items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium text-[var(--theme-accent)] border border-[var(--theme-accent)]/60 hover:bg-[var(--theme-accent)]/10 transition-colors disabled:opacity-60"
                    >
                        {resending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Resend verification email
                    </button>
                    {resendDone && <p className="text-center text-xs text-[var(--theme-accent)]">Check your inbox (and spam).</p>}
                </div>

                <p className="text-center text-xs text-[var(--theme-text-dim)]">
                    <Link to="/home" className="text-[var(--theme-accent)] underline">Go to home</Link>
                </p>
            </div>
        </div>
    );
};

export default VerifyEmail;
