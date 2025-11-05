import React, { useRef, useState, useMemo, useEffect } from 'react';
import type { MicrolearningModule, CapstoneProject, SkillConfidence } from '../types';
// FIX: Imported missing icons (VideoIcon, CodeIcon, MicIcon, BookIcon, TargetIcon) to resolve reference errors.
import { ChartIcon, CheckCircleIcon, ClockIcon, StarIcon, TrophyIcon, BrainIcon as QuizIcon, CalendarIcon, TrashIcon, PlusIcon, InfoIcon, CircleIcon, DownloadIcon, LinkIcon, ProjectIcon, ResumeIcon, BadgeIcon, AWSIcon, DatabaseIcon, DockerIcon, JavaIcon, JavaScriptIcon, PythonIcon, ReactIcon, SendIcon, LoadingIcon, LevelIcon, UserIcon, LightbulbIcon, ChevronDownIcon, TutorIcon, FlagIcon, BriefcaseIcon, CoverLetterIcon, LinkedInIcon, ClipboardIcon, LiveIcon, HeadphonesIcon, PathIcon, ToolsIcon, ProgressIcon, CodeBracketSquareIcon, CloudArrowDownIcon, UsersIcon, AdjustmentsIcon, BeakerIcon, CrosshairsIcon, VideoIcon, CodeIcon, MicIcon, BookIcon, TargetIcon, DocumentTextIcon, VideoCameraIcon } from './Icons';
import { TECHNOLOGIES_FOR_BADGES, POINTS_PER_LEVEL } from '../constants';
import { recalibrateLearningPath, generateQuiz } from '../services/geminiService';
import CommunityTab from './CommunityTab';
import { useAppContext } from '../contexts/AppContext';

interface LearningPathDisplayProps {
  isLoading: boolean;
  error: string | null;
}

const getModuleIcon = (type: MicrolearningModule['module_type']) => {
  switch (type) {
    case 'Video_Diagram': return <VideoIcon className="w-5 h-5 text-grape-500 dark:text-grape-400" />;
    case 'Sandbox_Lab': return <CodeIcon className="w-5 h-5 text-lime-500 dark:text-lime-400" />;
    case 'Audio_Lesson': return <MicIcon className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
    default: return <BookIcon className="w-5 h-5 text-amber-500 dark:text-amber-400" />;
  }
};

const getTechIcon = (iconName: string, props: any) => {
    switch (iconName) {
        case 'ReactIcon': return <ReactIcon {...props} />;
        case 'PythonIcon': return <PythonIcon {...props} />;
        case 'DatabaseIcon': return <DatabaseIcon {...props} />;
        case 'AWSIcon': return <AWSIcon {...props} />;
        case 'JavaIcon': return <JavaIcon {...props} />;
        case 'DockerIcon': return <DockerIcon {...props} />;
        case 'JavaScriptIcon': return <JavaScriptIcon {...props} />;
        default: return <BadgeIcon {...props} />;
    }
}

const Placeholder: React.FC = () => (
    <div className="text-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg h-full flex flex-col justify-center items-center">
        <ChartIcon className="w-16 h-16 text-slate-400 dark:text-slate-600 mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Your Personalized Path Awaits</h3>
        <p className="text-slate-500 dark:text-slate-500 mt-2 max-w-sm">Fill in the details on the left and let our AI architect build your custom roadmap to success.</p>
    </div>
);

const LoadingSkeleton: React.FC = () => (
    <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
        <div className="space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
            <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
        </div>
        <div className="space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
        </div>
    </div>
);

