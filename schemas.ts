import { Type } from "@google/genai";

export const microlearningModuleSchema = {
    type: Type.OBJECT,
    properties: {
        module_name: { type: Type.STRING },
        concept: { type: Type.STRING },
        duration_minutes: { type: Type.INTEGER },
        module_type: { type: Type.STRING },
        path_points_reward: { type: Type.INTEGER },
        resource_url: { type: Type.STRING, description: "A valid, public URL to a high-quality learning resource." },
        resource_type: { type: Type.STRING, description: "Can be 'Video', 'Article', 'Documentation', or 'Interactive Lab'." },
        suggested_project: { type: Type.STRING, description: "A brief project idea for Sandbox_Lab modules.", nullable: true },
        completed: { type: Type.BOOLEAN, nullable: true },
    },
    required: ['module_name', 'concept', 'duration_minutes', 'module_type', 'path_points_reward', 'resource_url', 'resource_type'],
};

export const checkpointQuizSchema = {
    type: Type.OBJECT,
    properties: {
        skill_focus: { type: Type.STRING },
        quiz_format: { type: Type.STRING },
        question_count: { type: Type.INTEGER },
    },
    required: ['skill_focus', 'quiz_format', 'question_count'],
};

export const capstoneProjectSchema = {
    type: Type.OBJECT,
    properties: {
        project_name: { type: Type.STRING },
        description: { type: Type.STRING, description: "A detailed description of the project requirements and goals." },
        skills_to_apply: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
        },
        scheduled_for_week_end: { type: Type.INTEGER, description: "The week number this project should appear after." },
    },
    required: ['project_name', 'description', 'skills_to_apply', 'scheduled_for_week_end'],
};

export const responseSchema = {
  type: Type.OBJECT,
  properties: {
    total_estimated_weeks_to_ready: {
      type: Type.INTEGER,
      description: "Total number of weeks to complete the learning path.",
    },
    skill_gap_analysis: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          skill: { type: Type.STRING },
          current_proficiency: { type: Type.STRING },
          required_proficiency: { type: Type.STRING },
          priority_level: { type: Type.INTEGER },
          hours_to_mastery: { type: Type.INTEGER },
        },
        required: ['skill', 'current_proficiency', 'required_proficiency', 'priority_level', 'hours_to_mastery'],
      },
    },
    weekly_schedule: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.INTEGER },
          modules: {
            type: Type.ARRAY,
            items: microlearningModuleSchema,
          },
          checkpoint_quiz: { ...checkpointQuizSchema, nullable: true },
        },
        required: ['week', 'modules'],
      },
    },
    forgetting_curve_review_quiz: {
      type: Type.OBJECT,
      properties: {
        scheduled_for_week: { type: Type.INTEGER },
        skill_focus: { type: Type.STRING },
        quiz_format: { type: Type.STRING },
      },
      required: ['scheduled_for_week', 'skill_focus', 'quiz_format'],
    },
    ai_interview_simulation: {
      type: Type.OBJECT,
      properties: {
        scheduled_for_week: { type: Type.INTEGER },
        skill_focus: { type: Type.STRING },
        simulation_format: { type: Type.STRING },
      },
      required: ['scheduled_for_week', 'skill_focus', 'simulation_format'],
    },
    capstone_projects: {
        type: Type.ARRAY,
        items: capstoneProjectSchema,
        nullable: true,
    },
  },
  required: ['total_estimated_weeks_to_ready', 'skill_gap_analysis', 'weekly_schedule', 'forgetting_curve_review_quiz', 'ai_interview_simulation'],
};

export const quizQuestionSchema = {
    type: Type.OBJECT,
    properties: {
        question: { type: Type.STRING },
        options: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            minItems: 4,
            maxItems: 4,
        },
        correct_answer_index: { type: Type.INTEGER },
        explanation: { type: Type.STRING, description: "A brief explanation for why the correct answer is right." },
    },
    required: ['question', 'options', 'correct_answer_index', 'explanation'],
};

export const quizSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            items: quizQuestionSchema,
        },
    },
    required: ['questions'],
};

export const linkedInOptimizationSchema = {
    type: Type.OBJECT,
    properties: {
        profile_summary: { type: Type.STRING, description: "A new, keyword-rich 'About' summary for a LinkedIn profile." },
        suggested_skills: { type: Type.ARRAY, items: { type: Type.STRING }, description: "A list of 5-10 high-impact skills to add." },
        experience_bullet_points: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 example action-oriented bullet points for an experience section related to projects or newly learned skills." },
    },
    required: ['profile_summary', 'suggested_skills', 'experience_bullet_points'],
};

export const projectFileSchema = {
    type: Type.OBJECT,
    properties: {
        path: { type: Type.STRING, description: "The full path of the file, e.g., 'src/App.tsx'." },
        content: { type: Type.STRING, description: "The complete code or content for the file." },
    },
    required: ['path', 'content'],
};

export const projectScaffoldSchema = {
    type: Type.OBJECT,
    properties: {
        files: {
            type: Type.ARRAY,
            items: projectFileSchema,
        },
    },
    required: ['files'],
};

export const discussionMessageSchema = {
    type: Type.OBJECT,
    properties: {
        authorName: { type: Type.STRING, description: "A realistic but fake name for a user in a forum, e.g., 'ReactDev22' or 'CodeWizard'." },
        content: { type: Type.STRING, description: "The text content of the message. Can be a question, an answer, or a tip related to the topic." },
    },
    required: ['authorName', 'content'],
};

export const seedMessagesSchema = {
    type: Type.OBJECT,
    properties: {
        messages: {
            type: Type.ARRAY,
            items: discussionMessageSchema,
        },
    },
    required: ['messages'],
};

export const codeChallengeSchema = {
    type: Type.OBJECT,
    properties: {
        description: { type: Type.STRING, description: "A short, clear description of the coding challenge." },
        starter_code: { type: Type.STRING, description: "Some starter code for the user to begin with." },
    },
    required: ['description', 'starter_code'],
};

export const codeFeedbackSchema = {
    type: Type.OBJECT,
    properties: {
        is_correct: { type: Type.BOOLEAN, description: "Whether the user's code correctly solves the challenge." },
        explanation: { type: Type.STRING, description: "A detailed, friendly explanation of the user's code, pointing out what's right, what's wrong, and how it could be improved." },
        corrected_code: { type: Type.STRING, description: "The corrected or an improved version of the code.", nullable: true },
    },
    required: ['is_correct', 'explanation'],
};

export const jobFitAnalysisSchema = {
    type: Type.OBJECT,
    properties: {
        skillAlignments: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of skills the user possesses that are explicitly mentioned in the job description."
        },
        skillGaps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of critical skills required by the job description that the user seems to be missing."
        },
        projectRecommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    projectName: { type: Type.STRING },
                    relevance: { type: Type.STRING, description: "A brief, one-sentence explanation of why this project is relevant to the job." }
                },
                required: ['projectName', 'relevance']
            },
            description: "A list of the user's capstone projects that are most relevant to this job application."
        }
    },
    required: ['skillAlignments', 'skillGaps', 'projectRecommendations'],
};
