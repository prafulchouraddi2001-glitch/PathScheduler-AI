import React from 'react';
import type { MicrolearningModule } from '../../types';
import { CheckCircleIcon } from '../Icons';

interface CompleteModuleConfirmationModalProps {
    module: MicrolearningModule;
    onConfirm: () => void;
    onClose: () => void;
}

const CompleteModuleConfirmationModal: React.FC<CompleteModuleConfirmationModalProps> = ({ module, onConfirm, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-lime-100 dark:bg-lime-900/50 sm:mx-0 sm:h-10 sm:w-10">
                        <CheckCircleIcon className="h-6 w-6 text-lime-600 dark:text-lime-400" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Confirm Completion</h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            Mark the module "<span className="font-semibold text-slate-700 dark:text-slate-200">{module.module_name}</span>" as complete?
                        </p>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <button type="button" onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-lime-600 text-base font-medium text-white hover:bg-lime-700 sm:w-auto sm:text-sm">Confirm</button>
                    <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default CompleteModuleConfirmationModal;