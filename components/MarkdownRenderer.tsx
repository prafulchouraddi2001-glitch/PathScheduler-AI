import React, { useEffect, useMemo, useState } from 'react';

// Make sure the global 'marked' variable is declared if you're using a CDN
declare global {
    interface Window {
        marked: any;
    }
}

interface MarkdownRendererProps {
    content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const [isMarkedLoaded, setIsMarkedLoaded] = useState(typeof window.marked === 'function');

    useEffect(() => {
        // This effect handles the case where the component mounts before the script has loaded.
        if (!isMarkedLoaded) {
            const interval = setInterval(() => {
                if (typeof window.marked === 'function') {
                    setIsMarkedLoaded(true);
                    clearInterval(interval);
                }
            }, 100); // Check every 100ms for the library
            
            // Set a timeout to stop checking after a few seconds to avoid infinite loops if the CDN fails
            const timeout = setTimeout(() => {
                clearInterval(interval);
            }, 3000);

            return () => {
                clearInterval(interval);
                clearTimeout(timeout);
            };
        }
    }, [isMarkedLoaded]);

    const sanitizedHtml = useMemo(() => {
        if (isMarkedLoaded) {
            // Basic sanitation could be done here if needed, but for now we trust the source.
            // For production apps with user input, a more robust sanitizer like DOMPurify is essential.
            return window.marked.parse(content);
        }
        // Fallback for when marked is not available
        return `<p>${content.replace(/\n/g, '<br>')}</p>`;
    }, [content, isMarkedLoaded]);

    return (
        <div
            className="prose prose-sm prose-slate dark:prose-invert max-w-none 
                       prose-headings:font-semibold prose-h1:text-xl prose-h2:text-lg prose-h3:text-base
                       prose-a:text-grape-600 dark:prose-a:text-grape-400 hover:prose-a:underline
                       prose-code:bg-slate-200 dark:prose-code:bg-slate-900 prose-code:p-1 prose-code:rounded
                       prose-pre:bg-slate-200 dark:prose-pre:bg-slate-900 prose-pre:p-3 prose-pre:rounded-md"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
        />
    );
};

export default MarkdownRenderer;
