import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { type AppContextState, type Action, type AdaptiveLearningPath, LearningStyle } from '../types';

const initialState: AppContextState = {
    learningPath: null,
    modalState: { type: 'none' },
    offlineContent: {},
    downloadingWeeks: new Set(),
    userInputs: {
        jd: '',
        resumeSummary: '',
        ucs: 'Python: Intermediate, Java: Advanced, SQL: Beginner, AWS: None, Communication: Intermediate',
        dsc: 2,
        uls: LearningStyle.Visual,
    },
    user: null,
    resumeBuilderPoints: [],
};

const AppContext = createContext<{ state: AppContextState; dispatch: React.Dispatch<Action> }>({
    state: initialState,
    dispatch: () => null,
});

const appReducer = (state: AppContextState, action: Action): AppContextState => {
    switch (action.type) {
        case 'SET_USER':
            // When user logs in, load their resume points from localStorage
            if (action.payload) {
                const savedPoints = localStorage.getItem(`resumePoints_${action.payload.id}`);
                return { 
                    ...state, 
                    user: action.payload,
                    resumeBuilderPoints: savedPoints ? JSON.parse(savedPoints) : [],
                };
            }
            // Clear points on logout
            return { ...state, user: null, resumeBuilderPoints: [] };
        case 'SET_LEARNING_PATH': {
             if (state.user) {
                if (action.payload) {
                    localStorage.setItem(`learningPath_${state.user.id}`, JSON.stringify(action.payload));
                    localStorage.setItem(`userInputs_${state.user.id}`, JSON.stringify(state.userInputs));
                } else {
                    localStorage.removeItem(`learningPath_${state.user.id}`);
                    localStorage.removeItem(`userInputs_${state.user.id}`);
                }
            }
            return { ...state, learningPath: action.payload };
        }
        case 'COMPLETE_MODULE': {
            if (!state.learningPath) return state;
            const newPath = JSON.parse(JSON.stringify(state.learningPath));
            newPath.weekly_schedule[action.payload.weekIdx].modules[action.payload.modIdx].completed = action.payload.completed;
            if (state.user) {
                localStorage.setItem(`learningPath_${state.user.id}`, JSON.stringify(newPath));
            }
            return { ...state, learningPath: newPath };
        }
        case 'DELETE_MODULE': {
            if (!state.learningPath) return state;
            const newPath = JSON.parse(JSON.stringify(state.learningPath));
            newPath.weekly_schedule[action.payload.weekIdx].modules.splice(action.payload.modIdx, 1);
            if (state.user) {
                localStorage.setItem(`learningPath_${state.user.id}`, JSON.stringify(newPath));
            }
            return { ...state, learningPath: newPath };
        }
        case 'ADD_MODULE': {
            if (!state.learningPath) return state;
            const newPath = JSON.parse(JSON.stringify(state.learningPath));
            newPath.weekly_schedule[action.payload.weekIdx].modules.push(action.payload.module);
            if (state.user) {
                localStorage.setItem(`learningPath_${state.user.id}`, JSON.stringify(newPath));
            }
            return { ...state, learningPath: newPath };
        }
        case 'REORDER_MODULES': {
             if (!state.learningPath) return state;
            const { source, destination } = action.payload;
            const newPath = JSON.parse(JSON.stringify(state.learningPath));
            const sourceWeekModules = newPath.weekly_schedule[source.weekIdx].modules;
            const [draggedItem] = sourceWeekModules.splice(source.modIdx, 1);
            const destWeekModules = newPath.weekly_schedule[destination.weekIdx].modules;
            destWeekModules.splice(destination.modIdx, 0, draggedItem);
            if (state.user) {
                localStorage.setItem(`learningPath_${state.user.id}`, JSON.stringify(newPath));
            }
            return { ...state, learningPath: newPath };
        }
        case 'OPEN_MODAL':
            return { ...state, modalState: action.payload };
        case 'CLOSE_MODAL':
            return { ...state, modalState: { type: 'none' } };
        case 'SET_OFFLINE_CONTENT': {
            localStorage.setItem('offlineContent', JSON.stringify(action.payload));
            return { ...state, offlineContent: action.payload };
        }
        case 'ADD_DOWNLOADING_WEEK':
            return { ...state, downloadingWeeks: new Set(state.downloadingWeeks).add(action.payload) };
        case 'REMOVE_DOWNLOADING_WEEK': {
            const newSet = new Set(state.downloadingWeeks);
            newSet.delete(action.payload);
            return { ...state, downloadingWeeks: newSet };
        }
        case 'SET_USER_INPUTS':
            return { ...state, userInputs: { ...state.userInputs, ...action.payload } };
        
        case 'ADD_RESUME_POINT': {
            const newPoint = { id: `rp_${Date.now()}`, content: action.payload };
            const newPoints = [...state.resumeBuilderPoints, newPoint];
            if (state.user) {
                localStorage.setItem(`resumePoints_${state.user.id}`, JSON.stringify(newPoints));
            }
            return { ...state, resumeBuilderPoints: newPoints };
        }
        case 'UPDATE_RESUME_POINT': {
            const newPoints = state.resumeBuilderPoints.map(p => p.id === action.payload.id ? { ...p, content: action.payload.content } : p);
            if (state.user) {
                localStorage.setItem(`resumePoints_${state.user.id}`, JSON.stringify(newPoints));
            }
            return { ...state, resumeBuilderPoints: newPoints };
        }
        case 'DELETE_RESUME_POINT': {
            const newPoints = state.resumeBuilderPoints.filter(p => p.id !== action.payload);
            if (state.user) {
                localStorage.setItem(`resumePoints_${state.user.id}`, JSON.stringify(newPoints));
            }
            return { ...state, resumeBuilderPoints: newPoints };
        }
        case 'SAVE_VIDEO_URL': {
            if (!state.learningPath) return state;
            const { weekIdx, modIdx, videoUrl } = action.payload;
            const newPath = JSON.parse(JSON.stringify(state.learningPath));
            newPath.weekly_schedule[weekIdx].modules[modIdx].cachedVideoUrl = videoUrl;
            if (state.user) {
                localStorage.setItem(`learningPath_${state.user.id}`, JSON.stringify(newPath));
            }
            return { ...state, learningPath: newPath };
        }
        default:
            return state;
    }
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(appReducer, initialState);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => useContext(AppContext);