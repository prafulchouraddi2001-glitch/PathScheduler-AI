import React, { useState, useCallback, useEffect, useRef } from 'react';
import { generateLearningPath } from './services/geminiService';
import { authService } from './services/authService';
import { LearningStyle, type AdaptiveLearningPath, type User, type Theme, type ActiveView } from './types';
import InputForm from './components/InputForm';
import LearningPathDisplay from './components/LearningPathDisplay';
import WelcomeScreen from './components/WelcomeScreen';
import AuthScreen from './components/AuthScreen';
import ProfilePage from './components/ProfilePage';
import SettingsPage from './components/SettingsPage';
import { LogoIcon, SparklesIcon, RestartIcon, UserIcon, Bars3Icon, Cog6ToothIcon, ArrowLeftOnRectangleIcon } from './components/Icons';
import { AppProvider, useAppContext } from './contexts/AppContext';
import ModalManager from './components/ModalManager';

const AppContent: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const { learningPath, user, userInputs } = state;
  const { jd, ucs, dsc, uls, resumeSummary } = userInputs;

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInputForm, setShowInputForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<ActiveView>('main');
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('theme') as Theme) || 'system');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const applyTheme = (theme: Theme) => {
      const root = window.document.documentElement;
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      root.classList.toggle('dark', isDark);
      localStorage.setItem('theme', theme);
    };

    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme(theme);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const sessionData = await authService.verifySession();
        if (sessionData) {
          dispatch({ type: 'SET_USER', payload: sessionData.user });
          if (sessionData.learningPath) {
            dispatch({ type: 'SET_LEARNING_PATH', payload: sessionData.learningPath });
          }
           if (sessionData.resumePoints) {
            // This needs to be handled in the context, but for now we can just log it
            console.log("Loaded resume points from backend.");
          }
        }
      } catch (e) {
        console.error("Session verification failed", e);
        authService.logout();
      } finally {
        setIsLoading(false);
      }
    };
    checkSession();
  }, [dispatch]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuRef]);

  const handleAuthSuccess = (authedUser: User) => {
    dispatch({ type: 'SET_USER', payload: authedUser });
    setIsLoading(false);
  };

  const handleLogout = () => {
    authService.logout();
    dispatch({ type: 'SET_USER', payload: null });
    dispatch({ type: 'SET_LEARNING_PATH', payload: null });
    setShowInputForm(false);
    setIsMenuOpen(false);
    setActiveView('main');
  };
  
  const navigateTo = (view: ActiveView) => {
    setActiveView(view);
    setIsMenuOpen(false);
  };

  const handleSubmit = useCallback(async () => {
    if (!jd || !ucs || !dsc || !uls) {
      setError('All fields are required.');
      return;
    }
    setIsGenerating(true);
    setError(null);
    
    try {
      const path = await generateLearningPath(jd, ucs, dsc, uls, resumeSummary);
      dispatch({ type: 'SET_LEARNING_PATH', payload: path });
      setShowInputForm(false);
    } catch (e) {
      console.error(e);
      setError('Failed to generate learning path. The AI might be busy or the input is invalid. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [jd, ucs, dsc, uls, resumeSummary, dispatch]);

  const handleResetPath = () => {
      dispatch({ type: 'SET_LEARNING_PATH', payload: null });
      dispatch({ type: 'SET_USER_INPUTS', payload: {
        jd: '',
        ucs: 'Python: Intermediate, Java: Advanced, SQL: Beginner, AWS: None, Communication: Intermediate',
        dsc: 2,
        uls: LearningStyle.Visual,
        resumeSummary: '',
      }});
      setError(null);
      dispatch({ type: 'CLOSE_MODAL' });
      setShowInputForm(true);
  };

  const renderView = () => {
    if (isLoading) {
      return <div className="text-center p-8 text-slate-500 dark:text-slate-400">Initializing...</div>;
    }
    if (!user) {
        return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
    }
    switch (activeView) {
      case 'profile':
        return <ProfilePage onBack={() => setActiveView('main')} />;
      case 'settings':
        return <SettingsPage onBack={() => setActiveView('main')} currentTheme={theme} setTheme={setTheme} />;
      case 'main':
      default:
        if (learningPath) {
          return <LearningPathDisplay isLoading={isGenerating} error={error} />;
        }
        if (showInputForm) {
          return (
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="lg:pr-8">
                  <div className="flex items-center gap-3 mb-4">
                    <SparklesIcon className="w-6 h-6 text-grape-500" />
                    <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Create Your Learning Path</h2>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Enter the details below to generate a personalized learning plan to bridge the gap between your skills and your dream job.
                  </p>
                  <InputForm
                    jd={jd}
                    setJd={(val) => dispatch({ type: 'SET_USER_INPUTS', payload: { jd: val }})}
                    ucs={ucs}
                    setUcs={(val) => dispatch({ type: 'SET_USER_INPUTS', payload: { ucs: val }})}
                    dsc={dsc}
                    setDsc={(val) => dispatch({ type: 'SET_USER_INPUTS', payload: { dsc: val }})}
                    uls={uls}
                    setUls={(val) => dispatch({ type: 'SET_USER_INPUTS', payload: { uls: val }})}
                    resumeSummary={resumeSummary}
                    setResumeSummary={(val) => dispatch({ type: 'SET_USER_INPUTS', payload: { resumeSummary: val }})}
                    onSubmit={handleSubmit}
                    isLoading={isGenerating}
                  />
                </div>
                <div className="lg:pl-8">
                  <LearningPathDisplay isLoading={isGenerating} error={error} />
                </div>
              </div>
          );
        }
        return <WelcomeScreen user={user} onGetStarted={() => setShowInputForm(true)} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
      <ModalManager onConfirmReset={handleResetPath} />
      <header className="bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700/50 sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigateTo('main')} className="flex items-center space-x-3 group">
              <LogoIcon className="h-8 w-8 text-grape-600 dark:text-grape-500 group-hover:scale-110 transition-transform" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">PathScheduler AI</h1>
            </button>
            <div className="flex items-center gap-4">
                {learningPath && !isLoading && user && activeView === 'main' && (
                    <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'resetConfirmation' } })} className="hidden sm:flex items-center gap-2 text-sm bg-slate-200 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                        <RestartIcon className="w-4 h-4" />
                        Generate New Path
                    </button>
                )}
                {user && (
                    <div className="relative" ref={menuRef}>
                        <button onClick={() => setIsMenuOpen(prev => !prev)} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors">
                            <Bars3Icon className="w-6 h-6 text-slate-600 dark:text-slate-300"/>
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-xl bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-30 border border-slate-200 dark:border-slate-700">
                                <div className="py-1">
                                    <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                                        <p className="text-sm text-slate-500 dark:text-slate-400">Signed in as</p>
                                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.username}</p>
                                    </div>
                                    <div className="py-1">
                                        <button onClick={() => navigateTo('profile')} className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white group flex w-full items-center px-4 py-2 text-sm">
                                            <UserIcon className="mr-3 h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                                            Profile
                                        </button>
                                        <button onClick={() => navigateTo('settings')} className="text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white group flex w-full items-center px-4 py-2 text-sm">
                                            <Cog6ToothIcon className="mr-3 h-5 w-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
                                            Settings
                                        </button>
                                    </div>
                                    <div className="py-1 border-t border-slate-200 dark:border-slate-700">
                                        <button onClick={handleLogout} className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-700 dark:hover:text-red-300 group flex w-full items-center px-4 py-2 text-sm">
                                            <ArrowLeftOnRectangleIcon className="mr-3 h-5 w-5 text-red-500/80 dark:text-red-400/80 group-hover:text-red-600 dark:group-hover:text-red-300" />
                                            Logout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
         {renderView()}
      </main>
       <footer className="text-center py-4 text-slate-500 dark:text-slate-500 text-sm">
        <p>Powered by Gemini. Designed for ambitious MCA graduates.</p>
      </footer>
    </div>
  );
};

const App: React.FC = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
