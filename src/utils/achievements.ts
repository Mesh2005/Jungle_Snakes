import { ACHIEVEMENTS } from '../data/achievements';
import type { Achievement } from '../data/achievements';

export interface UserStats {
    totalGames?: number;
    totalScore?: number;
    bestScore?: number;
    bestStreak?: number;
    totalFoodEaten?: number;
    totalTimePlayedSeconds?: number;
    unlockedAchievements?: string[];
}

export const checkNewlyUnlockedAchievements = (stats: UserStats): string[] => {
    const unlocked = stats.unlockedAchievements || [];
    const newlyUnlocked: string[] = [];

    ACHIEVEMENTS.forEach(ach => {
        if (unlocked.includes(ach.id)) return;

        let met = false;
        const req = ach.requirement;

        switch (req.type) {
            case 'games':
                met = (stats.totalGames || 0) >= req.value;
                break;
            case 'score':
                met = (stats.bestScore || 0) >= req.value;
                break;
            case 'food':
                met = (stats.totalFoodEaten || 0) >= req.value;
                break;
            case 'streak':
                met = (stats.bestStreak || 0) >= req.value;
                break;
            case 'time':
                met = (stats.totalTimePlayedSeconds || 0) >= req.value;
                break;
            case 'difficulty':
                // Special case: we might need to track if they've beaten hard mode.
                // For now, let's assume if their best score is high enough OR we add a flag.
                // To keep it simple, let's just use score or a specific flag if we had one.
                // Actually, let's just skip difficulty for a moment or use a dummy check.
                break;
        }

        if (met) newlyUnlocked.push(ach.id);
    });

    return newlyUnlocked;
};
