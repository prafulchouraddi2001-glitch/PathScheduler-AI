import React, { useState, useEffect, useMemo, useRef } from 'react';
import { type AdaptiveLearningPath, type DiscussionChannel, type DiscussionMessage } from '../types';
import { generateSeedMessages } from '../services/geminiService';
import { UsersIcon, LoadingIcon, SendIcon, ChevronLeftIcon, HashtagIcon, UserIcon } from './Icons';

interface CommunityTabProps {
    learningPath: AdaptiveLearningPath;
}

const CommunityTab: React.FC<CommunityTabProps> = ({ learningPath }) => {
    const [channels, setChannels] = useState<DiscussionChannel[]>([]);
    const [activeChannel, setActiveChannel] = useState<DiscussionChannel | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const availableChannels = useMemo(() => {
        const skills = learningPath.skill_gap_analysis
            .sort((a, b) => a.priority_level - b.priority_level)
            .map(s => s.skill.toLowerCase().replace(/[^a-z0-9]/g, ''))
            .filter((value, index, self) => self.indexOf(value) === index); // Unique skills

        return skills.slice(0, 5).map(skill => ({
            id: skill,
            name: `${learningPath.skill_gap_analysis.find(s=>s.skill.toLowerCase().replace(/[^a-z0-9]/g, '') === skill)?.skill} Discussions`,
            description: `Ask questions, share resources, and discuss projects related to ${learningPath.skill_gap_analysis.find(s=>s.skill.toLowerCase().replace(/[^a-z0-9]/g, '') === skill)?.skill}.`,
            messages: []
        }));
    }, [learningPath]);
    
    useEffect(() => {
        setChannels(availableChannels);
    }, [availableChannels]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChannel?.messages]);


    const handleSelectChannel = async (channel: DiscussionChannel) => {
        setIsLoading(true);
        setActiveChannel(channel);

        const existingChannel = channels.find(c => c.id === channel.id);
        if (existingChannel && existingChannel.messages.length === 0) {
            const seedMessages = await generateSeedMessages(channel.name);
            const updatedChannel = { ...existingChannel, messages: seedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()) };
            setChannels(prev => prev.map(c => c.id === channel.id ? updatedChannel : c));
            setActiveChannel(updatedChannel);
        }
        setIsLoading(false);
    };

    const handleSendMessage = () => {
        if (!newMessage.trim() || !activeChannel) return;
        
        const userMessage: DiscussionMessage = {
            authorName: 'You',
            content: newMessage,
            timestamp: new Date().toISOString()
        };

        const updatedChannel = { ...activeChannel, messages: [...activeChannel.messages, userMessage] };
        
        setActiveChannel(updatedChannel);
        setChannels(prev => prev.map(c => c.id === updatedChannel.id ? updatedChannel : c));
        setNewMessage('');
    };

    if (activeChannel) {
        return (
            <div className="flex flex-col h-[75vh] bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 mt-6">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <button onClick={() => setActiveChannel(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </button>
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{activeChannel.name}</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{activeChannel.description}</p>
                    </div>
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-4">
                    {isLoading ? <div className="flex justify-center items-center h-full"><LoadingIcon className="w-8 h-8 animate-spin" /></div> :
                        activeChannel.messages.map((msg, idx) => (
                             <div key={idx} className={`flex items-start gap-3 ${msg.authorName === 'You' ? 'flex-row-reverse' : ''}`}>
                                <div className={`p-2 rounded-full ${msg.authorName === 'You' ? 'bg-grape-600' : 'bg-slate-500 dark:bg-slate-600'}`}>
                                    <UserIcon className="w-5 h-5 text-white" />
                                </div>
                                <div className={`max-w-xl p-3 rounded-lg ${msg.authorName === 'You' ? 'bg-grape-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-sm font-semibold">{msg.authorName}</p>
                                        <p className={`text-xs ${msg.authorName === 'You' ? 'text-grape-200' : 'text-slate-500 dark:text-slate-400'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                    <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                                </div>
                            </div>
                        ))
                    }
                    <div ref={messagesEndRef} />
                </div>
                 <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex items-center gap-3 bg-white dark:bg-slate-800/80">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={`Message in #${activeChannel.id}`}
                        className="w-full bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg p-2 text-sm focus:ring-1 focus:ring-grape-500"
                    />
                    <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="p-2 bg-grape-600 text-white rounded-lg hover:bg-grape-700 disabled:opacity-50">
                        <SendIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white"><UsersIcon className="w-6 h-6 text-grape-500 dark:text-grape-400"/>Community Channels</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {channels.map(channel => (
                    <button key={channel.id} onClick={() => handleSelectChannel(channel)} className="text-left bg-white dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-grape-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <HashtagIcon className="w-5 h-5 text-grape-500 dark:text-grape-400"/>
                            <h4 className="font-semibold text-slate-900 dark:text-white">{channel.name}</h4>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{channel.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default CommunityTab;