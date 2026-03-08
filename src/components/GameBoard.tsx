import React, { useMemo } from 'react';
import { Heart, Clock, Shield, EyeOff, Coins, CornerDownRight, Gauge } from 'lucide-react';
import { useSnakeGame } from '../hooks/useSnakeGame';
import type { Powerup, PowerupType } from '../hooks/useSnakeGame';

// Extract types we need
type UseSnakeGameReturn = ReturnType<typeof useSnakeGame>;
type Snake = UseSnakeGameReturn['snake'];
type Food = UseSnakeGameReturn['foods'][0];

interface GameBoardProps {
    snake: Snake;
    foods: Food[];
    powerups: Powerup[];
    invisibleUntil?: number;
    gridSize: number;
    direction: UseSnakeGameReturn['direction'];
    status: UseSnakeGameReturn['status'];
    difficulty?: 'easy' | 'medium' | 'hard';
    roundVariant?: 'normal' | 'storm' | 'treasure';
}

const POWERUP_STYLE: Record<PowerupType, { bg: string; Icon: React.ComponentType<{ className?: string }> }> = {
    extra_life: { bg: 'bg-red-500', Icon: Heart },
    time_bonus: { bg: 'bg-cyan-500', Icon: Clock },
    shield: { bg: 'bg-blue-500', Icon: Shield },
    invisible: { bg: 'bg-gray-500', Icon: EyeOff },
    double_score: { bg: 'bg-amber-500', Icon: Coins },
    bounce_back: { bg: 'bg-indigo-500', Icon: CornerDownRight },
    slow: { bg: 'bg-violet-500', Icon: Gauge }
};

const GameBoard: React.FC<GameBoardProps> = ({ snake, foods, powerups, invisibleUntil = 0, gridSize, status, difficulty = 'medium', roundVariant = 'normal' }) => {
    const isInvisible = invisibleUntil > 0 && Date.now() < invisibleUntil;
    // Create grid cells
    const cells = useMemo(() => {
        return Array.from({ length: gridSize * gridSize }, (_, i) => ({
            x: i % gridSize,
            y: Math.floor(i / gridSize)
        }));
    }, [gridSize]);

    // Helper to determine cell content
    const getCellContent = (x: number, y: number) => {
        // Check Food - always show same style for all numbers
        const food = foods.find(f => f.x === x && f.y === y);
        if (food) {
            const isTreasure = food.isTreasure;
            const baseClasses = 'w-full h-full flex items-center justify-center rounded-full text-xs font-bold shadow-lg animate-wiggle';
            if (isTreasure) {
                return (
                    <div className={`${baseClasses} bg-yellow-400 text-black border-2 border-yellow-200 shadow-[0_0_20px_rgba(250,204,21,0.9)]`}>
                        {food.value}
                    </div>
                );
            }
            return (
                <div
                    className={`${baseClasses} text-black border-2 border-white/20`}
                    style={{ backgroundColor: 'var(--theme-food)' }}
                >
                    {food.value}
                </div>
            );
        }

        // Check Powerup
        const powerup = powerups.find(p => p.x === x && p.y === y);
        if (powerup) {
            const { bg, Icon } = POWERUP_STYLE[powerup.type];
            return (
                <div className={`w-full h-full flex items-center justify-center rounded-full shadow-lg animate-pulse border-2 border-white/80 ${bg} text-white`}>
                    <Icon className="w-1/2 h-1/2" />
                </div>
            );
        }

        // Check Snake
        const snakeIndex = snake.findIndex(s => s.x === x && s.y === y);
        if (snakeIndex !== -1) {
            const isHead = snakeIndex === 0;
            return (
                <div
                    className={`w-full h-full ${isHead ? 'z-10 rounded-sm' : 'rounded-sm opacity-90'} ${isInvisible ? 'opacity-20' : ''}`}
                    style={{
                        backgroundColor: isHead ? 'var(--theme-snake-head)' : 'var(--theme-snake-body)',
                        boxShadow: isHead ? '0 0 15px var(--theme-glow)' : 'none'
                    }}
                />
            );
        }

        return null;
    };

    return (
        <div
            className="relative aspect-square w-full max-w-[600px] bg-[var(--theme-bg-secondary)] rounded-xl border-4 border-[var(--theme-border)] overflow-hidden shadow-2xl backdrop-blur-sm"
            style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
                gridTemplateRows: `repeat(${gridSize}, 1fr)`,
                gap: '1px' // Slight gap for grid look
            }}
        >
            {/* Background Grid Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-10 bg-[length:20px_20px] bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]" />

            {/* Storm overlay */}
            {roundVariant === 'storm' && (
                <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-50">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_0_0,rgba(255,255,255,0.15),transparent_55%),radial-gradient(circle_at_100%_100%,rgba(255,255,255,0.12),transparent_55%)] animate-pulse" />
                </div>
            )}

            {cells.map((cell) => (
                <div
                    key={`${cell.x}-${cell.y}`}
                    className="relative w-full h-full bg-white/5 border-white/5"
                >
                    {getCellContent(cell.x, cell.y)}
                </div>
            ))}

            {status === 'GAME_OVER' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm">
                    <h2 className="text-4xl font-bold text-red-500 tracking-wider animate-bounce text-shadow-glow">GAME OVER</h2>
                </div>
            )}
        </div>
    );
};

export default GameBoard;
