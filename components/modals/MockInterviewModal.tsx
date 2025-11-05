import React, { useState, useEffect, useRef } from 'react';
import { getInterviewResponse } from '../../services/geminiService';
import { ChatBubbleIcon, TrophyIcon, UserIcon as InterviewUserIcon, LoadingIcon, SendIcon } from '../Icons';
import MarkdownRenderer from '../MarkdownRenderer';

interface MockInterviewModalProps {
    skillFocus: string;
    onClose: () => void;
}

const MockInterviewModal: React.FC<MockInterviewModalProps> = ({ skillFocus, onClose }) => {
    const [history, setHistory] = useState<{ role: 'user' | 'model', parts: { text: string }[] }[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isResponding, setIsResponding] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const startInterview = async () => {
            setIsResponding(true);
            const initialResponse = await getInterviewResponse([], skillFocus);
            setHistory([{ role: 'model', parts: [{ text: initialResponse }] }]);
            setIsResponding(false);
        };
        startInterview();
    }, [skillFocus]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history]);

    const handleSend = async () => {
        if (!userInput.trim() || isResponding) return;
        const newUserMessage = { role: 'user' as const, parts: [{ text: userInput }] };
        const newHistory = [...history, newUserMessage];
        setHistory(newHistory);
        setUserInput('');
        setIsResponding(true);

        const aiResponse = await getInterviewResponse(newHistory, skillFocus);
        setHistory([...newHistory, { role: 'model', parts: [{ text: aiResponse }] }]);
        setIsResponding(false);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl flex flex-col max-w-2xl w-full h-[80vh] border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <ChatBubbleIcon className="h-6 w-6 text-grape-500 dark:text-grape-400" />
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">AI Mock Interview</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Focus: {skillFocus}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white">&times;</button>
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {history.map((msg, idx) => (
                        <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                            {msg.role === 'model' && <TrophyIcon className="w-6 h-6 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-1" />}
                            <div className={`max-w-md p-3 rounded-lg ${msg.role === 'model' ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200' : 'bg-grape-600 text-white'}`}>
                                 {msg.role === 'model' ? <MarkdownRenderer content={msg.parts[0].text} /> : <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.parts[0].text}</p>}
                            </div>
                            {msg.role === 'user' && <InterviewUserIcon className="w-6 h-6 text-slate-500 dark:text-slate-400 flex-shrink-0 mt-1" />}
                        </div>
                    ))}
                    {isResponding && (
                         <div className="flex items-start gap-3">
                            <TrophyIcon className="w-6 h-6 text-amber-500 dark:text-amber-400 flex-shrink-0 mt-1" />
                            <div className="max-w-md p-3 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                                <LoadingIcon className="w-5 h-5 animate-spin" />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3">
                    <input
                        type="text"
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type your answer..."
                        className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-1 focus:ring-grape-500"
                        disabled={isResponding}
                    />
                    <button onClick={handleSend} disabled={isResponding || !userInput.trim()} className="p-2 bg-grape-600 text-white rounded-lg hover:bg-grape-700 disabled:opacity-50">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MockInterviewModal;