import { create } from 'zustand';
import type { User } from '../types';
import { supabase } from '../services/supabaseClient';
import type { Session } from '@supabase/supabase-js';

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

function toUser(session: Session): User {
  const { user: supaUser } = session;
  return {
    id: supaUser.id,
    email: supaUser.email ?? '',
    name: (supaUser.user_metadata?.name as string) || supaUser.email?.split('@')[0] || 'Usuário',
    tenantId: (supaUser.user_metadata?.tenantId as string) || 'default',
    role: 'admin',
    createdAt: supaUser.created_at,
  };
}

export const useAuthStore = create<AuthState>((set) => {
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      set({ user: toUser(session), token: session.access_token, isAuthenticated: true });
    } else {
      set({ user: null, token: null, isAuthenticated: false });
    }
  });

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    initFromStorage: () => {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session) {
          set({ user: toUser(data.session), token: data.session.access_token, isAuthenticated: true });
        }
      });
    },

    login: async (email, password) => {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error || !data.session) {
        set({ error: error?.message || 'Credenciais inválidas', isLoading: false });
        throw error || new Error('Credenciais inválidas');
      }
      set({ user: toUser(data.session), token: data.session.access_token, isAuthenticated: true, isLoading: false });
    },

    register: async (email, password, name, tenantId) => {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, tenantId } },
      });
      if (error) {
        set({ error: error.message, isLoading: false });
        throw error;
      }
      if (!data.session) {
        set({
          isLoading: false,
          error: 'Conta criada! Verifique seu email para confirmar antes de entrar.',
        });
        return;
      }
      set({ user: toUser(data.session), token: data.session.access_token, isAuthenticated: true, isLoading: false });
    },

    logout: () => {
      supabase.auth.signOut();
      set({ user: null, token: null, isAuthenticated: false });
    },

    clearError: () => set({ error: null }),
  };
});
