import { User } from '../types';

// This service now makes API calls to a secure backend.
const API_URL = '/api/auth'; // Using a relative URL for same-origin requests
const SESSION_TOKEN_KEY = 'pathscheduler_session_token';

export const authService = {
  signup: async (email: string, password: string, username: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, username }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Signup failed.');
    }
    localStorage.setItem(SESSION_TOKEN_KEY, data.token);
    return data;
  },

  login: async (loginIdentifier: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginIdentifier, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed.');
    }
    localStorage.setItem(SESSION_TOKEN_KEY, data.token);
    return data;
  },

  logout: (): void => {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  },

  getCurrentToken: (): string | null => {
    return localStorage.getItem(SESSION_TOKEN_KEY);
  },
  
  verifySession: async (): Promise<{ user: User; learningPath: any; resumePoints: any; } | null> => {
    const token = authService.getCurrentToken();
    if (!token) return null;

    try {
        const response = await fetch(`${API_URL}/verify`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            authService.logout(); // Token is invalid or expired
            return null;
        }
        return await response.json();
    } catch (e) {
        console.error("Verification failed", e);
        return null;
    }
  },

  updateUser: async (updates: { username?: string; newPassword?: string; oldPassword?: string }): Promise<User> => {
     const token = authService.getCurrentToken();
     if (!token) throw new Error("Not authenticated");

     // In a real app, this would be a PATCH to /api/users/me or similar
     // For this simple backend, we'll just use a generic update endpoint.
     // This is a placeholder; a full implementation requires more backend routes.
     // For now, we'll keep the mock logic but add a note.
     console.warn("authService.updateUser is still mocked and does not call a backend endpoint.");
     return new Promise((resolve) => setTimeout(() => resolve({id: '1', email: 'test@test.com', username: updates.username || 'test'}), 500));
  }
};