// Detail Pane for an expanded module
const ModuleDetailPane: React.FC<{ module: MicrolearningModule; weekIdx: number; modIdx: number }> = ({ module, weekIdx, modIdx }) => {
    const { dispatch } = useAppContext();
    return (
        <div className="bg-slate-100 dark:bg-slate-900/70 p-3 rounded-b-lg">
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">{module.concept}</p>
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-500 mb-3">
                <span className="flex items-center gap-1"><StarIcon className="w-3 h-3 text-amber-500"/>{module.path_points_reward} pts</span>
                <a href={module.resource_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-grape-600 dark:text-grape-400 hover:underline"><LinkIcon className="w-3 h-3"/>{module.resource_type}</a>
            </div>
            {module.module_type === 'Sandbox_Lab' && (
                <div className="mb-3 p-2 bg-slate-200 dark:bg-slate-800 rounded text-xs">
                    {module.suggested_project && (<><p className="font-semibold text-lime-700 dark:text-lime-300 flex items-center gap-1.5"><ProjectIcon className="w-3 h-3"/>Suggested Project</p><p className="text-slate-600 dark:text-slate-400 mt-1 mb-2">{module.suggested_project}</p></>)}
                    <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'codeLab', data: module }})} className="w-full flex items-center justify-center gap-1.5 bg-lime-500/10 dark:bg-lime-600/20 text-lime-700 dark:text-lime-300 hover:bg-lime-500/20 dark:hover:bg-lime-600/40 font-semibold py-1.5 px-2 rounded-md transition-colors"><BeakerIcon className="w-4 h-4" />Open AI Code Lab</button>
                </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'tutor', data: module } })} className="flex items-center gap-1.5 text-xs p-1.5 rounded-md bg-slate-200 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><TutorIcon className="w-4 h-4"/>AI Buddy</button>
                <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'liveTutor', data: module } })} className="flex items-center gap-1.5 text-xs p-1.5 rounded-md bg-slate-200 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><LiveIcon className="w-4 h-4"/>Live Tutor</button>
                <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'videoLessonPlayer', data: { module, weekIdx, modIdx } } })} className="flex items-center gap-1.5 text-xs p-1.5 rounded-md bg-slate-200 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><VideoCameraIcon className="w-4 h-4"/>{module.cachedVideoUrl ? 'Watch Video' : 'AI Video'}</button>
                <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'resumeHelper', data: module } })} className="flex items-center gap-1.5 text-xs p-1.5 rounded-md bg-slate-200 dark:bg-slate-700/50 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"><ResumeIcon className="w-4 h-4"/>Add to Resume</button>
            </div>
        </div>
    );
};

// A single module list item
const ModuleListItem: React.FC<{ module: MicrolearningModule; weekIdx: number; modIdx: number; isExpanded: boolean; onToggle: () => void; }> = ({ module, weekIdx, modIdx, isExpanded, onToggle }) => {
    const { dispatch } = useAppContext();
    
    const handleToggleComplete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (module.completed) {
            dispatch({ type: 'COMPLETE_MODULE', payload: { weekIdx, modIdx, completed: false } });
        } else {
            dispatch({ type: 'OPEN_MODAL', payload: { type: 'completeConfirmation', data: { weekIdx, modIdx, module } } });
        }
    };
    
    return (
        <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg mb-2 transition-shadow hover:shadow-lg ${isExpanded ? 'ring-2 ring-grape-500' : ''}`}>
            <div onClick={onToggle} className={`flex items-center p-3 cursor-pointer ${isExpanded ? 'rounded-t-lg' : 'rounded-lg'}`}>
                <button onClick={handleToggleComplete} className="p-1 mr-3" title="Mark as complete">{module.completed ? <CheckCircleIcon className="w-5 h-5 text-lime-500" /> : <CircleIcon className="w-5 h-5 text-slate-400 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-colors"/>}</button>
                <div className="flex-shrink-0 mr-3">{getModuleIcon(module.module_type)}</div>
                <div className={`flex-grow ${module.completed ? 'text-slate-500 dark:text-slate-500 line-through' : ''}`}>
                    <h5 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{module.module_name}</h5>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 mr-3 hidden sm:block">{module.duration_minutes} min</span>
                <ChevronDownIcon className={`w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </div>
            {isExpanded && <ModuleDetailPane module={module} weekIdx={weekIdx} modIdx={modIdx} />}
        </div>
    );
};

