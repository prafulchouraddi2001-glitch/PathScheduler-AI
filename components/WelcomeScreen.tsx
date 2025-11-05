import React from 'react';
import { LogoIcon, SparklesIcon, TargetIcon, TrophyIcon, TutorIcon } from './Icons';
import { User } from '../types';

interface WelcomeScreenProps {
  onGetStarted: () => void;
  user?: User | null;
}

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
    <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 mb-4">
            {icon}
        </div>
        <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{description}</p>
    </div>
);


const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onGetStarted, user }) => {
  return (
    <div className="text-center max-w-4xl mx-auto py-12 sm:py-20 px-4">
      <LogoIcon className="h-20 w-20 text-grape-500 dark:text-grape-400 mx-auto mb-6" />
      {user && <p className="text-lg text-grape-600 dark:text-grape-300 mb-4">Welcome back, {user.username}!</p>}
      <h2 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
        Your AI-Powered Career Co-Pilot
      </h2>
      <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
        Stop guessing what to learn next. PathScheduler AI analyzes your target job and current skills to create a personalized, week-by-week learning roadmap to get you hired.
      </p>

      <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <FeatureCard 
            icon={<TargetIcon className="h-6 w-6 text-grape-600 dark:text-grape-400" />}
            title="Personalized Path"
            description="A tailored curriculum to meet exact job requirements."
        />
        <FeatureCard 
            icon={<TutorIcon className="h-6 w-6 text-lime-600 dark:text-lime-400" />}
            title="AI Study Tools"
            description="Interactive tutors, mock interviews, and resume helpers."
        />
        <FeatureCard 
            icon={<TrophyIcon className="h-6 w-6 text-amber-500 dark:text-amber-400" />}
            title="Track Your Progress"
            description="Visualize your journey, level up, and earn skill badges."
        />
      </div>
      
      <div className="mt-16">
        <button
          onClick={onGetStarted}
          className="flex mx-auto items-center gap-3 bg-grape-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-grape-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-grape-500 transition-all text-lg shadow-lg hover:shadow-grape-500/50"
        >
          <SparklesIcon className="w-6 h-6" />
          Create My Learning Path
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;