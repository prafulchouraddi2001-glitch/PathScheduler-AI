import React from 'react';
import { WarningIcon } from '../Icons';

interface DeleteModuleConfirmationModalProps {
    onConfirm: () => void;
    onClose: () => void;
}

const DeleteModuleConfirmationModal: React.FC<DeleteModuleConfirmationModalProps> = ({ onConfirm, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-4">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 sm:mx-0 sm:h-10 sm:w-10">
                        <WarningIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-grow">
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Delete Module</h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Are you sure you want to delete this module? This action cannot be undone.</p>
                    </div>
                </div>
                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                    <button type="button" onClick={onConfirm} className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 sm:w-auto sm:text-sm">Delete</button>
                    <button type="button" onClick={onClose} className="mt-3 w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 sm:mt-0 sm:w-auto sm:text-sm">Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default DeleteModuleConfirmationModal;