import React, { useState } from 'react';
import { authService } from '../services/authService';
import { type User } from '../types';
import { LogoIcon, LoadingIcon, WarningIcon } from './Icons';

interface AuthScreenProps {
    onAuthSuccess: (user: User) => void;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuthSuccess }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [identifier, setIdentifier] = useState(''); // Can be email for signup, or email/username for login
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            const { user } = isLogin 
                ? await authService.login(identifier, password)
                : await authService.signup(identifier, password, username); // Identifier is the email on signup
            onAuthSuccess(user);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="max-w-md w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg p-8 space-y-6">
                <div className="text-center">
                    <LogoIcon className="h-12 w-12 text-grape-500 dark:text-grape-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                        {isLogin ? 'Welcome Back' : 'Create Your Account'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">
                        {isLogin ? 'Sign in to access your learning path.' : 'Join to start your AI-powered journey.'}
                    </p>
                </div>

                <div className="flex bg-slate-100 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                    <button 
                        onClick={() => { setIsLogin(true); setError(null); }}
                        className={`w-1/2 py-2 text-sm font-medium rounded-md transition-colors ${isLogin ? 'bg-grape-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}
                    >
                        Login
                    </button>
                     <button 
                        onClick={() => { setIsLogin(false); setError(null); }}
                        className={`w-1/2 py-2 text-sm font-medium rounded-md transition-colors ${!isLogin ? 'bg-grape-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/50'}`}
                    >
                        Sign Up
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                     {error && (
                        <div className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-500/50 text-red-700 dark:text-red-300 text-sm p-3 rounded-lg flex items-center gap-2">
                            <WarningIcon className="w-5 h-5 flex-shrink-0"/>
                            <span>{error}</span>
                        </div>
                    )}
                    {!isLogin && (
                         <div>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                autoComplete="username"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-grape-500 focus:border-grape-500 transition-colors"
                                placeholder="Username"
                            />
                        </div>
                    )}
                    <div>
                        <label htmlFor="identifier" className="sr-only">{isLogin ? 'Email or Username' : 'Email address'}</label>
                        <input
                            id="identifier"
                            name="identifier"
                            type={isLogin ? "text" : "email"}
                            autoComplete="email"
                            required
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-grape-500 focus:border-grape-500 transition-colors"
                            placeholder={isLogin ? "Email or Username" : "Email address"}
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-grape-500 focus:border-grape-500 transition-colors"
                            placeholder="Password"
                        />
                    </div>
                     <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex justify-center items-center gap-2 bg-grape-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-grape-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-grape-500 disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:text-slate-100 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        {isLoading ? (
                            <>
                                <LoadingIcon className="w-5 h-5 animate-spin" />
                                Please wait...
                            </>
                        ) : (isLogin ? 'Login' : 'Create Account')}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthScreen;