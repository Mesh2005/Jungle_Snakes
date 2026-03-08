import type { LucideIcon } from 'lucide-react';
import { Trophy, Zap, Star, Target, Flame, Shield, Sparkles, TrendingUp } from 'lucide-react';

export type AchievementCategory = 'progression' | 'skill' | 'collection' | 'special';

export interface Achievement {
    id: string;
    title: string;
    description: string;
    category: AchievementCategory;
    icon: LucideIcon;
    requirement: {
        type: 'score' | 'games' | 'food' | 'streak' | 'time' | 'difficulty';
        value: number;
    };
    xpReward: number;
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_crawl',
        title: 'First Crawl',
        description: 'Completed your very first hunt in the jungle.',
        category: 'progression',
        icon: Target,
        requirement: { type: 'games', value: 1 },
        xpReward: 100
    },
    {
        id: 'jungle_apprentice',
        title: 'Jungle Apprentice',
        description: 'Played 10 total games.',
        category: 'progression',
        icon: Star,
        requirement: { type: 'games', value: 10 },
        xpReward: 500
    },
    {
        id: 'high_roller',
        title: 'High Roller',
        description: 'Score over 1,000 points in a single session.',
        category: 'skill',
        icon: Trophy,
        requirement: { type: 'score', value: 1000 },
        xpReward: 1000
    },
    {
        id: 'streak_master',
        title: 'Streak Master',
        description: 'Reached a multiplier streak of 10x.',
        category: 'skill',
        icon: Zap,
        requirement: { type: 'streak', value: 10 },
        xpReward: 750
    },
    {
        id: 'fruit_junkie',
        title: 'Fruit Junkie',
        description: 'Eat a total of 100 fruits across all games.',
        category: 'collection',
        icon: Sparkles,
        requirement: { type: 'food', value: 100 },
        xpReward: 500
    },
    {
        id: 'apex_predator',
        title: 'Apex Predator',
        description: 'Beat the game on ELITE difficulty.',
        category: 'skill',
        icon: Flame,
        requirement: { type: 'difficulty', value: 3 }, // 3 for Hard/Elite
        xpReward: 2000
    },
    {
        id: 'marathon_runner',
        title: 'Marathon Runner',
        description: 'Accumulate 60 minutes of total survival time.',
        category: 'progression',
        icon: TrendingUp,
        requirement: { type: 'time', value: 3600 }, // seconds
        xpReward: 1500
    },
    {
        id: 'untouchable',
        title: 'Untouchable',
        description: 'Survive for 3 minutes without losing a life.',
        category: 'special',
        icon: Shield,
        requirement: { type: 'time', value: 180 },
        xpReward: 1200
    }
];