// The new collapsible card for a week
const WeekAccordionCard: React.FC<{ week: any; weekIdx: number; isExpanded: boolean; onToggle: () => void; }> = ({ week, weekIdx, isExpanded, onToggle }) => {
    const { state, dispatch } = useAppContext();
    const { offlineContent, downloadingWeeks } = state;
    const [expandedModuleKey, setExpandedModuleKey] = useState<string | null>(null);

    const handleModuleToggle = (modKey: string) => {
        setExpandedModuleKey(prev => prev === modKey ? null : modKey);
    };

    const handleDownloadWeek = async () => { /* ... implementation from previous steps ... */ };
    const handleDeleteOfflineWeek = (weekNumber: number) => { /* ... implementation from previous steps ... */ };

    return (
        <div className="mb-4 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <button onClick={onToggle} className="w-full p-4 flex items-center justify-between bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-lg text-grape-600 dark:text-grape-300">Week {week.week}</span>
                    <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 hidden sm:block">
                        <div className="bg-lime-500 h-1.5 rounded-full" style={{ width: `${(week.modules.filter((m: any) => m.completed).length / week.modules.length) * 100}%` }}></div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400 hidden md:block">{week.modules.reduce((acc: number, m: any) => acc + m.duration_minutes, 0)} min total</span>
                    <ChevronDownIcon className={`w-6 h-6 text-slate-500 dark:text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px]' : 'max-h-0'}`}>
                <div className="p-4">
                    {week.modules.map((module: MicrolearningModule, modIdx: number) => (
                        <ModuleListItem 
                            key={modIdx} 
                            module={module} 
                            weekIdx={weekIdx} 
                            modIdx={modIdx}
                            isExpanded={expandedModuleKey === `w${weekIdx}-m${modIdx}`}
                            onToggle={() => handleModuleToggle(`w${weekIdx}-m${modIdx}`)}
                        />
                    ))}
                    {week.checkpoint_quiz && (
                        <div className="mt-4 p-3 bg-slate-100 dark:bg-slate-900/50 border-l-4 border-lime-500 rounded-r-lg flex items-center justify-between">
                            <div>
                                <h5 className="font-semibold text-lime-700 dark:text-lime-300 flex items-center gap-2 text-sm"><QuizIcon className="w-4 h-4" />Checkpoint Quiz</h5>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Focus: <span className="font-medium text-slate-700 dark:text-slate-300">{week.checkpoint_quiz.skill_focus}</span></p>
                            </div>
                            <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'quiz', data: { details: week.checkpoint_quiz, weekNumber: week.week } } })} className="text-sm bg-lime-500/10 dark:bg-lime-600/20 text-lime-700 dark:text-lime-300 hover:bg-lime-500/20 dark:hover:bg-lime-600/40 font-semibold py-2 px-3 rounded-lg transition-colors">Start Quiz</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// The new collapsible card for a Capstone Project
