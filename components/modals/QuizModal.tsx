import React, { useState, useEffect } from 'react';
import { type CheckpointQuiz, type Quiz } from '../../types';
import { generateQuiz } from '../../services/geminiService';
import { BrainIcon as QuizIcon, LoadingIcon, LightbulbIcon } from '../Icons';

interface QuizModalProps {
    quizDetails: CheckpointQuiz;
    onClose: () => void;
    initialQuizData?: Quiz;
}

const QuizModal: React.FC<QuizModalProps> = ({ quizDetails, onClose, initialQuizData }) => {
    const [quizData, setQuizData] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (initialQuizData) {
                setQuizData(initialQuizData);
                setIsLoading(false);
                return;
            }
            try {
                setIsLoading(true);
                setError(null);
                const data = await generateQuiz(quizDetails.skill_focus, quizDetails.question_count);
                setQuizData(data);
            } catch (e) {
                console.error("Failed to generate quiz", e);
                setError("Sorry, the AI couldn't generate a quiz right now. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuiz();
    }, [quizDetails, initialQuizData]);

    const handleAnswerSelect = (questionIndex: number, optionIndex: number) => {
        setUserAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
    };

    const handleSubmit = () => {
        if (Object.keys(userAnswers).length !== quizData?.questions.length) {
            alert("Please answer all questions before submitting.");
            return;
        }
        let correctAnswers = 0;
        quizData?.questions.forEach((q, idx) => {
            if (q.correct_answer_index === userAnswers[idx]) {
                correctAnswers++;
            }
        });
        setScore(correctAnswers);
        setIsSubmitted(true);
    };

    const getResultColor = () => {
        if (!quizData) return 'bg-slate-100 dark:bg-slate-800';
        const percentage = (score / quizData.questions.length) * 100;
        if (percentage >= 80) return 'bg-lime-100 dark:bg-lime-800 border-lime-300 dark:border-lime-600';
        if (percentage >= 50) return 'bg-amber-100 dark:bg-amber-800 border-amber-300 dark:border-amber-600';
        return 'bg-red-100 dark:bg-red-800 border-red-300 dark:border-red-600';
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl flex flex-col max-w-3xl w-full h-[90vh] border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <QuizIcon className="h-6 w-6 text-lime-500 dark:text-lime-400" />
                        <div>
                            <h3 className="text-lg font-medium text-slate-900 dark:text-white">Checkpoint Quiz</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Focus: {quizDetails.skill_focus}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-white text-2xl">&times;</button>
                </div>

                <div className="flex-grow p-6 overflow-y-auto">
                    {isLoading && <div className="flex justify-center items-center h-full"><LoadingIcon className="w-8 h-8 animate-spin text-grape-500 dark:text-grape-400" /></div>}
                    {error && <div className="text-center text-red-500 dark:text-red-400">{error}</div>}
                    {quizData && !isSubmitted && (
                        <div className="space-y-6">
                            {quizData.questions.map((q, qIdx) => (
                                <div key={qIdx}>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-2">{qIdx + 1}. {q.question}</p>
                                    <div className="space-y-2">
                                        {q.options.map((opt, oIdx) => (
                                            <button key={oIdx} onClick={() => handleAnswerSelect(qIdx, oIdx)}
                                                className={`w-full text-left p-3 rounded-md border text-sm transition-colors ${userAnswers[qIdx] === oIdx ? 'bg-grape-600 border-grape-500 text-white' : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'}`}>
                                                {opt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {quizData && isSubmitted && (
                        <div className="space-y-8">
                             <div className={`text-center p-4 rounded-lg border ${getResultColor()}`}>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Quiz Complete!</h3>
                                <p className="text-lg text-slate-700 dark:text-slate-300 mt-1">You scored {score} out of {quizData.questions.length}</p>
                            </div>
                            {quizData.questions.map((q, qIdx) => {
                                const isCorrect = q.correct_answer_index === userAnswers[qIdx];
                                return (
                                <div key={qIdx} className="p-4 rounded-lg bg-slate-100 dark:bg-slate-900/50 border-l-4"
                                    style={{ borderColor: isCorrect ? '#84cc16' : '#ef4444' }}>
                                    <p className="font-semibold text-slate-800 dark:text-slate-200 mb-3">{qIdx + 1}. {q.question}</p>
                                    <div className="space-y-2 mb-3">
                                        {q.options.map((opt, oIdx) => {
                                            const isCorrectOption = q.correct_answer_index === oIdx;
                                            const isUserSelected = userAnswers[qIdx] === oIdx;
                                            let styles = 'w-full text-left p-2 rounded text-sm ';
                                            if (isCorrectOption) styles += 'bg-lime-100 dark:bg-lime-900/50 text-lime-800 dark:text-lime-300';
                                            else if (isUserSelected && !isCorrect) styles += 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300 line-through';
                                            else styles += 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400';
                                            return <div key={oIdx} className={styles}>{opt}</div>;
                                        })}
                                    </div>
                                    <div className="p-3 bg-slate-200 dark:bg-slate-800 rounded-md">
                                        <p className="font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-1.5 text-sm"><LightbulbIcon className="w-4 h-4" /> Explanation</p>
                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{q.explanation}</p>
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700 flex justify-end">
                    {isSubmitted ? (
                        <button onClick={onClose} className="bg-grape-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-grape-700">Finish Review</button>
                    ) : (
                        <button onClick={handleSubmit} disabled={isLoading || !quizData} className="bg-lime-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-lime-700 disabled:opacity-50">Submit Quiz</button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default QuizModal;