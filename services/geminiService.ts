import { GoogleGenAI } from "@google/genai";
import { authService } from './authService';
import { 
    LearningStyle, 
    type AdaptiveLearningPath, 
    type Quiz, 
    type SkillGap, 
    type LinkedInOptimization, 
    type CapstoneProject, 
    type ProjectFile, 
    type DiscussionMessage, 
    type SkillConfidence, 
    type CodeChallenge, 
    type CodeFeedback, 
    type JobFitAnalysis 
} from "../types";

const API_URL = '/api/gemini'; // Base URL for our backend proxy

// Helper to make authenticated requests to our backend
const fetchFromBackend = async (endpoint: string, body: any) => {
    const token = authService.getCurrentToken();
    const response = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `API call to ${endpoint} failed.`);
    }
    return data;
};

// --- Functions that now call OUR backend ---

export const generateLearningPath = (
    jd: string, ucs: string, dsc: number, uls: LearningStyle, resumeSummary: string,
): Promise<AdaptiveLearningPath> => {
    return fetchFromBackend('generate-path', { jd, ucs, dsc, uls, resumeSummary });
};

export const recalibrateLearningPath = (
    currentPath: AdaptiveLearningPath, confidenceFeedback: SkillConfidence[], jd: string, ucs: string, dsc: number, uls: LearningStyle, resumeSummary: string
): Promise<AdaptiveLearningPath> => {
    return fetchFromBackend('recalibrate-path', { currentPath, confidenceFeedback, jd, ucs, dsc, uls, resumeSummary });
};

export const generateQuiz = (skillFocus: string, questionCount: number): Promise<Quiz> => {
    return fetchFromBackend('generate-quiz', { skillFocus, questionCount });
};

// ... other functions would be converted similarly ...
// For brevity, we'll stub them out as examples.
export const generateResumeBulletPoint = (moduleConcept: string): Promise<string> => fetchFromBackend('generate-resume-bullet', { moduleConcept });
export const getInterviewResponse = (interviewHistory: any[], skillFocus: string): Promise<string> => fetchFromBackend('get-interview-response', { interviewHistory, skillFocus });
export const getTutorResponse = (chatHistory: any[], moduleConcept: string): Promise<string> => fetchFromBackend('get-tutor-response', { chatHistory, moduleConcept });
export const generateCoverLetter = (jd: string, skills: SkillGap[], resumeSummary: string): Promise<string> => fetchFromBackend('generate-cover-letter', { jd, skills, resumeSummary });
export const optimizeLinkedInProfile = (jd: string, skills: SkillGap[]): Promise<LinkedInOptimization> => fetchFromBackend('optimize-linkedin', { jd, skills });
export const generateProjectScaffold = (project: CapstoneProject, techStack: string): Promise<ProjectFile[]> => fetchFromBackend('generate-scaffold', { project, techStack });
export const generateSeedMessages = (channelName: string): Promise<DiscussionMessage[]> => fetchFromBackend('generate-seed-messages', { channelName });
export const generateCodeChallenge = (moduleConcept: string): Promise<CodeChallenge> => fetchFromBackend('generate-code-challenge', { moduleConcept });
export const getCodeFeedback = (moduleConcept: string, userCode: string, challenge: string): Promise<CodeFeedback> => fetchFromBackend('get-code-feedback', { moduleConcept, userCode, challenge });
export const analyzeJobFit = (jd: string, learningPath: AdaptiveLearningPath): Promise<JobFitAnalysis> => fetchFromBackend('analyze-job-fit', { jd, learningPath });


// --- CLIENT-SIDE ONLY GEMINI FUNCTIONS ---
// These functions remain on the client because they require special, client-specific
// interactions like the Veo API key selection flow or real-time audio streaming.

export const generateVideoFromConcept = async (concept: string): Promise<string> => {
    // This function must stay on the client because it uses the window.aistudio
    // object for its special API key selection flow.
    const localAi = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

    const prompt = `Create a short, educational video explaining the concept of: "${concept}". Style: Animated explainer video.`;
    try {
        let operation = await localAi.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: '16:9'
            }
        });
        
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await localAi.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        if (!downloadLink) {
            throw new Error("Video generation completed, but no download link was provided.");
        }
        
        return `${downloadLink}&key=${process.env.API_KEY}`;
    } catch (error: any) {
        console.error("Error generating video from concept:", error);
        let errorMessage = "Failed to generate video from Gemini API.";
        if (error.message) {
            try {
                const parsedError = JSON.parse(error.message);
                errorMessage = parsedError.error?.message || error.message;
            } catch (e) {
                errorMessage = error.message;
            }
        }
        throw new Error(errorMessage);
    }
};

// Note: The generateSpeechFromText function would also be proxied through the backend in a full implementation.
// It's left here as-is for now to maintain existing functionality from before the backend refactor.
export const generateSpeechFromText = async (textToSpeak: string): Promise<string> => {
    console.warn("generateSpeechFromText is still running on the client-side.");
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
     try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-preview-tts',
            contents: [{ parts: [{ text: textToSpeak }] }],
            config: {
                responseModalities: ['AUDIO' as any],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) throw new Error("API did not return audio data.");
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech from text:", error);
        throw new Error("Failed to generate speech from Gemini API.");
    }
};
