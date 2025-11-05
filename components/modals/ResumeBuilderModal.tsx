import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { ResumeIcon, TrashIcon, ClipboardIcon, CheckCircleIcon } from '../Icons';
import { type ResumePoint } from '../../types';

interface ResumeBuilderModalProps {
    onClose: () => void;
}

const ResumeBuilderModal: React.FC<ResumeBuilderModalProps> = ({ onClose }) => {
    const { state, dispatch } = useAppContext();
    const { resumeBuilderPoints } = state;
    const [editingPoint, setEditingPoint] = useState<ResumePoint | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleUpdate = () => {
        if (editingPoint) {
            dispatch({ type: 'UPDATE_RESUME_POINT', payload: editingPoint });
            setEditingPoint(null);
        }
    };

    const handleCopyAll = () => {
        const allPointsText = resumeBuilderPoints.map(p => `• ${p.content}`).join('\n');
        navigator.clipboard.writeText(allPointsText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl flex flex-col max-w-2xl w-full h-[80vh] border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ResumeIcon className="h-6 w-6 text-grape-500 dark:text-grape-400" />
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">AI Resume Builder</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Collect, edit, and export your achievements.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white text-2xl">&times;</button>
                </div>

                <div className="flex-grow p-4 overflow-y-auto">
                    {resumeBuilderPoints.length === 0 ? (
                        <div className="text-center text-slate-500 dark:text-slate-400 h-full flex items-center justify-center">
                            <p>Your collected resume points will appear here. <br/> Add points from modules in your learning path.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {resumeBuilderPoints.map(point => (
                                <li key={point.id} className="bg-slate-100 dark:bg-slate-900/50 p-3 rounded-lg">
                                    {editingPoint?.id === point.id ? (
                                        <div>
                                            <textarea
                                                value={editingPoint.content}
                                                onChange={(e) => setEditingPoint({ ...editingPoint, content: e.target.value })}
                                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm"
                                                rows={3}
                                            />
                                            <div className="flex gap-2 mt-2">
                                                <button onClick={handleUpdate} className="text-sm bg-grape-600 text-white font-semibold py-1 px-3 rounded-md">Save</button>
                                                <button onClick={() => setEditingPoint(null)} className="text-sm bg-slate-200 dark:bg-slate-700 py-1 px-3 rounded-md">Cancel</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start justify-between gap-4">
                                            <p className="text-sm text-slate-800 dark:text-slate-200 flex-grow" onDoubleClick={() => setEditingPoint(point)}>{point.content}</p>
                                            <div className="flex-shrink-0 flex gap-2">
                                                <button onClick={() => setEditingPoint(point)} className="text-slate-500 hover:text-grape-600 text-xs">Edit</button>
                                                <button onClick={() => dispatch({ type: 'DELETE_RESUME_POINT', payload: point.id })} className="text-slate-500 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                                            </div>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Double-click a point to edit.</p>
                    <div className="flex gap-3 w-full sm:w-auto">
                         <button onClick={onClose} className="flex-1 sm:flex-none justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">Close</button>
                         <button onClick={handleCopyAll} disabled={resumeBuilderPoints.length === 0} className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-md border border-transparent shadow-sm px-4 py-2 bg-grape-600 text-sm font-medium text-white hover:bg-grape-700 disabled:opacity-50">
                            {isCopied ? <CheckCircleIcon className="w-5 h-5" /> : <ClipboardIcon className="w-5 h-5" />}
                            {isCopied ? 'Copied!' : 'Copy All Points'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeBuilderModal;