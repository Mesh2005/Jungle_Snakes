import {
    collection,
    doc,
    setDoc,
    getDocs,
    query,
    orderBy,
    limit,
    serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

const LEADERBOARD_COLLECTION = 'leaderboard';
const LEADERBOARD_LIMIT = 100;

export interface LeaderboardEntry {
    userId: string;
    email: string;
    gamerTag?: string;
    displayName: string;
    bestScore: number;
    bestStreak: number;
    totalGames: number;
    avgScore: number;
    updatedAt: unknown;
}

/**
 * Submit or update a verified user's best score on the leaderboard.
 * Only call this when user.emailVerified is true.
 */
export async function submitLeaderboardEntry(
    userId: string,
    email: string,
    score: number,
    bestStreak: number
): Promise<void> {
    const { getDoc } = await import('firebase/firestore');
    const entryRef = doc(db, LEADERBOARD_COLLECTION, userId);
    const snap = await getDoc(entryRef);
    const current = snap.data();
    const bestScore = Math.max(current?.bestScore ?? 0, score);
    const bestStreakVal = Math.max(current?.bestStreak ?? 0, bestStreak);
    const totalGames = (current?.totalGames ?? 0) + 1;
    const totalScore = (current?.totalScore ?? 0) + score;
    const avgScore = totalGames > 0 ? totalScore / totalGames : 0;

    await setDoc(entryRef, {
        userId,
        email: email || 'Anonymous',
        bestScore,
        bestStreak: bestStreakVal,
        totalGames,
        totalScore,
        avgScore,
        updatedAt: serverTimestamp(),
    }, { merge: true });
}

/**
 * Fetch top entries from the leaderboard ordered by bestScore descending.
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    const { getDoc } = await import('firebase/firestore');

    const q = query(
        collection(db, LEADERBOARD_COLLECTION),
        orderBy('bestScore', 'desc'),
        limit(LEADERBOARD_LIMIT)
    );
    const snapshot = await getDocs(q);

    const results: LeaderboardEntry[] = [];

    for (const d of snapshot.docs) {
        const data = d.data() as any;
        const userId = data.userId ?? d.id;
        const email: string = data.email ?? '';

        // Try to resolve a gamerTag from the users collection
        let gamerTag: string | undefined;
        try {
            const userRef = doc(db, 'users', userId);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data() as { gamerTag?: string } | undefined;
            gamerTag = userData?.gamerTag;
        } catch {
            // ignore lookup errors; we'll fall back gracefully
        }

        const fallbackName = email ? email.split('@')[0] : 'Hunter';
        const displayName = gamerTag || fallbackName;

        results.push({
            userId,
            email,
            gamerTag,
            displayName,
            bestScore: data.bestScore ?? 0,
            bestStreak: data.bestStreak ?? 0,
            totalGames: data.totalGames ?? 0,
            avgScore: data.avgScore ?? 0,
            updatedAt: data.updatedAt,
        });
    }

    return results;
}
