import React, { useState, useEffect } from 'react';
import { type MicrolearningModule, type CodeChallenge, type CodeFeedback } from '../types';
import { generateCodeChallenge, getCodeFeedback } from '../services/geminiService';
import { BeakerIcon, LoadingIcon, LightbulbIcon, CheckBadgeIcon, WarningIcon } from './Icons';
import MarkdownRenderer from './MarkdownRenderer';

interface CodeLabModalProps {
    module: MicrolearningModule;
    onClose: () => void;
}

const CodeLabModal: React.FC<CodeLabModalProps> = ({ module, onClose }) => {
    const [challenge, setChallenge] = useState<CodeChallenge | null>(null);
    const [feedback, setFeedback] = useState<CodeFeedback | null>(null);
    const [userCode, setUserCode] = useState('');
    const [isLoadingChallenge, setIsLoadingChallenge] = useState(true);
    const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchChallenge = async () => {
            setIsLoadingChallenge(true);
            setError(null);
            try {
                const generatedChallenge = await generateCodeChallenge(module.concept);
                setChallenge(generatedChallenge);
                setUserCode(generatedChallenge.starter_code);
            } catch (e) {
                console.error("Failed to generate code challenge", e);
                setError("Could not load the AI challenge. Please try again.");
            } finally {
                setIsLoadingChallenge(false);
            }
        };
        fetchChallenge();
    }, [module.concept]);

    const handleGetFeedback = async () => {
        if (!challenge) return;
        setIsLoadingFeedback(true);
        setFeedback(null);
        setError(null);
        try {
            const generatedFeedback = await getCodeFeedback(module.concept, userCode, challenge.description);
            setFeedback(generatedFeedback);
        } catch (e) {
            console.error("Failed to get code feedback", e);
            setError("Could not get feedback from the AI. Please try again.");
        } finally {
            setIsLoadingFeedback(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl flex flex-col max-w-6xl w-full h-[90vh] border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <BeakerIcon className="h-6 w-6 text-lime-500 dark:text-lime-400" />
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Interactive AI Code Lab</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{module.concept}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white text-2xl">&times;</button>
                </div>
                
                <div className="flex-grow flex flex-col md:flex-row min-h-0">
                    {/* Left Panel: Challenge and Feedback */}
                    <div className="w-full md:w-1/2 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                        <div className="p-4 flex-shrink-0">
                            <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Your Challenge:</h4>
                            {isLoadingChallenge ? <LoadingIcon className="w-6 h-6 animate-spin" /> : 
                                error ? <p className="text-red-500 dark:text-red-400 text-sm">{error}</p> :
                                <p className="text-sm text-slate-600 dark:text-slate-300">{challenge?.description}</p>
                            }
                        </div>
                        <div className="flex-grow overflow-y-auto p-4 border-t border-slate-200 dark:border-slate-700">
                             <h4 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2">
                                <LightbulbIcon className="w-5 h-5 text-amber-500 dark:text-amber-300" /> AI Feedback:
                            </h4>
                            {isLoadingFeedback ? <div className="flex justify-center items-center h-full"><LoadingIcon className="w-8 h-8 animate-spin" /></div> :
                                !feedback ? <p className="text-sm text-slate-500 dark:text-slate-500">Submit your code to get feedback from the AI tutor.</p> :
                                <div className="space-y-4 text-sm">
                                    <div className={`flex items-center gap-2 p-3 rounded-lg border ${feedback.is_correct ? 'bg-lime-50 dark:bg-lime-900/50 border-lime-200 dark:border-lime-500/50' : 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-500/50'}`}>
                                        {feedback.is_correct ? <CheckBadgeIcon className="w-6 h-6 text-lime-500 dark:text-lime-400 flex-shrink-0" /> : <WarningIcon className="w-6 h-6 text-red-500 dark:text-red-400 flex-shrink-0" />}
                                        <p className={`font-semibold ${feedback.is_correct ? 'text-lime-800 dark:text-lime-300' : 'text-red-800 dark:text-red-300'}`}>
                                            {feedback.is_correct ? "Correct! Well done." : "Not quite right, but close!"}
                                        </p>
                                    </div>
                                    <div className="text-slate-700 dark:text-slate-300">
                                        <MarkdownRenderer content={feedback.explanation} />
                                    </div>
                                    {feedback.corrected_code && (
                                        <div>
                                            <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">Suggested Code:</h5>
                                            <pre className="p-3 bg-slate-100 dark:bg-slate-900 rounded-md text-xs overflow-x-auto"><code>{feedback.corrected_code}</code></pre>
                                        </div>
                                    )}
                                </div>
                            }
                        </div>
                    </div>

                    {/* Right Panel: Code Editor */}
                     <div className="w-full md:w-1/2 flex flex-col bg-slate-50 dark:bg-slate-900/50">
                        <div className="p-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 flex-shrink-0">
                            <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">Your Solution</p>
                            <button onClick={handleGetFeedback} disabled={isLoadingFeedback || isLoadingChallenge} className="flex items-center gap-1.5 text-sm bg-grape-600 text-white font-semibold px-3 py-1.5 rounded-md hover:bg-grape-700 disabled:opacity-50">
                                {isLoadingFeedback ? <><LoadingIcon className="w-4 h-4 animate-spin"/> Checking...</> : 'Get AI Feedback'}
                            </button>
                        </div>
                        <div className="flex-grow overflow-auto relative">
                           <textarea
                            value={userCode}
                            onChange={(e) => setUserCode(e.target.value)}
                            placeholder="Write your code here..."
                            spellCheck="false"
                            className="w-full h-full p-4 bg-transparent text-slate-800 dark:text-slate-300 font-mono text-sm resize-none border-0 focus:ring-0 absolute inset-0"
                            disabled={isLoadingChallenge}
                           />
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default CodeLabModal;