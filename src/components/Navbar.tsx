import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Leaf } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const Navbar = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [displayName, setDisplayName] = useState<string | null>(null);

    useEffect(() => {
        const loadName = async () => {
            if (!user) {
                setDisplayName(null);
                return;
            }
            try {
                const snap = await getDoc(doc(db, 'users', user.uid));
                const data = snap.data() as { gamerTag?: string } | undefined;
                const fallback = user.email ? user.email.split('@')[0] : 'Profile';
                setDisplayName((data && data.gamerTag) || fallback);
            } catch {
                const fallback = user?.email ? user.email.split('@')[0] : 'Profile';
                setDisplayName(fallback);
            }
        };
        void loadName();
    }, [user]);

    const toggle = () => setIsOpen(!isOpen);
    const close = () => setIsOpen(false);

    const links: { name: string; path: string }[] = [];

    return (
        <nav className="fixed top-0 w-full z-50 glass-panel border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <NavLink to="/home" className="flex items-center space-x-2 text-[var(--theme-accent)] font-bold text-xl tracking-wider">
                        <Leaf className="w-6 h-6 animate-pulse-slow" />
                        <span className="text-shadow-glow">JUNGLE SNAKE</span>
                    </NavLink>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            {links.map((link) => (
                                <NavLink
                                    key={link.name}
                                    to={link.path}
                                    className={({ isActive }) =>
                                        `px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive
                                            ? 'text-[var(--theme-accent)] bg-[var(--theme-surface)]'
                                            : 'text-[var(--theme-text-dim)] hover:text-[var(--theme-text)] hover:bg-white/5'
                                        }`
                                    }
                                >
                                    {link.name}
                                </NavLink>
                            ))}
                            {user ? (
                                <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm">
                                    <NavLink
                                        to="/profile"
                                        className={({ isActive }) =>
                                            `px-4 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 ${isActive
                                                ? 'text-[var(--theme-accent)] bg-[var(--theme-surface)] shadow-[0_0_15px_var(--theme-glow)]'
                                                : 'text-[var(--theme-text-dim)] hover:text-[var(--theme-text)] hover:bg-white/5'
                                            }`
                                        }
                                    >
                                        Profile
                                    </NavLink>
                                    <div className="w-[1px] h-4 bg-white/10 mx-1" />
                                    <button
                                        onClick={async () => {
                                            await signOut();
                                            navigate('/login', { replace: true });
                                        }}
                                        className="px-4 py-1.5 rounded-lg text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300"
                                    >
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <NavLink
                                    to="/login"
                                    className="px-4 py-2 rounded-xl bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)]/20 text-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/20 font-bold transition-all text-sm"
                                >
                                    Login
                                </NavLink>
                            )}
                        </div>
                    </div>

                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={toggle}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/5 focus:outline-none"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden glass-panel border-t border-white/5">
                    <div className="px-4 pt-2 pb-6 space-y-2">
                        {user ? (
                            <div className="flex flex-col gap-2 p-2 bg-white/5 border border-white/10 rounded-2xl">
                                <NavLink
                                    to="/profile"
                                    onClick={close}
                                    className={({ isActive }) =>
                                        `block px-4 py-3 rounded-xl text-base font-bold transition-all ${isActive
                                            ? 'text-[var(--theme-accent)] bg-[var(--theme-surface)]'
                                            : 'text-[var(--theme-text-dim)]'
                                        }`
                                    }
                                >
                                    Profile
                                </NavLink>
                                <button
                                    onClick={async () => {
                                        await signOut();
                                        close();
                                        navigate('/login', { replace: true });
                                    }}
                                    className="block w-full text-left px-4 py-3 rounded-xl text-base font-bold text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <NavLink
                                to="/login"
                                onClick={close}
                                className="block px-3 py-2 rounded-md text-base font-medium text-[var(--theme-text-dim)] hover:text-[var(--theme-accent)]"
                            >
                                Login
                            </NavLink>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
