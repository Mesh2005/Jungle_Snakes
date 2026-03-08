export interface RankInfo {
    level: number;
    rank: string;
    progress: number;
    nextLevelAt: number;
    currentLevelAt: number;
    color: string;
    glow: string;
}

export const getRankInfo = (totalScore: number): RankInfo => {
    // level = floor(sqrt(totalScore / 100)) + 1
    // Doubled the difficulty from previous 50 to 100
    const scoreFactor = 100;
    const level = Math.floor(Math.sqrt(totalScore / scoreFactor)) + 1;

    const currentLevelAt = Math.pow(level - 1, 2) * scoreFactor;
    const nextLevelAt = Math.pow(level, 2) * scoreFactor;

    const range = nextLevelAt - currentLevelAt;
    const currentProgress = totalScore - currentLevelAt;
    const progress = range > 0 ? (currentProgress / range) * 100 : 100;

    let rank = 'Novice Hunter';
    let color = 'text-gray-400';
    let glow = 'shadow-[0_0_10px_rgba(156,163,175,0.5)]';

    if (level >= 50) {
        rank = 'Apex Predator';
        color = 'text-red-500';
        glow = 'shadow-[0_0_20px_rgba(239,68,68,0.8)]';
    } else if (level >= 35) {
        rank = 'Royal Guardian';
        color = 'text-amber-400';
        glow = 'shadow-[0_0_15px_rgba(251,191,36,0.7)]';
    } else if (level >= 20) {
        rank = 'Jungle Master';
        color = 'text-cyan-400';
        glow = 'shadow-[0_0_15px_rgba(34,211,238,0.7)]';
    } else if (level >= 10) {
        rank = 'Viper Scout';
        color = 'text-emerald-400';
        glow = 'shadow-[0_0_12px_rgba(52,211,153,0.6)]';
    } else if (level >= 5) {
        rank = 'Forest Runner';
        color = 'text-lime-400';
        glow = 'shadow-[0_0_10px_rgba(163,230,53,0.5)]';
    }

    return {
        level,
        rank,
        progress: Math.min(100, Math.max(0, progress)),
        nextLevelAt,
        currentLevelAt,
        color,
        glow
    };
};
