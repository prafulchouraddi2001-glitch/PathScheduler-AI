import React from 'react';
import { useAppContext } from '../contexts/AppContext';

// Import all modal components
import CompleteModuleConfirmationModal from './modals/CompleteModuleConfirmationModal';
import DeleteModuleConfirmationModal from './modals/DeleteModuleConfirmationModal';
import LiveTutorModal from './modals/LiveTutorModal';
import MockInterviewModal from './modals/MockInterviewModal';
import VideoLessonModal from './modals/VideoLessonModal';
import QuizModal from './modals/QuizModal';
import RecalibrationModal from './modals/RecalibrationModal';
import ResumeHelperModal from './modals/ResumeHelperModal';
import ResumeBuilderModal from './modals/ResumeBuilderModal';
import TutorModal from './modals/TutorModal';
import CoverLetterModal from './CoverLetterModal';
import LinkedInOptimizerModal from './LinkedInOptimizerModal';
import ProjectStarterModal from './ProjectStarterModal';
import CodeLabModal from './CodeLabModal';
import JobCoPilotModal from './JobCoPilotModal';
import { WarningIcon } from './Icons';

const ResetConfirmationModal: React.FC<{ onConfirm: () => void; onClose: () => void }> = ({ onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-700">
            <div className="flex items-start gap-4">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                    <WarningIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-grow">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white">Generate New Path</h3>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Are you sure? Your current path and progress will be permanently deleted.</p>
                </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                <button type="button" onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:w-auto sm:text-sm">Confirm</button>
                <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
            </div>
        </div>
    </div>
);

const ModalManager: React.FC<{ onConfirmReset: () => void }> = ({ onConfirmReset }) => {
    const { state, dispatch } = useAppContext();
    const { modalState, learningPath, userInputs, offlineContent } = state;

    if (modalState.type === 'none' || !learningPath) return null;

    const onClose = () => dispatch({ type: 'CLOSE_MODAL' });

    switch (modalState.type) {
        case 'resetConfirmation':
            return <ResetConfirmationModal onConfirm={onConfirmReset} onClose={onClose} />;
        
        case 'completeConfirmation': {
            const { weekIdx, modIdx, module } = modalState.data;
            return <CompleteModuleConfirmationModal
                module={module}
                onConfirm={() => {
                    dispatch({ type: 'COMPLETE_MODULE', payload: { weekIdx, modIdx, completed: true } });
                    onClose();
                }}
                onClose={onClose}
            />;
        }

        case 'deleteConfirmation': {
            const { weekIdx, modIdx } = modalState.data;
            return <DeleteModuleConfirmationModal
                onConfirm={() => {
                    dispatch({ type: 'DELETE_MODULE', payload: { weekIdx, modIdx } });
                    onClose();
                }}
                onClose={onClose}
            />;
        }

        case 'resumeHelper':
            return <ResumeHelperModal module={modalState.data} onClose={onClose} />;
        
        case 'mockInterview':
            return <MockInterviewModal skillFocus={learningPath.ai_interview_simulation.skill_focus} onClose={onClose} />;

        case 'quiz': {
            const { details, weekNumber } = modalState.data;
            return <QuizModal quizDetails={details} onClose={onClose} initialQuizData={offlineContent[weekNumber]?.quiz} />;
        }

        case 'tutor':
            return <TutorModal module={modalState.data} onClose={onClose} />;

        case 'liveTutor':
            return <LiveTutorModal module={modalState.data} onClose={onClose} />;
        
        case 'videoLessonPlayer': {
            const { module, weekIdx, modIdx } = modalState.data;
            return <VideoLessonModal module={module} weekIdx={weekIdx} modIdx={modIdx} onClose={onClose} />;
        }

        case 'coverLetter':
            return <CoverLetterModal jd={userInputs.jd} skills={learningPath.skill_gap_analysis} resumeSummary={userInputs.resumeSummary} onClose={onClose} />;

        case 'linkedIn':
            return <LinkedInOptimizerModal jd={userInputs.jd} skills={learningPath.skill_gap_analysis} onClose={onClose} />;

        case 'projectStarter':
            return <ProjectStarterModal project={modalState.data} onClose={onClose} />;

        case 'recalibration':
            return <RecalibrationModal onRecalibrate={modalState.data.onRecalibrate} currentWeekIndex={modalState.data.currentWeekIndex} onClose={onClose} />;

        case 'codeLab':
            return <CodeLabModal module={modalState.data} onClose={onClose} />;
            
        case 'jobCoPilot':
            return <JobCoPilotModal learningPath={learningPath} resumeSummary={userInputs.resumeSummary} onClose={onClose} />;
            
        case 'resumeBuilder':
            return <ResumeBuilderModal onClose={onClose} />;

        default:
            return null;
    }
};

export default ModalManager;