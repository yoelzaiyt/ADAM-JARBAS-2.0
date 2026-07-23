import { create } from 'zustand';
import type { User, AuthToken } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, tenantId: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  initFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('jarbas_token'),
  isAuthenticated: !!localStorage.getItem('jarbas_token'),
  isLoading: false,
  error: null,

  initFromStorage: () => {
    const token = localStorage.getItem('jarbas_token');
    const userStr = localStorage.getItem('jarbas_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true });
      } catch {
        localStorage.removeItem('jarbas_token');
        localStorage.removeItem('jarbas_user');
      }
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ user: User; token: AuthToken }>('/auth/login', { email, password });
      localStorage.setItem('jarbas_token', res.token.accessToken);
      localStorage.setItem('jarbas_user', JSON.stringify(res.user));
      set({ user: res.user, token: res.token.accessToken, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  register: async (email, password, name, tenantId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post<{ user: User; token: AuthToken }>('/auth/register', { email, password, name, tenantId });
      localStorage.setItem('jarbas_token', res.token.accessToken);
      localStorage.setItem('jarbas_user', JSON.stringify(res.user));
      set({ user: res.user, token: res.token.accessToken, isAuthenticated: true, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('jarbas_token');
    localStorage.removeItem('jarbas_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
