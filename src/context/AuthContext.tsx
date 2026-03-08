import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from '../services/firebase';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    emailVerified: boolean;
    isAdmin: boolean;
    refreshUser: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const refreshUser = useCallback(async () => {
        const u = auth.currentUser;
        if (u) {
            await u.reload();
            setUser(u);
            setRefreshKey((k) => k + 1);
        }
    }, []);

    const signOut = async () => {
        await firebaseSignOut(auth);
    };

    const emailVerified = (user?.emailVerified === true);
    const isAdmin = user?.email === 'admin@gmail.com';

    return (
        <AuthContext.Provider value={{ user, loading, emailVerified, isAdmin, refreshUser, signOut }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
