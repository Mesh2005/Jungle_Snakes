import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { clsx } from 'clsx';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Content */}
            <div className={clsx("relative bg-[var(--theme-bg-base)] border border-[var(--theme-border)] rounded-2xl shadow-2xl w-full max-w-md transform transition-all p-6", className)}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-[var(--theme-text)] tracking-wide">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-[var(--theme-text-dim)] hover:text-[var(--theme-accent)] transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="mt-2">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;
