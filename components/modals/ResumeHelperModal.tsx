import React, { useState, useEffect } from 'react';
import type { MicrolearningModule } from '../../types';
import { generateResumeBulletPoint } from '../../services/geminiService';
import { ResumeIcon, LoadingIcon, CheckCircleIcon } from '../Icons';
import { useAppContext } from '../../contexts/AppContext';

interface ResumeHelperModalProps {
    module: MicrolearningModule;
    onClose: () => void;
}

const ResumeHelperModal: React.FC<ResumeHelperModalProps> = ({ module, onClose }) => {
    const { dispatch } = useAppContext();
    const [bulletPoint, setBulletPoint] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isAdded, setIsAdded] = useState(false);

    useEffect(() => {
        const generate = async () => {
            setIsLoading(true);
            const result = await generateResumeBulletPoint(module.concept);
            setBulletPoint(result);
            setIsLoading(false);
        };
        generate();
    }, [module.concept]);
    
    const handleAddToBuilder = () => {
        if (bulletPoint) {
            dispatch({ type: 'ADD_RESUME_POINT', payload: bulletPoint });
            setIsAdded(true);
            setTimeout(() => {
                onClose();
            }, 1500);
        }
    };

    return (
         <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-grape-100 dark:bg-grape-900/50 sm:mx-0 sm:h-10 sm:w-10">
                        <ResumeIcon className="h-6 w-6 text-grape-600 dark:text-grape-400" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">AI Resume Helper</h3>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">For module: <span className="font-semibold text-slate-700 dark:text-slate-200">{module.module_name}</span></p>
                    </div>
                </div>
                 <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-md min-h-[80px] flex items-center justify-center">
                    {isLoading ? (
                        <LoadingIcon className="w-6 h-6 animate-spin text-grape-500 dark:text-grape-400" />
                    ) : (
                        <p className="text-slate-700 dark:text-slate-300 text-sm">{bulletPoint}</p>
                    )}
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <button type="button" onClick={handleAddToBuilder} disabled={isLoading || isAdded} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-grape-600 text-base font-medium text-white hover:bg-grape-700 sm:w-auto sm:text-sm disabled:opacity-50">
                       {isAdded ? <><CheckCircleIcon className="w-5 h-5 mr-2" /> Added!</> : 'Add to Builder'}
                    </button>
                    <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto sm:text-sm">
                       {isAdded ? 'Close' : 'Cancel'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ResumeHelperModal;