const CapstoneProjectAccordionCard: React.FC<{ project: CapstoneProject; isExpanded: boolean; onToggle: () => void; }> = ({ project, isExpanded, onToggle }) => {
    const { dispatch } = useAppContext();
    return (
        <div className="mb-4 bg-grape-50 dark:bg-grape-900/30 border border-grape-200 dark:border-grape-500/50 rounded-xl overflow-hidden">
            <button onClick={onToggle} className="w-full p-4 flex items-center justify-between bg-grape-100/50 dark:bg-grape-900/50 hover:bg-grape-100 dark:hover:bg-grape-900/80 transition-colors">
                 <div className="flex items-center gap-4">
                    <FlagIcon className="w-6 h-6 text-grape-600 dark:text-grape-300 flex-shrink-0" />
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white text-left">{project.project_name}</h3>
                        <p className="text-sm text-grape-700 dark:text-grape-300 text-left">Capstone Project</p>
                    </div>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-grape-600 dark:text-grape-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
            <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'max-h-[2000px]' : 'max-h-0'}`}>
                <div className="p-4 space-y-4">
                    <p className="text-slate-700 dark:text-slate-300 text-sm">{project.description}</p>
                    <div>
                        <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-2">Skills to Apply:</h4>
                        <div className="flex flex-wrap gap-2">
                            {project.skills_to_apply.map(skill => (
                                <span key={skill} className="px-2.5 py-1 text-xs font-medium text-grape-800 dark:text-grape-200 bg-grape-100 dark:bg-grape-900/70 rounded-full border border-grape-200 dark:border-grape-700">{skill}</span>
                            ))}
                        </div>
                    </div>
                     <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'projectStarter', data: project } })} className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 text-sm bg-slate-200 dark:bg-slate-700/50 text-slate-800 dark:text-slate-200 font-medium py-2 px-4 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors">
                        <CodeBracketSquareIcon className="w-5 h-5 text-grape-500 dark:text-grape-400" />
                        Start Project with AI
                    </button>
                </div>
            </div>
        </div>
    );
};

const LearningPathDisplay: React.FC<LearningPathDisplayProps> = ({ isLoading, error }) => {
    const { state, dispatch } = useAppContext();
    const { learningPath, userInputs, offlineContent, downloadingWeeks } = state;
    const [activeTab, setActiveTab] = useState<'path' | 'tools' | 'progress' | 'community'>('path');
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isRecalibrating, setIsRecalibrating] = useState(false);
    const [recalibrationError, setRecalibrationError] = useState<string | null>(null);
    const [showRecalibrationPrompt, setShowRecalibrationPrompt] = useState(false);
    const [expandedKey, setExpandedKey] = useState<string | null>(null);

    const weeklyCompletionStatus = useMemo(() => {
        return learningPath?.weekly_schedule.map(week => {
            const total = week.modules.length;
            if (total === 0) return 'empty';
            const completed = week.modules.filter(m => m.completed).length;
            if (total === completed) return 'completed';
            if (completed > 0) return 'in_progress';
            return 'not_started';
        }) ?? [];
    }, [learningPath]);

    const currentWeekIndex = useMemo(() => {
        const firstUncompleted = weeklyCompletionStatus.findIndex(status => status !== 'completed');
        return firstUncompleted === -1 ? weeklyCompletionStatus.length - 1 : firstUncompleted;
    }, [weeklyCompletionStatus]);

    useEffect(() => {
        setExpandedKey(`week-${currentWeekIndex}`);
    }, [currentWeekIndex]);

    useEffect(() => {
        const recalibrationDone = sessionStorage.getItem('recalibrationDone');
        if (learningPath && currentWeekIndex >= 2 && !recalibrationDone) {
            setShowRecalibrationPrompt(true);
        }
    }, [currentWeekIndex, learningPath]);

    const handleRecalibrate = async (confidenceFeedback: SkillConfidence[]) => {
        if (!learningPath) return;
        setIsRecalibrating(true);
        setRecalibrationError(null);
        dispatch({ type: 'CLOSE_MODAL' });
        try {
            const newPath = await recalibrateLearningPath(learningPath, confidenceFeedback, userInputs.jd, userInputs.ucs, userInputs.dsc, userInputs.uls, userInputs.resumeSummary);
            dispatch({ type: 'SET_LEARNING_PATH', payload: newPath });
            sessionStorage.setItem('recalibrationDone', 'true');
            setShowRecalibrationPrompt(false);
        } catch(e) {
            setRecalibrationError("Failed to adjust your path. The AI might be busy. Please try again later.");
        } finally {
            setIsRecalibrating(false);
        }
    };
    
    const handleToggle = (key: string) => {
        setExpandedKey(prev => prev === key ? null : key);
    };
    
    // ... other handlers like download, export, copy etc. from previous steps ...
    
    const totalModules = useMemo(() => learningPath?.weekly_schedule.reduce((acc, week) => acc + week.modules.length, 0) ?? 0, [learningPath]);
    const completedModules = useMemo(() => learningPath?.weekly_schedule.reduce((acc, week) => acc + week.modules.filter(m => m.completed).length, 0) ?? 0, [learningPath]);
    const progressPercentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
    const totalPoints = useMemo(() => learningPath?.weekly_schedule.reduce((acc, week) => acc + week.modules.filter(m => m.completed).reduce((sum, m) => sum + m.path_points_reward, 0), 0) ?? 0, [learningPath]);
    const level = Math.floor(totalPoints / POINTS_PER_LEVEL) + 1;

    const earnedBadges = useMemo(() => {
        if (!learningPath) return [];
        const completedConcepts = learningPath.weekly_schedule
            .flatMap(week => week.modules)
            .filter(module => module.completed)
            .map(module => module.module_name.toLowerCase());
        return TECHNOLOGIES_FOR_BADGES.filter(badge => completedConcepts.some(concept => concept.includes(badge.keyword)));
    }, [learningPath]);

    if (isLoading) return <LoadingSkeleton />;
    if (error) return <div className="text-center p-8 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg text-red-700 dark:text-red-300">{error}</div>;
    if (!learningPath) return <Placeholder />;

    const RecalibrationPrompt = () => (
        <div className="bg-grape-50 dark:bg-grape-900/50 border border-grape-200 dark:border-grape-500/50 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
                <AdjustmentsIcon className="w-6 h-6 text-grape-600 dark:text-grape-300 flex-shrink-0" />
                <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">Time for a Check-in?</h4>
                    <p className="text-sm text-grape-700 dark:text-grape-200">Let's recalibrate your path based on your progress and confidence.</p>
                </div>
            </div>
            <button
                onClick={() => {
                    dispatch({ type: 'OPEN_MODAL', payload: { type: 'recalibration', data: { onRecalibrate: handleRecalibrate, currentWeekIndex } }});
                    setShowRecalibrationPrompt(false);
                }}
                className="flex-shrink-0 bg-grape-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-grape-700 text-sm transition-colors w-full sm:w-auto"
            >
                Adjust My Path
            </button>
        </div>
    );
    
    const renderPathTab = () => (
        <div className="mt-6">
            {learningPath.weekly_schedule.map((week, weekIdx) => {
                const weekKey = `week-${weekIdx}`;
                const capstoneProject = learningPath.capstone_projects?.find(p => p.scheduled_for_week_end === week.week);
                const projectKey = capstoneProject ? `project-${capstoneProject.project_name.replace(/\s+/g, '-')}` : null;

                return (
                    <React.Fragment key={week.week}>
                        <WeekAccordionCard 
                            week={week}
                            weekIdx={weekIdx}
                            isExpanded={expandedKey === weekKey}
                            onToggle={() => handleToggle(weekKey)}
                        />
                        {capstoneProject && projectKey && (
                            <CapstoneProjectAccordionCard 
                                project={capstoneProject}
                                isExpanded={expandedKey === projectKey}
                                onToggle={() => handleToggle(projectKey)}
                            />
                        )}
                    </React.Fragment>
                );
            })}
        </div>
    );

    const renderToolsTab = () => (
        <div className="mt-8 space-y-8">
            <div>
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white"><BriefcaseIcon className="w-6 h-6 text-grape-500 dark:text-grape-400"/>Career Tools</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-2"><CrosshairsIcon className="w-6 h-6 text-lime-500 dark:text-lime-400"/><h4 className="font-semibold text-slate-900 dark:text-white">Job Application Co-Pilot</h4></div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex-grow mb-4">Analyze a new job description to see how your skills stack up and generate tailored application materials.</p>
                        <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'jobCoPilot' } })} className="w-full text-sm bg-lime-500/80 text-white hover:bg-lime-500 font-semibold py-2 px-3 rounded-lg transition-colors">Launch Co-Pilot</button>
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-2"><CoverLetterIcon className="w-6 h-6 text-grape-500 dark:text-grape-400"/><h4 className="font-semibold text-slate-900 dark:text-white">AI Cover Letter Generator</h4></div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex-grow mb-4">Generate a tailored cover letter draft based on your learning path and the target job description.</p>
                        <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'coverLetter' } })} disabled={!userInputs.jd} className="w-full text-sm bg-grape-600/80 text-white hover:bg-grape-600 font-semibold py-2 px-3 rounded-lg transition-colors disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed">Generate Cover Letter</button>
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-2"><LinkedInIcon className="w-6 h-6 text-blue-500 dark:text-blue-400"/><h4 className="font-semibold text-slate-900 dark:text-white">AI LinkedIn Profile Optimizer</h4></div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex-grow mb-4">Get actionable suggestions to enhance your LinkedIn profile summary, skills, and experience sections.</p>
                        <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'linkedIn' } })} disabled={!userInputs.jd} className="w-full text-sm bg-blue-600/80 text-white hover:bg-blue-600 font-semibold py-2 px-3 rounded-lg transition-colors disabled:bg-slate-200 dark:disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed">Optimize Profile</button>
                    </div>
                    <div className="bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 flex flex-col items-start">
                        <div className="flex items-center gap-3 mb-2"><DocumentTextIcon className="w-6 h-6 text-amber-500 dark:text-amber-400"/><h4 className="font-semibold text-slate-900 dark:text-white">AI Resume Builder</h4></div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 flex-grow mb-4">Collect, edit, and export AI-generated bullet points for your resume based on the modules you complete.</p>
                        <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'resumeBuilder' } })} className="w-full text-sm bg-amber-500/80 text-white hover:bg-amber-500 font-semibold py-2 px-3 rounded-lg transition-colors">Open Builder</button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><QuizIcon className="w-5 h-5 text-lime-500 dark:text-lime-400"/>Review Quiz</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Scheduled for Week: <span className="font-medium text-lime-700 dark:text-lime-300">{learningPath.forgetting_curve_review_quiz.scheduled_for_week}</span></p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Focus: <span className="font-medium text-slate-800 dark:text-slate-200">{learningPath.forgetting_curve_review_quiz.skill_focus}</span></p>
                </div>
                <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><TrophyIcon className="w-5 h-5 text-amber-500 dark:text-amber-400"/>AI Interview Prep</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Scheduled for Week: <span className="font-medium text-amber-600 dark:text-amber-300">{learningPath.ai_interview_simulation.scheduled_for_week}</span></p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Focus: <span className="font-medium text-slate-800 dark:text-slate-200">{learningPath.ai_interview_simulation.skill_focus}</span></p>
                    <button onClick={() => dispatch({ type: 'OPEN_MODAL', payload: { type: 'mockInterview' } })} className="mt-3 w-full text-sm bg-amber-400/10 dark:bg-amber-600/20 text-amber-700 dark:text-amber-300 hover:bg-amber-400/20 dark:hover:bg-amber-600/40 font-semibold py-2 px-3 rounded-lg transition-colors">Start Mock Interview</button>
                </div>
            </div>
        </div>
    );
    
    const renderProgressTab = () => (
         <div className="mt-8 space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white"><UserIcon className="w-6 h-6 text-grape-500 dark:text-grape-400"/>Your Progress</h3>
                     <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                        <div className="relative">
                            <svg className="w-20 h-20" viewBox="0 0 36 36"><path className="text-slate-200 dark:text-slate-700" strokeWidth="2" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /><path className="text-lime-500" strokeWidth="2" strokeDasharray={`${(totalPoints % POINTS_PER_LEVEL) / POINTS_PER_LEVEL * 100}, 100`} strokeLinecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" /></svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center"><span className="text-xs text-slate-500 dark:text-slate-400">Level</span><span className="text-2xl font-bold text-slate-900 dark:text-white">{level}</span></div>
                        </div>
                        <div className="flex-grow">
                             <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-grape-600 dark:text-grape-300">Overall Progress</span>
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{completedModules} / {totalModules}</span>
                            </div>
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5"><div className="bg-grape-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div></div>
                            <div className="flex justify-between items-center mt-2 text-sm">
                                <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400"><StarIcon className="w-4 h-4"/> {totalPoints} Path Points</span>
                                <span className="flex items-center gap-1.5 text-lime-600 dark:text-lime-400"><TrophyIcon className="w-4 h-4"/> {earnedBadges.length} Badges</span>
                            </div>
                        </div>
                    </div>
                    {earnedBadges.length > 0 && (
                        <div className="mt-6">
                            <h4 className="font-semibold text-slate-900 dark:text-white text-md mb-3">Earned Badges</h4>
                            <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700"><div className="flex flex-wrap gap-3">{earnedBadges.map(badge => (<div key={badge.name} title={badge.description} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/50 p-2 pr-3 rounded-full border border-slate-200 dark:border-slate-700">{getTechIcon(badge.icon, {className: "w-6 h-6"})}<span className="font-semibold text-slate-800 dark:text-white text-xs">{badge.name}</span></div>))}</div></div>
                        </div>
                    )}
                </div>
                <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white"><TargetIcon className="w-6 h-6 text-grape-500 dark:text-grape-400"/>Skill Gap Analysis</h3>
                    <div className="space-y-3">
                        {learningPath.skill_gap_analysis.map((skill, i) => (
                             <div key={i} className="bg-white dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold text-slate-800 dark:text-white text-sm">{skill.skill}</h4>
                                    <p className="text-xs text-slate-500 dark:text-slate-400"><span className={`font-medium ${skill.priority_level === 1 ? 'text-red-500 dark:text-red-400' : 'text-amber-500 dark:text-amber-400'}`}>Priority {skill.priority_level}</span></p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 rounded-xl">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Your Adaptive Learning Path</h2>
                    </div>
                    <div className="text-left sm:text-right flex-shrink-0">
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Time</p>
                        <p className="text-2xl font-bold text-grape-600 dark:text-grape-400">{learningPath.total_estimated_weeks_to_ready} <span className="text-lg">weeks</span></p>
                    </div>
                </div>
                 <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-grape-600 dark:text-grape-300">Overall Module Progress</span>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{completedModules} / {totalModules} Modules</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5"><div className="bg-grape-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div></div>
                </div>
            </div>

            {showRecalibrationPrompt && <RecalibrationPrompt />}
            {recalibrationError && <div className="text-center p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-500/30 rounded-lg text-red-700 dark:text-red-300">{recalibrationError}</div>}

            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button onClick={() => setActiveTab('path')} className={`${activeTab === 'path' ? 'border-grape-500 text-grape-600 dark:text-grape-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'} flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}><PathIcon className="w-5 h-5" /> Personalized Path</button>
                    <button onClick={() => setActiveTab('tools')} className={`${activeTab === 'tools' ? 'border-grape-500 text-grape-600 dark:text-grape-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'} flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}><ToolsIcon className="w-5 h-5" /> AI Study Tools</button>
                    <button onClick={() => setActiveTab('progress')} className={`${activeTab === 'progress' ? 'border-grape-500 text-grape-600 dark:text-grape-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'} flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}><ProgressIcon className="w-5 h-5" /> My Progress & Stats</button>
                    <button onClick={() => setActiveTab('community')} className={`${activeTab === 'community' ? 'border-grape-500 text-grape-600 dark:text-grape-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-500'} flex items-center gap-2 whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm`}><UsersIcon className="w-5 h-5" /> Community</button>
                </nav>
            </div>

            {activeTab === 'path' && renderPathTab()}
            {activeTab === 'tools' && renderToolsTab()}
            {activeTab === 'progress' && renderProgressTab()}
            {activeTab === 'community' && <CommunityTab learningPath={learningPath} />}
        </div>
    );
};

export default LearningPathDisplay;