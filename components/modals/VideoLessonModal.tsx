import React, { useState, useEffect, useRef } from 'react';
// FIX: Import AIStudio from the central types file and remove the local definition to resolve a type conflict with another declaration of window.aistudio.
import { type MicrolearningModule, type AIStudio } from '../../types';
import { generateVideoFromConcept } from '../../services/geminiService';
import { VideoCameraIcon, LoadingIcon } from '../Icons';
import { useAppContext } from '../../contexts/AppContext';

interface VideoLessonModalProps {
    module: MicrolearningModule;
    weekIdx: number;
    modIdx: number;
    onClose: () => void;
}

const loadingMessages = [
    "Contacting the AI film director...",
    "Warming up the AI film studio...",
    "Storyboarding the concept visuals...",
    "Rendering the first few scenes...",
    "This can take a minute or two...",
    "Applying final visual effects...",
    "Preparing the final cut...",
];

// This is a global declaration for the aistudio object that is expected to be on the window
// FIX: Removed redundant global declaration to resolve type conflict. The type is imported from `types.ts`.
declare global {
    interface Window {
        aistudio: AIStudio;
    }
}

const VideoLessonModal: React.FC<VideoLessonModalProps> = ({ module, weekIdx, modIdx, onClose }) => {
    const { dispatch } = useAppContext();
    const [videoUrl, setVideoUrl] = useState<string | null>(module.cachedVideoUrl || null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    // New state for API Key flow
    const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
    const hasStartedGeneration = useRef(false);

    useEffect(() => {
        let interval: number;
        if (isLoading) {
            interval = window.setInterval(() => {
                setCurrentMessageIndex(prev => (prev + 1) % loadingMessages.length);
            }, 4000);
        }
        return () => window.clearInterval(interval);
    }, [isLoading]);

    const handleGenerateVideo = async () => {
        if (hasStartedGeneration.current) return;
        hasStartedGeneration.current = true;
        
        setIsLoading(true);
        setError(null);
        setCurrentMessageIndex(0);

        try {
            const url = await generateVideoFromConcept(module.concept);
            setVideoUrl(url);
            dispatch({ type: 'SAVE_VIDEO_URL', payload: { weekIdx, modIdx, videoUrl: url } });
        } catch (e: any) {
            console.error("Failed to generate video lesson", e);
            if (e.message && e.message.includes("Requested entity was not found")) {
                setError("Your API key may be invalid or lack permissions. Please select a valid API key.");
                setHasApiKey(false); // Reset key state to show prompt again
            } else {
                setError("Could not generate video lesson. The AI might be busy or unavailable. Please try again later.");
            }
        } finally {
            setIsLoading(false);
            hasStartedGeneration.current = false;
        }
    };

    // Check for API key on mount if there's no cached video
    useEffect(() => {
        if (!videoUrl) {
            const checkApiKey = async () => {
                if (window.aistudio) {
                    const keySelected = await window.aistudio.hasSelectedApiKey();
                    setHasApiKey(keySelected);
                } else {
                    // Fallback if the aistudio object is not available
                    setError("Video generation is not available in this environment.");
                }
            };
            checkApiKey();
        }
    }, [videoUrl]);
    
    // Trigger generation automatically if key exists
    useEffect(() => {
        if (hasApiKey === true && !isLoading && !videoUrl && !error) {
             handleGenerateVideo();
        }
    }, [hasApiKey, videoUrl, error, isLoading]);


    const handleSelectKey = async () => {
        if (window.aistudio) {
            await window.aistudio.openSelectKey();
            // Assume key selection is successful and trigger generation
            setHasApiKey(true);
            setError(null); // Clear previous errors
        }
    };
    
    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="text-center">
                    <LoadingIcon className="w-12 h-12 animate-spin text-grape-400 mx-auto" />
                    <p className="mt-4 text-slate-300 transition-opacity duration-500">{loadingMessages[currentMessageIndex]}</p>
                </div>
            );
        }
        if (error) {
            return <p className="text-red-400 text-center px-4">{error}</p>;
        }
        if (videoUrl) {
            return <video src={videoUrl} controls autoPlay className="w-full h-full object-contain" />;
        }
        if (hasApiKey === false) {
             return (
                <div className="text-center p-8">
                    <h4 className="font-semibold text-white mb-2">API Key Required</h4>
                    <p className="text-sm text-slate-400 mb-4">
                        To generate AI videos with Veo, you need to select an API key. This is a one-time setup.
                        For more information, see the <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-grape-400 underline">billing documentation</a>.
                    </p>
                    <button onClick={handleSelectKey} className="bg-grape-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-grape-700">
                        Select API Key
                    </button>
                </div>
            );
        }
        // Initial state while checking for key
        return (
             <div className="text-center">
                <LoadingIcon className="w-12 h-12 animate-spin text-grape-400 mx-auto" />
                <p className="mt-4 text-slate-300">Checking API key status...</p>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-4xl w-full border border-slate-200 dark:border-slate-700 flex flex-col">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <VideoCameraIcon className="w-6 h-6 text-grape-500 dark:text-grape-400" />
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">AI Video Lesson</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{module.module_name}</p>
                        </div>
                    </div>
                     <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white text-2xl">&times;</button>
                </div>
                
                <div className="aspect-video bg-slate-900 flex items-center justify-center">
                    {renderContent()}
                </div>
                
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                     <button type="button" onClick={onClose} className="w-full sm:w-auto inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-6 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">Close</button>
                </div>
            </div>
        </div>
    );
};

export default VideoLessonModal;