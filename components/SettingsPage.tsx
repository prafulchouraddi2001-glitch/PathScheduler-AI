import React from 'react';
import { type Theme } from '../types';
import { ArrowUturnLeftIcon, Cog6ToothIcon } from './Icons';
import ThemeSwitcher from './ThemeSwitcher';

interface SettingsPageProps {
    onBack: () => void;
    currentTheme: Theme;
    setTheme: (theme: Theme) => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ onBack, currentTheme, setTheme }) => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
                    <ArrowUturnLeftIcon className="w-5 h-5" />
                    Back to My Path
                </button>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <Cog6ToothIcon className="w-8 h-8"/>
                Settings
            </h1>

            <div className="space-y-8">
                {/* Appearance Settings */}
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Appearance</h2>
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme</label>
                        <ThemeSwitcher theme={currentTheme} setTheme={setTheme} />
                    </div>
                </div>

                {/* Notification Settings (Placeholder) */}
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Notifications</h2>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-slate-700 dark:text-slate-300">Enable weekly progress reminders</p>
                        <button className="text-sm font-medium text-grape-600 dark:text-grape-400" onClick={() => alert('Feature coming soon!')}>
                            Coming Soon
                        </button>
                    </div>
                </div>

                {/* Data Management Settings (Placeholder) */}
                <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Data Management</h2>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-slate-700 dark:text-slate-300">Export learning path data</p>
                             <button className="text-sm font-medium text-grape-600 dark:text-grape-400" onClick={() => alert('Feature coming soon!')}>
                                Export as JSON
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-red-600 dark:text-red-400">Delete all my data</p>
                             <button className="text-sm font-medium text-red-600 dark:text-red-400" onClick={() => alert('Feature coming soon!')}>
                                Delete...
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
