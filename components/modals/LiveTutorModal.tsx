import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, type LiveSession, type Blob } from "@google/genai";
import { type MicrolearningModule } from '../../types';
import { LiveIcon, UserIcon as InterviewUserIcon } from '../Icons';

// Helper functions for audio processing
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

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Resamples the audio buffer from a given sample rate to the target sample rate using linear interpolation.
function resampleAndInterpolate(input: Float32Array, fromSampleRate: number, toSampleRate: number): Float32Array {
    if (fromSampleRate === toSampleRate) {
        return input;
    }
    const outputLength = Math.floor(input.length * toSampleRate / fromSampleRate);
    const output = new Float32Array(outputLength);
    const ratio = input.length / outputLength;
    for (let i = 0; i < outputLength; i++) {
        const floatIndex = i * ratio;
        const lowerIndex = Math.floor(floatIndex);
        const upperIndex = Math.min(lowerIndex + 1, input.length - 1);
        const weight = floatIndex - lowerIndex;
        output[i] = input[lowerIndex] * (1 - weight) + input[upperIndex] * weight;
    }
    return output;
}


function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  // The mimeType is hardcoded to 16000Hz because we have resampled the audio to this rate.
  return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
}


const LiveTutorModal: React.FC<{ module: MicrolearningModule; onClose: () => void }> = ({ module, onClose }) => {
    const [status, setStatus] = useState('Connecting...');
    const [transcription, setTranscription] = useState<{ user: string; model: string; isFinal: boolean }[]>([]);
    
    const sessionRef = useRef<LiveSession | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const nextStartTimeRef = useRef(0);
    const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

    useEffect(() => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

        let currentInput = '';
        let currentOutput = '';

        const setup = async () => {
            try {
                // Get audio stream without sample rate constraint to accept device default
                streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true } });
                setStatus('Initializing...');
                
                // Create AudioContext with device default sample rate to avoid mismatch errors
                const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
                audioContextRef.current = inputAudioContext;
                
                const sessionPromise = ai.live.connect({
                    model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                    callbacks: {
                        onopen: () => {
                            setStatus('Listening...');
                            const source = inputAudioContext.createMediaStreamSource(streamRef.current!);
                            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                                const sourceSampleRate = audioProcessingEvent.inputBuffer.sampleRate;
                                
                                // Resample the audio to the required 16000Hz before sending
                                const resampledData = resampleAndInterpolate(inputData, sourceSampleRate, 16000);
                                
                                const pcmBlob = createBlob(resampledData);
                                sessionPromise.then((session) => {
                                    session.sendRealtimeInput({ media: pcmBlob });
                                });
                            };
                            source.connect(scriptProcessor);
                            scriptProcessor.connect(inputAudioContext.destination);
                            mediaStreamSourceRef.current = source;
                            scriptProcessorRef.current = scriptProcessor;
                        },
                        onmessage: async (message: LiveServerMessage) => {
                            if (message.serverContent?.inputTranscription) {
                                currentInput = message.serverContent.inputTranscription.text;
                                setTranscription(prev => {
                                    const last = prev[prev.length - 1];
                                    if(last && !last.isFinal) {
                                        return [...prev.slice(0, -1), { ...last, user: currentInput }];
                                    }
                                    return [...prev, { user: currentInput, model: '', isFinal: false }];
                                });
                            }
                            if (message.serverContent?.outputTranscription) {
                                setStatus('Speaking...');
                                currentOutput += message.serverContent.outputTranscription.text;
                                setTranscription(prev => {
                                     const last = prev[prev.length - 1];
                                     if(last) return [...prev.slice(0, -1), { ...last, model: currentOutput }];
                                     return prev;
                                });
                            }
                            if (message.serverContent?.turnComplete) {
                                setTranscription(prev => {
                                    const last = prev[prev.length - 1];
                                    if(last) return [...prev.slice(0, -1), { user: currentInput, model: currentOutput, isFinal: true }];
                                    return prev;
                                });
                                currentInput = '';
                                currentOutput = '';
                                setStatus('Listening...');
                            }

                            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                            if (base64Audio && outputAudioContextRef.current) {
                                const nextStartTime = Math.max(nextStartTimeRef.current, outputAudioContextRef.current.currentTime);
                                const audioBuffer = await decodeAudioData(decode(base64Audio), outputAudioContextRef.current, 24000, 1);
                                const source = outputAudioContextRef.current.createBufferSource();
                                source.buffer = audioBuffer;
                                source.connect(outputAudioContextRef.current.destination);
                                source.addEventListener('ended', () => {
                                    sourcesRef.current.delete(source);
                                    if(sourcesRef.current.size === 0) setStatus('Listening...');
                                });
                                source.start(nextStartTime);
                                nextStartTimeRef.current = nextStartTime + audioBuffer.duration;
                                sourcesRef.current.add(source);
                            }
                        },
                        onerror: (e) => { setStatus(`Error: ${e.type}`); console.error(e); },
                        onclose: () => { setStatus('Session ended.'); },
                    },
                    config: {
                        responseModalities: [Modality.AUDIO],
                        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                        systemInstruction: `You are an expert AI Study Buddy. The current topic is "${module.concept}". Greet the user and ask how you can help them with this topic. Be friendly, encouraging, and explain concepts clearly.`,
                        inputAudioTranscription: {},
                        outputAudioTranscription: {},
                    },
                });
                sessionRef.current = await sessionPromise;
            } catch (error) {
                console.error('Error setting up live session:', error);
                setStatus('Error: Could not access microphone.');
            }
        };

        setup();

        return () => {
            sessionRef.current?.close();
            streamRef.current?.getTracks().forEach(track => track.stop());
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close();
            }
            if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
                outputAudioContextRef.current.close();
            }
            scriptProcessorRef.current?.disconnect();
            mediaStreamSourceRef.current?.disconnect();
        };
    }, [module.concept]);

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl flex flex-col max-w-2xl w-full h-[80vh] border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <LiveIcon className="h-6 w-6 text-grape-500 dark:text-grape-400" />
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Live AI Voice Tutor</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Topic: {module.concept}</p>
                        </div>
                    </div>
                    <p className="text-sm font-medium px-3 py-1 bg-slate-100 dark:bg-slate-700/50 rounded-full">{status}</p>
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                     {transcription.map((turn, idx) => (
                        <div key={idx} className="space-y-2">
                             {turn.user && <div className="flex items-start gap-3 justify-end">
                                <p className={`max-w-md p-3 rounded-lg text-sm bg-grape-600 text-white ${!turn.isFinal && idx === transcription.length - 1 ? 'opacity-70' : ''}`}>{turn.user}</p>
                                <InterviewUserIcon className="w-6 h-6 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-1" />
                            </div>}
                             {turn.model && <div className="flex items-start gap-3">
                                <LiveIcon className="w-6 h-6 text-grape-500 dark:text-grape-400 flex-shrink-0 mt-1" />
                                <p className="max-w-md p-3 rounded-lg text-sm bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">{turn.model}</p>
                            </div>}
                        </div>
                     ))}
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-center">
                    <button onClick={onClose} className="bg-red-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-red-700">End Session</button>
                </div>
            </div>
        </div>
    );
};

export default LiveTutorModal;