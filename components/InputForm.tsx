import React from 'react';
import { LearningStyle } from '../types';
import { BriefcaseIcon, BrainIcon, CalendarIcon, StyleIcon, LoadingIcon, UserIcon } from './Icons';

interface InputFormProps {
  jd: string;
  setJd: (value: string) => void;
  ucs: string;
  setUcs: (value: string) => void;
  dsc: number;
  setDsc: (value: number) => void;
  uls: LearningStyle;
  setUls: (value: LearningStyle) => void;
  resumeSummary: string;
  setResumeSummary: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputForm: React.FC<InputFormProps> = ({
  jd,
  setJd,
  ucs,
  setUcs,
  dsc,
  setDsc,
  uls,
  setUls,
  resumeSummary,
  setResumeSummary,
  onSubmit,
  isLoading,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="jd" className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <BriefcaseIcon className="w-5 h-5" /> Target Job Description
        </label>
        <textarea
          id="jd"
          value={jd}
          onChange={(e) => setJd(e.target.value)}
          placeholder="Paste the full job description here..."
          rows={8}
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-grape-500 focus:border-grape-500 transition-colors"
        />
      </div>
       <div>
        <label htmlFor="resume" className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <UserIcon className="w-5 h-5" /> Resume/Profile Summary (Optional)
        </label>
        <textarea
          id="resume"
          value={resumeSummary}
          onChange={(e) => setResumeSummary(e.target.value)}
          placeholder="Paste a summary of your resume or profile for a more accurate analysis..."
          rows={4}
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-grape-500 focus:border-grape-500 transition-colors"
        />
      </div>
      <div>
        <label htmlFor="ucs" className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <BrainIcon className="w-5 h-5" /> Current Skills
        </label>
        <input
          type="text"
          id="ucs"
          value={ucs}
          onChange={(e) => setUcs(e.target.value)}
          placeholder="e.g., Python: Intermediate, SQL: Beginner"
          className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-grape-500 focus:border-grape-500 transition-colors"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="dsc" className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <CalendarIcon className="w-5 h-5" /> Daily Commitment ({dsc} hrs)
          </label>
          <input
            type="range"
            id="dsc"
            min="1"
            max="10"
            value={dsc}
            onChange={(e) => setDsc(parseInt(e.target.value, 10))}
            className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-grape-500"
          />
        </div>
        <div>
          <label htmlFor="uls" className="flex items-center gap-2 mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <StyleIcon className="w-5 h-5" /> Learning Style
          </label>
          <select
            id="uls"
            value={uls}
            onChange={(e) => setUls(e.target.value as LearningStyle)}
            className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-sm text-slate-900 dark:text-slate-200 focus:ring-2 focus:ring-grape-500 focus:border-grape-500 transition-colors"
          >
            {Object.values(LearningStyle).map((style) => (
              <option key={style} value={style}>{style}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 bg-grape-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-grape-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-grape-500 disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:text-slate-100 dark:disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200"
      >
        {isLoading ? (
            <>
                <LoadingIcon className="w-5 h-5 animate-spin" />
                Generating Your Path...
            </>
        ) : 'Generate Adaptive Learning Path'}
      </button>
    </div>
  );
};

export default InputForm;