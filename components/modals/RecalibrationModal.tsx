import React, { useState, useMemo } from 'react';
import { type SkillConfidence } from '../../types';
import { AdjustmentsIcon } from '../Icons';
import { useAppContext } from '../../contexts/AppContext';

interface RecalibrationModalProps {
    onRecalibrate: (feedback: SkillConfidence[]) => void;
    onClose: () => void;
    currentWeekIndex: number;
}

const RecalibrationModal: React.FC<RecalibrationModalProps> = ({ onRecalibrate, onClose, currentWeekIndex }) => {
    const { state } = useAppContext();
    const { learningPath } = state;
    const [confidence, setConfidence] = useState<Record<string, 'Low' | 'Medium' | 'High'>>({});

    const skillsToReview = useMemo(() => {
        if (!learningPath) return [];
        const completedOrCurrentWeeks = learningPath.weekly_schedule.slice(0, currentWeekIndex + 1);
        const skills = new Set<string>();
        completedOrCurrentWeeks.forEach(week => {
            if (week.checkpoint_quiz) {
                skills.add(week.checkpoint_quiz.skill_focus);
            }
            week.modules.forEach(module => {
                const relatedSkill = learningPath.skill_gap_analysis.find(s => module.concept.toLowerCase().includes(s.skill.toLowerCase()));
                if (relatedSkill) skills.add(relatedSkill.skill);
            });
        });
        return Array.from(skills);
    }, [learningPath, currentWeekIndex]);

    const handleSubmit = () => {
        const feedback: SkillConfidence[] = skillsToReview.map(skill => ({
            skill,
            confidence: confidence[skill] || 'Medium',
        }));
        onRecalibrate(feedback);
    };
    
    return (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-grape-100 dark:bg-grape-900/50 sm:mx-0 sm:h-10 sm:w-10">
                        <AdjustmentsIcon className="h-6 w-6 text-grape-600 dark:text-grape-400" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Progress Check-in</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Rate your confidence in the skills you've worked on so the AI can adjust your upcoming schedule.</p>
                    </div>
                </div>
                
                <div className="mt-4 space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                    {skillsToReview.map(skill => (
                        <div key={skill}>
                            <label className="font-semibold text-slate-800 dark:text-slate-200">{skill}</label>
                            <div className="mt-2 grid grid-cols-3 gap-2">
                                {(['Low', 'Medium', 'High'] as const).map(level => {
                                    const isSelected = confidence[skill] === level;
                                    return (
                                        <button key={level} onClick={() => setConfidence(prev => ({...prev, [skill]: level}))}
                                            className={`p-2 text-sm rounded-md border transition-colors ${
                                                isSelected 
                                                    ? 'bg-grape-600 border-grape-500 text-white font-semibold' 
                                                    : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`
                                            }
                                        >
                                            {level}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <button type="button" onClick={handleSubmit} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-grape-600 text-base font-medium text-white hover:bg-grape-700 sm:w-auto sm:text-sm">Recalibrate My Path</button>
                    <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default RecalibrationModal;