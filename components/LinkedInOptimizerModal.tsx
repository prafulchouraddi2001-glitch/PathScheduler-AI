import React, { useState, useEffect } from 'react';
import type { SkillGap, LinkedInOptimization } from '../types';
import { optimizeLinkedInProfile } from '../services/geminiService';
import { LinkedInIcon, LoadingIcon } from './Icons';
import MarkdownRenderer from './MarkdownRenderer';

interface LinkedInOptimizerModalProps {
    jd: string;
    skills: SkillGap[];
    onClose: () => void;
}

const LinkedInOptimizerModal: React.FC<LinkedInOptimizerModalProps> = ({ jd, skills, onClose }) => {
    const [optimization, setOptimization] = useState<LinkedInOptimization | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const generate = async () => {
            setIsLoading(true);
            const result = await optimizeLinkedInProfile(jd, skills);
            setOptimization(result);
            setIsLoading(false);
        };
        if (jd) generate();
    }, [jd, skills]);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-2xl w-full border border-slate-200 dark:border-slate-700 max-h-[90vh] flex flex-col">
                <div className="flex items-start gap-4 mb-4">
                     <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 sm:mx-0 sm:h-10 sm:w-10">
                        <LinkedInIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">AI LinkedIn Profile Optimizer</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Suggestions to make your profile stand out to recruiters.</p>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto space-y-4">
                    {isLoading ? <div className="flex justify-center items-center h-full"><LoadingIcon className="w-8 h-8 animate-spin text-grape-500 dark:text-grape-400" /></div> :
                        !optimization ? <div className="text-center text-slate-500 dark:text-slate-400">Could not generate suggestions.</div> :
                        (
                            <div className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-grape-600 dark:text-grape-300 mb-2">Revised "About" Summary:</h4>
                                    <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded text-sm text-slate-700 dark:text-slate-300">
                                        <MarkdownRenderer content={optimization.profile_summary} />
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-grape-600 dark:text-grape-300 mb-2">Suggested Skills to Add:</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {optimization.suggested_skills.map((skill, i) => <span key={i} className="px-2.5 py-1 text-xs font-medium text-grape-800 dark:text-grape-200 bg-grape-100 dark:bg-grape-900/70 rounded-full border border-grape-200 dark:border-grape-700">{skill}</span>)}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-grape-600 dark:text-grape-300 mb-2">Example Experience/Project Bullet Points:</h4>
                                    <ul className="space-y-2 list-disc list-inside text-sm text-slate-700 dark:text-slate-300">
                                        {optimization.experience_bullet_points.map((bp, i) => <li key={i}>{bp}</li>)}
                                    </ul>
                                </div>
                            </div>
                        )
                    }
                </div>
                 <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-700 sm:flex sm:flex-row-reverse">
                    <button type="button" onClick={onClose} className="w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 sm:w-auto sm:text-sm">Close</button>
                </div>
            </div>
        </div>
    );
};

export default LinkedInOptimizerModal;