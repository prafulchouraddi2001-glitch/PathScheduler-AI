import React, { useState, useEffect, useRef } from 'react';
import { type MicrolearningModule } from '../../types';
import { generateSpeechFromText } from '../../services/geminiService';
import { HeadphonesIcon, LoadingIcon } from '../Icons';

// Helper functions from LearningPathDisplay, now local to this component
function decode(base64: string) {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
        const channelData = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
        }
    }
    return buffer;
}

interface PodcastPlayerModalProps {
    module: MicrolearningModule;
    onClose: () => void;
    initialAudioData?: string;
}

const PodcastPlayerModal: React.FC<PodcastPlayerModalProps> = ({ module, onClose, initialAudioData }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);
    const audioBufferRef = useRef<AudioBuffer | null>(null);
    const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        const generateAndDecode = async () => {
            try {
                const base64Audio = initialAudioData || await generateSpeechFromText(`Lesson: ${module.module_name}. Concept: ${module.concept}.`);
                if (!audioContextRef.current) return;
                const decodedBuffer = await decodeAudioData(decode(base64Audio), audioContextRef.current, 24000, 1);
                audioBufferRef.current = decodedBuffer;
                setIsLoading(false);
            } catch (e) {
                console.error("Failed to generate or decode speech", e);
                setError("Could not load audio lesson. Please try again.");
                setIsLoading(false);
            }
        };
        generateAndDecode();

        return () => {
            sourceNodeRef.current?.stop();
            audioContextRef.current?.close();
        };
    }, [module, initialAudioData]);

    const togglePlay = () => {
        if (!audioContextRef.current || !audioBufferRef.current) return;
        if (isPlaying) {
            sourceNodeRef.current?.stop();
            setIsPlaying(false);
        } else {
            const source = audioContextRef.current.createBufferSource();
            source.buffer = audioBufferRef.current;
            source.connect(audioContextRef.current.destination);
            source.onended = () => {
                setIsPlaying(false);
                sourceNodeRef.current = null;
            };
            source.start();
            sourceNodeRef.current = source;
            setIsPlaying(true);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4 mb-4">
                    <HeadphonesIcon className="w-8 h-8 text-grape-500 dark:text-grape-400" />
                    <div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">Audio Lesson</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{module.module_name}</p>
                    </div>
                </div>
                <div className="h-24 flex items-center justify-center">
                    {isLoading ? <LoadingIcon className="w-10 h-10 animate-spin text-grape-500 dark:text-grape-400" /> :
                     error ? <p className="text-red-500 dark:text-red-400 text-sm">{error}</p> :
                     <button onClick={togglePlay} className="w-16 h-16 bg-grape-600 rounded-full flex items-center justify-center text-white hover:bg-grape-700 transition-colors">
                        {isPlaying ? 
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path></svg> :
                            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg>
                        }
                     </button>
                    }
                </div>
                <div className="mt-4 flex justify-center">
                     <button type="button" onClick={onClose} className="w-full sm:w-auto inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-6 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600">Close</button>
                </div>
            </div>
        </div>
    );
};

export default PodcastPlayerModal;