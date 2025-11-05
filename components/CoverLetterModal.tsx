import React, { useState, useEffect } from 'react';
import type { SkillGap } from '../types';
import { generateCoverLetter } from '../services/geminiService';
import { CoverLetterIcon, LoadingIcon } from './Icons';
import MarkdownRenderer from './MarkdownRenderer';

interface CoverLetterModalProps {
    jd: string;
    skills: SkillGap[];
    resumeSummary: string;
    onClose: () => void;
}

const CoverLetterModal: React.FC<CoverLetterModalProps> = ({ jd, skills, resumeSummary, onClose }) => {
    const [coverLetter, setCoverLetter] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const generate = async () => {
            setIsLoading(true);
            const result = await generateCoverLetter(jd, skills, resumeSummary);
            setCoverLetter(result);
            setIsLoading(false);
        };
        if(jd) generate();
    }, [jd, skills, resumeSummary]);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-2xl w-full border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4 mb-4">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-grape-100 dark:bg-grape-900/50 sm:mx-0 sm:h-10 sm:w-10">
                        <CoverLetterIcon className="h-6 w-6 text-grape-600 dark:text-grape-400" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">AI Cover Letter Generator</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">A tailored draft based on your learning path and target job.</p>
                    </div>
                </div>
                <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-md min-h-[300px] max-h-[50vh] overflow-y-auto text-sm text-slate-700 dark:text-slate-300">
                    {isLoading ? <div className="flex justify-center items-center h-full"><LoadingIcon className="w-8 h-8 animate-spin text-grape-500 dark:text-grape-400" /></div> : <MarkdownRenderer content={coverLetter} />}
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <button type="button" onClick={onClose} className="w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 sm:w-auto sm:text-sm">Close</button>
                    <button type="button" onClick={() => navigator.clipboard.writeText(coverLetter)} disabled={isLoading} className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-grape-600 text-base font-medium text-white hover:bg-grape-700 sm:mt-0 sm:w-auto sm:text-sm disabled:opacity-50">Copy Text</button>
                </div>
            </div>
        </div>
    );
};

export default CoverLetterModal;