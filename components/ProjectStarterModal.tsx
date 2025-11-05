import React, { useState, useEffect } from 'react';
import { type CapstoneProject, type ProjectFile } from '../types';
import { generateProjectScaffold } from '../services/geminiService';
import { CodeBracketSquareIcon, LoadingIcon, FolderIcon, DocumentIcon, ClipboardIcon, CheckCircleIcon } from './Icons';

interface ProjectStarterModalProps {
    project: CapstoneProject;
    onClose: () => void;
}

const ProjectStarterModal: React.FC<ProjectStarterModalProps> = ({ project, onClose }) => {
    const [techStack, setTechStack] = useState('');
    const [files, setFiles] = useState<ProjectFile[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
    const [copiedFile, setCopiedFile] = useState<string | null>(null);

    useEffect(() => {
        // A simple pre-fill based on skills. This could be a Gemini call in a more advanced version.
        const skills = project.skills_to_apply.map(s => s.toLowerCase());
        if (skills.includes('react')) {
            setTechStack('React with Vite and Tailwind CSS for the frontend, and Node.js with Express for a simple backend API.');
        } else if (skills.includes('python')) {
            setTechStack('Python with Flask for the backend and a simple HTML/CSS/JS frontend.');
        } else {
            setTechStack('HTML, CSS, and vanilla JavaScript.');
        }
    }, [project]);

    const handleGenerate = async () => {
        if (!techStack) return;
        setIsLoading(true);
        setError(null);
        setFiles(null);
        setSelectedFile(null);
        try {
            const generatedFiles = await generateProjectScaffold(project, techStack);
            setFiles(generatedFiles);
            if (generatedFiles.length > 0) {
                setSelectedFile(generatedFiles.find(f => f.path.toLowerCase().includes('app') || f.path.toLowerCase().includes('index')) || generatedFiles[0]);
            }
        } catch (e) {
            setError('Failed to generate project files. The AI might be busy or the request is too complex. Please try again with a more specific tech stack.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopy = (content: string, path: string) => {
        navigator.clipboard.writeText(content);
        setCopiedFile(path);
        setTimeout(() => setCopiedFile(null), 2000);
    };

    const renderFileTree = () => {
        if (!files) return null;

        const tree: any = {};
        files.forEach(file => {
            let currentLevel = tree;
            const parts = file.path.split('/');
            parts.forEach((part, index) => {
                if (index === parts.length - 1) {
                    currentLevel[part] = file;
                } else {
                    currentLevel[part] = currentLevel[part] || {};
                    currentLevel = currentLevel[part];
                }
            });
        });

        const Tree = ({ node, pathPrefix = '' }: { node: any, pathPrefix?: string }) => (
            <ul className="pl-4">
                {Object.entries(node).sort(([a], [b]) => a.localeCompare(b)).map(([name, content]) => {
                    const currentPath = pathPrefix ? `${pathPrefix}/${name}` : name;
                    const isFile = !!(content as ProjectFile).path;
                    return (
                        <li key={name}>
                            {isFile ? (
                                <button onClick={() => setSelectedFile(content as ProjectFile)} className={`flex items-center gap-2 w-full text-left p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-700 ${selectedFile?.path === (content as ProjectFile).path ? 'bg-grape-100 dark:bg-grape-900/50' : ''}`}>
                                    <DocumentIcon className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                                    <span className="text-sm text-slate-700 dark:text-slate-300 truncate">{name}</span>
                                </button>
                            ) : (
                                <div>
                                    <div className="flex items-center gap-2 mt-2">
                                        <FolderIcon className="w-4 h-4 text-grape-500 dark:text-grape-400 flex-shrink-0" />
                                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{name}</span>
                                    </div>
                                    <Tree node={content} pathPrefix={currentPath} />
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>
        );

        return <Tree node={tree} />;
    };

    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl flex flex-col max-w-6xl w-full h-[90vh] border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <CodeBracketSquareIcon className="h-6 w-6 text-grape-500 dark:text-grape-400" />
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">AI Project Starter</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{project.project_name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white text-2xl">&times;</button>
                </div>

                <div className="flex-grow flex min-h-0">
                    {/* Left Panel: Config & File Tree */}
                    <div className="w-1/3 md:w-1/4 border-r border-slate-200 dark:border-slate-700 flex flex-col">
                        <div className="p-4 space-y-3 flex-shrink-0">
                             <label htmlFor="tech-stack" className="text-sm font-medium text-slate-700 dark:text-slate-300">Technology Stack</label>
                            <textarea id="tech-stack" value={techStack} onChange={e => setTechStack(e.target.value)} rows={3} placeholder="e.g., React with Vite, Tailwind CSS" className="w-full bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-600 rounded-md p-2 text-sm focus:ring-1 focus:ring-grape-500" />
                            <button onClick={handleGenerate} disabled={isLoading || !techStack} className="w-full flex justify-center items-center gap-2 bg-grape-600 text-white font-semibold py-2 px-3 rounded-lg hover:bg-grape-700 disabled:opacity-50">
                                {isLoading ? <><LoadingIcon className="w-5 h-5 animate-spin" /> Generating...</> : 'Generate Project Files'}
                            </button>
                        </div>
                        <div className="flex-grow overflow-y-auto p-2">
                           {files ? renderFileTree() :
                             isLoading ? null :
                             <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-500">
                                 {error ? <p className="text-red-500 dark:text-red-400">{error}</p> : 'Generated files will appear here.'}
                             </div>
                           }
                        </div>
                    </div>

                    {/* Right Panel: Code Viewer */}
                    <div className="w-2/3 md:w-3/4 flex flex-col bg-slate-50 dark:bg-slate-900/50">
                        {isLoading && <div className="flex-grow flex items-center justify-center"><LoadingIcon className="w-10 h-10 animate-spin text-grape-500 dark:text-grape-400" /></div>}
                        {selectedFile && (
                            <>
                                <div className="p-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800 flex-shrink-0">
                                    <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">{selectedFile.path}</p>
                                    <button onClick={() => handleCopy(selectedFile.content, selectedFile.path)} className="flex items-center gap-1.5 text-sm bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600">
                                        {copiedFile === selectedFile.path ? <CheckCircleIcon className="w-4 h-4 text-lime-500"/> : <ClipboardIcon className="w-4 h-4" />}
                                        {copiedFile === selectedFile.path ? 'Copied!' : 'Copy'}
                                    </button>
                                </div>
                                <div className="flex-grow overflow-auto">
                                    <pre className="p-4 text-sm text-slate-800 dark:text-slate-300"><code className="language-javascript">{selectedFile.content}</code></pre>
                                </div>
                            </>
                        )}
                        {!isLoading && !selectedFile && (
                            <div className="flex-grow flex items-center justify-center text-slate-500 dark:text-slate-500">
                                <p>Select a file to view its content.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectStarterModal;