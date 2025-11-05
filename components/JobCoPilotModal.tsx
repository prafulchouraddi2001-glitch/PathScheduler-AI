import React, { useState } from 'react';
import { type AdaptiveLearningPath, type JobFitAnalysis } from '../types';
import { analyzeJobFit } from '../services/geminiService';
import { CrosshairsIcon, LoadingIcon, BriefcaseIcon, CheckCircleIcon, WarningIcon, FlagIcon, CoverLetterIcon, LinkedInIcon } from './Icons';
import CoverLetterModal from './CoverLetterModal';
import LinkedInOptimizerModal from './LinkedInOptimizerModal';

interface JobCoPilotModalProps {
    learningPath: AdaptiveLearningPath;
    resumeSummary: string;
    onClose: () => void;
}

const JobCoPilotModal: React.FC<JobCoPilotModalProps> = ({ learningPath, resumeSummary, onClose }) => {
    const [jd, setJd] = useState('');
    const [analysis, setAnalysis] = useState<JobFitAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCoverLetterModalOpen, setIsCoverLetterModalOpen] = useState(false);
    const [isLinkedInModalOpen, setIsLinkedInModalOpen] = useState(false);


    const handleAnalyze = async () => {
        if (!jd) return;
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await analyzeJobFit(jd, learningPath);
            setAnalysis(result);
        } catch (e) {
            setError('Failed to analyze the job description. The AI might be busy. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            {isCoverLetterModalOpen && <CoverLetterModal jd={jd} skills={learningPath.skill_gap_analysis} resumeSummary={resumeSummary} onClose={() => setIsCoverLetterModalOpen(false)} />}
            {isLinkedInModalOpen && <LinkedInOptimizerModal jd={jd} skills={learningPath.skill_gap_analysis} onClose={() => setIsLinkedInModalOpen(false)} />}
            
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl flex flex-col max-w-4xl w-full h-[90vh] border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <CrosshairsIcon className="h-6 w-6 text-lime-500 dark:text-lime-400" />
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Job Application Co-Pilot</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tailor your application to any job description.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white text-2xl">&times;</button>
                </div>

                <div className="flex-grow flex flex-col md:flex-row min-h-0">
                    <div className="w-full md:w-1/3 border-r border-slate-200 dark:border-slate-700 p-4 flex flex-col">
                        <label htmlFor="jd-copilot" className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                            <BriefcaseIcon className="w-5 h-5" /> Target Job Description
                        </label>
                        <textarea
                            id="jd-copilot"
                            value={jd}
                            onChange={(e) => setJd(e.target.value)}
                            placeholder="Paste the new job description here..."
                            className="w-full flex-grow bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm resize-none focus:ring-1 focus:ring-grape-500"
                        />
                        <button onClick={handleAnalyze} disabled={isLoading || !jd} className="w-full mt-4 flex justify-center items-center gap-2 bg-grape-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-grape-700 disabled:opacity-50">
                            {isLoading ? <><LoadingIcon className="w-5 h-5 animate-spin" /> Analyzing...</> : 'Analyze Job'}
                        </button>
                    </div>
                    
                    <div className="w-full md:w-2/3 flex flex-col bg-slate-50 dark:bg-slate-900/50">
                        <div className="flex-grow overflow-y-auto p-6">
                            <h4 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Analysis Results</h4>
                            {isLoading ? <div className="flex justify-center items-center h-full"><LoadingIcon className="w-10 h-10 animate-spin text-grape-500 dark:text-grape-400" /></div> :
                             error ? <p className="text-red-500 dark:text-red-400 text-sm text-center">{error}</p> :
                             !analysis ? <p className="text-slate-500 dark:text-slate-500 text-center mt-8">Your job fit analysis will appear here.</p> :
                             (
                                <div className="space-y-6">
                                    <div>
                                        <h5 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><CheckCircleIcon className="w-5 h-5 text-lime-500 dark:text-lime-400"/>Skill Alignment</h5>
                                        {analysis.skillAlignments.length > 0 ? (
                                            <div className="flex flex-wrap gap-2">
                                                {analysis.skillAlignments.map(skill => <span key={skill} className="px-2.5 py-1 text-xs font-medium text-lime-800 dark:text-lime-200 bg-lime-100 dark:bg-lime-900/70 rounded-full border border-lime-200 dark:border-lime-700">{skill}</span>)}
                                            </div>
                                        ) : <p className="text-sm text-slate-500 dark:text-slate-400">No direct skill matches found. Focus on transferable skills!</p>}
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><WarningIcon className="w-5 h-5 text-amber-500 dark:text-amber-400"/>Skill Gaps</h5>
                                        {analysis.skillGaps.length > 0 ? (
                                             <div className="flex flex-wrap gap-2">
                                                {analysis.skillGaps.map(skill => <span key={skill} className="px-2.5 py-1 text-xs font-medium text-amber-800 dark:text-amber-200 bg-amber-100 dark:bg-amber-900/70 rounded-full border border-amber-200 dark:border-amber-700">{skill}</span>)}
                                            </div>
                                        ) : <p className="text-sm text-slate-500 dark:text-slate-400">Great news! No major skill gaps were identified.</p>}
                                    </div>
                                     <div>
                                        <h5 className="font-semibold text-slate-900 dark:text-white mb-2 flex items-center gap-2"><FlagIcon className="w-5 h-5 text-grape-500 dark:text-grape-400"/>Project Showcase</h5>
                                        {analysis.projectRecommendations.length > 0 ? (
                                            <div className="space-y-3">
                                                {analysis.projectRecommendations.map(proj => (
                                                    <div key={proj.projectName} className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                        <p className="font-semibold text-grape-600 dark:text-grape-300 text-sm">{proj.projectName}</p>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{proj.relevance}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <p className="text-sm text-slate-500 dark:text-slate-400">No specific projects from your path were a strong match. Consider highlighting modules that taught relevant skills.</p>}
                                    </div>
                                    <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row gap-4">
                                        <button onClick={() => setIsCoverLetterModalOpen(true)} className="flex-1 flex justify-center items-center gap-2 text-sm bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold py-2 px-3 rounded-lg transition-colors">
                                            <CoverLetterIcon className="w-5 h-5"/> Generate Tailored Cover Letter
                                        </button>
                                         <button onClick={() => setIsLinkedInModalOpen(true)} className="flex-1 flex justify-center items-center gap-2 text-sm bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white hover:bg-slate-300 dark:hover:bg-slate-600 font-semibold py-2 px-3 rounded-lg transition-colors">
                                            <LinkedInIcon className="w-5 h-5"/> Generate LinkedIn Suggestions
                                        </button>
                                    </div>
                                </div>
                             )
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobCoPilotModal;