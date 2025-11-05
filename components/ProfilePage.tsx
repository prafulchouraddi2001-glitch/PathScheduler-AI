import React, { useState, useMemo } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { authService } from '../services/authService';
import { UserIcon, BrainIcon, LoadingIcon, CheckCircleIcon, WarningIcon, ArrowUturnLeftIcon } from './Icons';

interface ProfilePageProps {
    onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
    const { state, dispatch } = useAppContext();
    const { user, learningPath, userInputs } = state;

    // State for username form
    const [username, setUsername] = useState(user?.username || '');
    const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [usernameSuccess, setUsernameSuccess] = useState<string | null>(null);

    // State for password form
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

    const completedModules = useMemo(() => learningPath?.weekly_schedule.reduce((acc, week) => acc + week.modules.filter(m => m.completed).length, 0) ?? 0, [learningPath]);
    const totalModules = useMemo(() => learningPath?.weekly_schedule.reduce((acc, week) => acc + week.modules.length, 0) ?? 0, [learningPath]);
    const progressPercentage = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

    const handleUsernameUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || username === user.username) return;
        setIsUpdatingUsername(true);
        setUsernameError(null);
        setUsernameSuccess(null);
        try {
            // FIX: The updateUser function expects a single object argument. Removed the user.id.
            const updatedUser = await authService.updateUser({ username });
            dispatch({ type: 'SET_USER', payload: updatedUser });
            setUsernameSuccess('Username updated successfully!');
        } catch (err: any) {
            setUsernameError(err.message);
        } finally {
            setIsUpdatingUsername(false);
        }
    };
    
    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !oldPassword || !newPassword) {
            setPasswordError("All fields are required.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }
        setIsUpdatingPassword(true);
        setPasswordError(null);
        setPasswordSuccess(null);
        try {
            // FIX: The updateUser function expects a single object argument. Removed the user.id.
            await authService.updateUser({ oldPassword, newPassword });
            setPasswordSuccess('Password changed successfully!');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch(err: any) {
            setPasswordError(err.message);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    if (!user) {
        return <div className="text-center p-8 text-slate-500 dark:text-slate-400">Loading profile...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors">
                    <ArrowUturnLeftIcon className="w-5 h-5" />
                    Back to My Path
                </button>
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column: Details & Progress */}
                <div className="space-y-8">
                    <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><UserIcon className="w-5 h-5 text-grape-500" /> Your Details</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Username</span>
                                <span className="font-medium text-slate-700 dark:text-slate-200">{user.username}</span>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Email</span>
                                <span className="font-medium text-slate-700 dark:text-slate-200">{user.email}</span>
                            </div>
                        </div>
                    </div>
                    {learningPath && (
                         <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><BrainIcon className="w-5 h-5 text-grape-500" /> Learning Snapshot</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 dark:text-slate-400">Target Job Title</span>
                                    <span className="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[200px]">{userInputs.jd.split('\n')[0]}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-500 dark:text-slate-400">Path Progress</span>
                                    <span className="font-medium text-grape-600 dark:text-grape-400">{progressPercentage}%</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2"><div className="bg-grape-500 h-2 rounded-full" style={{ width: `${progressPercentage}%` }}></div></div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Account Management */}
                <div className="space-y-8">
                     <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Account Management</h2>
                        {/* Update Username Form */}
                        <form onSubmit={handleUsernameUpdate} className="space-y-4 pb-6 border-b border-slate-200 dark:border-slate-700">
                             <div>
                                <label htmlFor="username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Update Username</label>
                                <input type="text" id="username" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm" />
                            </div>
                            {usernameError && <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1"><WarningIcon className="w-4 h-4" />{usernameError}</p>}
                            {usernameSuccess && <p className="text-sm text-lime-600 dark:text-lime-400 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4"/>{usernameSuccess}</p>}
                            <button type="submit" disabled={isUpdatingUsername || username === user.username} className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm bg-grape-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-grape-700 disabled:opacity-50">
                                {isUpdatingUsername && <LoadingIcon className="w-4 h-4 animate-spin"/>}
                                Save Username
                            </button>
                        </form>

                        {/* Change Password Form */}
                        <form onSubmit={handlePasswordUpdate} className="space-y-4 pt-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Change Password</label>
                                <div className="space-y-3">
                                     <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Current Password" required className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm" />
                                     <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New Password" required className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm" />
                                     <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm New Password" required className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm" />
                                </div>
                            </div>
                            {passwordError && <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1"><WarningIcon className="w-4 h-4" />{passwordError}</p>}
                            {passwordSuccess && <p className="text-sm text-lime-600 dark:text-lime-400 flex items-center gap-1"><CheckCircleIcon className="w-4 h-4" />{passwordSuccess}</p>}
                             <button type="submit" disabled={isUpdatingPassword} className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm bg-grape-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-grape-700 disabled:opacity-50">
                                {isUpdatingPassword && <LoadingIcon className="w-4 h-4 animate-spin"/>}
                                Change Password
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;