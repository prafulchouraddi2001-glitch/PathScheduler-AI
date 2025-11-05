export enum LearningStyle {
    Visual = 'Visual',
    Auditory = 'Auditory',
    Kinesthetic = 'Kinesthetic',
}

export interface SkillGap {
    skill: string;
    current_proficiency: string;
    required_proficiency: string;
    priority_level: number;
    hours_to_mastery: number;
}

export interface MicrolearningModule {
    module_name: string;
    concept: string;
    duration_minutes: number;
    module_type: 'Video_Diagram' | 'Sandbox_Lab' | 'Audio_Lesson' | 'Interactive_Tutorial' | 'Reading_Material';
    path_points_reward: number;
    resource_url: string;
    resource_type: 'Video' | 'Article' | 'Documentation' | 'Interactive Lab';
    suggested_project?: string;
    completed?: boolean;
    cachedVideoUrl?: string;
}

export interface CheckpointQuiz {
    skill_focus: string;
    quiz_format: string;
    question_count: number;
}

export interface WeeklyScheduleItem {
    week: number;
    modules: MicrolearningModule[];
    checkpoint_quiz?: CheckpointQuiz;
}

export interface ForgettingCurveQuiz {
    scheduled_for_week: number;
    skill_focus: string;
    quiz_format: string;
}

export interface AIInterviewSimulation {
    scheduled_for_week: number;
    skill_focus: string;
    simulation_format: string;
}

export interface CapstoneProject {
    project_name: string;
    description: string;
    skills_to_apply: string[];
    scheduled_for_week_end: number;
}

export interface AdaptiveLearningPath {
    total_estimated_weeks_to_ready: number;
    skill_gap_analysis: SkillGap[];
    weekly_schedule: WeeklyScheduleItem[];
    forgetting_curve_review_quiz: ForgettingCurveQuiz;
    ai_interview_simulation: AIInterviewSimulation;
    capstone_projects?: CapstoneProject[];
}

export interface Badge {
    name: string;
    description: string;
    icon: string;
    keyword: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correct_answer_index: number;
    explanation: string;
}

export interface Quiz {
    questions: QuizQuestion[];
}

export interface LinkedInOptimization {
    profile_summary: string;
    suggested_skills: string[];
    experience_bullet_points: string[];
}

export interface ProjectFile {
  path: string;
  content: string;
}

export interface Blob {
  data: string;
  mimeType: string;
}

export interface OfflineWeekData {
    modules: MicrolearningModule[];
    quiz?: Quiz;
}

export interface OfflineContent {
    [weekNumber: number]: OfflineWeekData;
}

export interface DiscussionMessage {
    authorName: string;
    content: string;
    timestamp: string; // ISO string
}

export interface DiscussionChannel {
    id: string; // e.g., 'react'
    name: string; // e.g., 'React Discussions'
    description: string;
    messages: DiscussionMessage[];
}

export interface SkillConfidence {
    skill: string;
    confidence: 'Low' | 'Medium' | 'High';
}

export interface CodeChallenge {
    description: string;
    starter_code: string;
}

export interface CodeFeedback {
    is_correct: boolean;
    explanation: string;
    corrected_code?: string;
}

export interface JobFitAnalysis {
    skillAlignments: string[];
    skillGaps: string[];
    projectRecommendations: {
        projectName: string;
        relevance: string;
    }[];
}

export interface User {
  id: string;
  email: string;
  username: string;
}

export interface ResumePoint {
    id: string;
    content: string;
}

export type Theme = 'light' | 'dark' | 'system';
export type ActiveView = 'main' | 'profile' | 'settings';

// For AppContext
export type ModalType = 'none' | 'resumeHelper' | 'mockInterview' | 'quiz' | 'tutor' | 'liveTutor' | 'videoLessonPlayer' | 'completeConfirmation' | 'deleteConfirmation' | 'coverLetter' | 'linkedIn' | 'projectStarter' | 'recalibration' | 'codeLab' | 'jobCoPilot' | 'resetConfirmation' | 'resumeBuilder';

export interface ModalState {
    type: ModalType;
    data?: any;
}

export interface AppContextState {
    learningPath: AdaptiveLearningPath | null;
    modalState: ModalState;
    offlineContent: OfflineContent;
    downloadingWeeks: Set<number>;
    userInputs: {
        jd: string;
        resumeSummary: string;
        ucs: string;
        dsc: number;
        uls: LearningStyle;
    };
    user: User | null;
    resumeBuilderPoints: ResumePoint[];
}

export type Action =
    | { type: 'SET_USER'; payload: User | null }
    | { type: 'SET_LEARNING_PATH'; payload: AdaptiveLearningPath | null }
    | { type: 'COMPLETE_MODULE'; payload: { weekIdx: number; modIdx: number; completed: boolean } }
    | { type: 'DELETE_MODULE'; payload: { weekIdx: number; modIdx: number } }
    | { type: 'ADD_MODULE'; payload: { weekIdx: number; module: MicrolearningModule } }
    | { type: 'REORDER_MODULES'; payload: { source: { weekIdx: number; modIdx: number }; destination: { weekIdx: number; modIdx: number } } }
    | { type: 'OPEN_MODAL'; payload: ModalState }
    | { type: 'CLOSE_MODAL' }
    | { type: 'SET_OFFLINE_CONTENT'; payload: OfflineContent }
    | { type: 'ADD_DOWNLOADING_WEEK'; payload: number }
    | { type: 'REMOVE_DOWNLOADING_WEEK'; payload: number }
    | { type: 'SET_USER_INPUTS'; payload: Partial<AppContextState['userInputs']> }
    | { type: 'ADD_RESUME_POINT'; payload: string }
    | { type: 'UPDATE_RESUME_POINT'; payload: { id: string; content: string } }
    | { type: 'DELETE_RESUME_POINT'; payload: string }
    | { type: 'SAVE_VIDEO_URL'; payload: { weekIdx: number; modIdx: number; videoUrl: string } };

// FIX: Added AIStudio interface to centralize the type definition for window.aistudio.
export interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
}

// FIX: Added global declaration for window.aistudio to centralize the type and prevent conflicts.
declare global {
    interface Window {
        aistudio: AIStudio;
    }
}