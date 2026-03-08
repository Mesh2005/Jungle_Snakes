import React, { type ReactNode } from 'react';
import { clsx } from 'clsx';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, className }) => {
    return (
        <div className={clsx("glass-panel p-4 rounded-xl flex items-center space-x-4 hover:bg-[var(--theme-surface-strong)]/40 transition-colors bg-[var(--theme-surface)] border border-[var(--theme-border)]", className)}>
            {icon && (
                <div className="p-3 bg-[var(--theme-accent)]/10 rounded-lg text-[var(--theme-accent)] shadow-[0_0_10px_var(--theme-glow)]">
                    {icon}
                </div>
            )}
            <div>
                <p className="text-sm text-[var(--theme-text-dim)] uppercase tracking-wide font-medium">{label}</p>
                <p className="text-2xl font-bold text-[var(--theme-text)] drop-shadow-[0_0_8px_var(--theme-glow)]">{value}</p>
            </div>
        </div>
    );
};

export default StatCard;
