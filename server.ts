// This is a new file: server.ts
// To run this backend, you would typically use a command like `ts-node server.ts`
// For this environment, we assume it's run automatically.
// NOTE: This is a simplified backend for demonstration. A production backend
// would use a more robust database (like PostgreSQL or MongoDB) and error handling.

import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
// FIX: Removed RECALIBRATION_SYSTEM_PROMPT as it's not exported from constants.ts.
import { SYSTEM_PROMPT } from './constants'; // Assuming constants are accessible
import { 
    responseSchema,
    quizSchema,
    linkedInOptimizationSchema,
    projectScaffoldSchema,
    seedMessagesSchema,
    codeChallengeSchema,
    codeFeedbackSchema,
    jobFitAnalysisSchema
} from './schemas'; // We'll move schemas to a separate file for cleanliness

const app = express();
const PORT = 3000;
// FIX: Replaced `__dirname` which is not available in all module systems with `path.resolve` to get path from current working directory.
const DB_PATH = path.resolve('db.json');
const JWT_SECRET = 'your-super-secret-jwt-key-change-this'; // In production, use environment variables

// Setup Gemini Client on Server
if (!process.env.API_KEY) {
    console.error("FATAL ERROR: API_KEY environment variable is not set.");
    // In a real app, you would exit here. process.exit(1);
}
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// --- Database Helpers ---
interface Database {
    users: any;
    learningPaths: any;
    resumePoints: any;
}

const readDb = (): Database => {
    if (!fs.existsSync(DB_PATH)) {
        return { users: {}, learningPaths: {}, resumePoints: {} };
    }
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
};

const writeDb = (data: Database) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

// --- Middleware ---
app.use(cors());
app.use(bodyParser.json());

const authMiddleware = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Authentication token required.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token.' });
    }
};


// --- Auth Routes ---
app.post('/api/auth/signup', async (req, res) => {
    const { email, password, username } = req.body;
    if (!email || !password || !username) {
        return res.status(400).json({ message: 'Email, password, and username are required.' });
    }

    const db = readDb();
    if (Object.values(db.users).some((u: any) => u.email === email)) {
        return res.status(409).json({ message: 'User with this email already exists.' });
    }
    if (Object.values(db.users).some((u: any) => u.username.toLowerCase() === username.toLowerCase())) {
        return res.status(409).json({ message: 'This username is already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = `user_${Date.now()}`;
    const newUser = { id: userId, email, username, password: hashedPassword };
    db.users[userId] = newUser;
    writeDb(db);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ user: { id: newUser.id, email: newUser.email, username: newUser.username }, token });
});

app.post('/api/auth/login', async (req, res) => {
    const { loginIdentifier, password } = req.body;
    const db = readDb();
    const identifier = loginIdentifier.toLowerCase();
    // FIX: Added 'any' type to existingUser to resolve property access errors.
    const existingUser: any = Object.values(db.users).find((u: any) => 
        u.email.toLowerCase() === identifier || u.username.toLowerCase() === identifier
    );

    if (!existingUser || !(await bcrypt.compare(password, existingUser.password))) {
        return res.status(401).json({ message: 'Invalid credentials. Please check your details and try again.' });
    }

    const userPayload = { id: existingUser.id, email: existingUser.email, username: existingUser.username };
    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user: userPayload, token });
});

app.post('/api/auth/verify', authMiddleware, (req: any, res) => {
    const db = readDb();
    const user = db.users[req.user.id];
    if (!user) return res.status(404).json({ message: "User not found." });
    
    const learningPath = db.learningPaths[req.user.id];
    const resumePoints = db.resumePoints[req.user.id] || [];
    
    res.json({
        user: { id: user.id, email: user.email, username: user.username },
        learningPath,
        resumePoints
    });
});

// --- Gemini API Proxy Routes (Protected) ---
app.post('/api/gemini/generate-path', authMiddleware, async (req: any, res) => {
    try {
        const { jd, ucs, dsc, uls, resumeSummary } = req.body;
        const userPrompt = `
            TARGET JOB DESCRIPTION (JD): ${jd}
            USER'S CURRENT SKILL SET (UCS): ${ucs}
            USER'S DAILY STUDY COMMITMENT (DSC in hours per day): ${dsc}
            USER'S LEARNING STYLE (ULS): ${uls}
            USER'S RESUME/PROFILE SUMMARY (Optional): ${resumeSummary || 'Not provided.'}
        `;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: userPrompt,
            config: {
                systemInstruction: SYSTEM_PROMPT,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.5,
            }
        });

        const path = JSON.parse(response.text.trim());
        
        // Save the generated path to the DB
        const db = readDb();
        db.learningPaths[req.user.id] = path;
        writeDb(db);
        
        res.json(path);
    } catch (error) {
        console.error("[SERVER] Error generating path:", error);
        res.status(500).json({ message: "Failed to generate learning path from Gemini API." });
    }
});

// Example of another proxied endpoint
app.post('/api/gemini/generate-quiz', authMiddleware, async (req, res) => {
    try {
        const { skillFocus, questionCount } = req.body;
        const systemInstruction = `You are an AI Quiz Generator...`; // Simplified for brevity
        const prompt = `Generate a quiz with ${questionCount} questions on "${skillFocus}".`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: quizSchema,
            }
        });

        res.json(JSON.parse(response.text.trim()));
    } catch (error) {
        console.error("[SERVER] Error generating quiz:", error);
        res.status(500).json({ message: "Failed to generate quiz from Gemini API." });
    }
});

// Add other Gemini endpoints here following the same pattern...
// (generateResumeBulletPoint, getInterviewResponse, getTutorResponse, etc.)

// This is just a placeholder to get the server running.
// In a real environment, you'd have a build process for the frontend.
app.get('/', (req, res) => {
  res.send('PathScheduler AI Backend is running.');
});

// In a real app, you would not listen here but let the environment handle it.
// This is for demonstration in this self-contained environment.
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

// Note: For this environment, we don't call app.listen as the execution environment handles it.
// We also need to move the schemas out to a separate file to keep this clean.
// This example is simplified for brevity. A full implementation would proxy all Gemini calls.