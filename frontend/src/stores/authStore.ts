import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authService } from '../services/authService';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; full_name: string; phone?: string }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.login({ email, password });
          set({
            user: res.user,
            token: res.access_token,
            isAuthenticated: true,
            isAdmin: res.user.role === 'admin',
            isLoading: false,
            error: null,
          });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Login failed' });
          throw err;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const res = await authService.register(data);
          set({
            user: res.user,
            token: res.access_token,
            isAuthenticated: true,
            isAdmin: res.user.role === 'admin',
            isLoading: false,
            error: null,
          });
        } catch (err: any) {
          set({ isLoading: false, error: err.message || 'Registration failed' });
          throw err;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isAdmin: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      setUser: (user: User) => set({ user, isAdmin: user.role === 'admin' }),
    }),
    {
      name: 'bowls_auth_storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin,
      }),
    }
  )
);
