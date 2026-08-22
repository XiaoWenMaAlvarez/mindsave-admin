import type { UserAuthResponse } from './../../auth/interfaces/UserAuthResponse.interface';
import { create } from 'zustand';

import { loginAction } from '../actions/login.action';
import { checkAuthAction } from '../actions/check-auth.action';
import { handleError } from '@/api/mindsave.backend';

type AuthStatus = 'authenticated' | 'not-authenticated' | 'checking';

type AuthState = {
  user: UserAuthResponse | null;
  token: string | null;
  authStatus: AuthStatus;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  token: null,
  authStatus: 'checking',

  login: async (email: string, password: string) => {
    try {
      const data = await loginAction(email, password);
      if (data.role !== "PROFESIONAL_ROL") return false;
      const user = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role
      }
      localStorage.setItem('token', data.token);
      set({ user: user, token: data.token, authStatus: 'authenticated' });
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      set({ user: null, token: null, authStatus: 'not-authenticated' });
      handleError(error);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, authStatus: 'not-authenticated' });
  },

  checkAuthStatus: async () => {
    try {
      const data = await checkAuthAction();
      const user = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role
      }
      set({
        user: user,
        token: data.token,
        authStatus: 'authenticated',
      });
      return true;
    } catch {
      set({
        user: null,
        token: null,
        authStatus: 'not-authenticated',
      });
      return false;
    }
  },
}));
