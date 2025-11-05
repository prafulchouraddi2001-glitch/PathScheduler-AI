import React, { useState, useRef, useEffect } from 'react';
import { type Theme } from '../types';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from './Icons';

interface ThemeSwitcherProps {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ theme, setTheme }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // FIX: Changed JSX.Element to React.ReactNode to resolve namespace error.
    const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
        { value: 'light', label: 'Light', icon: <SunIcon className="w-5 h-5" /> },
        { value: 'dark', label: 'Dark', icon: <MoonIcon className="w-5 h-5" /> },
        { value: 'system', label: 'System', icon: <ComputerDesktopIcon className="w-5 h-5" /> },
    ];

    const currentOption = options.find(opt => opt.value === theme);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700/50 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
                {currentOption?.icon}
                <span className="hidden sm:inline">{currentOption?.label}</span>
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-36 origin-top-right rounded-lg bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-10 border border-slate-200 dark:border-slate-700">
                    <div className="py-1">
                        {options.map(option => (
                            <button
                                key={option.value}
                                onClick={() => {
                                    setTheme(option.value);
                                    setIsOpen(false);
                                }}
                                className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white group flex w-full items-center px-4 py-2 text-sm gap-3"
                            >
                                {option.icon}
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSwitcher;
