import type { UserAuthResponse } from './../../auth/interfaces/UserAuthResponse.interface';
import { create } from 'zustand';

import { loginAction } from '../actions/login.action';
import { checkAuthAction } from '../actions/check-auth.action';
import axios from 'axios';
import { handleError, registerUnauthorizedHandler } from '@/api/mindsave.backend';
import { queryClient } from '@/lib/queryClient';

type AuthStatus = 'authenticated' | 'not-authenticated' | 'checking';

type AuthState = {
  user: UserAuthResponse | null;
  token: string | null;
  authStatus: AuthStatus;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuthStatus: () => Promise<boolean>;
};

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  token: null,
  authStatus: 'checking',

  login: async (email: string, password: string) => {
    try {
      const data = await loginAction(email, password);
      if (data.role !== "PROFESIONAL_ROL") return false;
      queryClient.clear();
      const user = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role
      };
      localStorage.setItem('token', data.token);
      set({ user: user, token: data.token, authStatus: 'authenticated' });
      return true;
    } catch (error) {
      localStorage.removeItem('token');
      queryClient.clear();
      set({ user: null, token: null, authStatus: 'not-authenticated' });
      return handleError(error);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    queryClient.clear();
    set({ user: null, token: null, authStatus: 'not-authenticated' });
  },

  checkAuthStatus: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({
        user: null,
        token: null,
        authStatus: 'not-authenticated',
      });
      return false;
    }

    try {
      const data = await checkAuthAction();
      if (data.role !== "PROFESIONAL_ROL") {
        localStorage.removeItem('token');
        queryClient.clear();
        set({
          user: null,
          token: null,
          authStatus: 'not-authenticated',
        });
        return false;
      }

      const user = {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role
      };
      set({
        user: user,
        token: data.token,
        authStatus: 'authenticated',
      });
      return true;
    } catch (error) {
      const cause = error instanceof Error && error.cause ? error.cause : error;
      const isAuthError =
        (axios.isAxiosError(cause) && (cause.response?.status === 401 || cause.response?.status === 403)) ||
        (error instanceof Error && (error.message === 'Token expired or not valid' || error.message === 'No token found'));

      if (isAuthError) {
        localStorage.removeItem('token');
        queryClient.clear();
        set({
          user: null,
          token: null,
          authStatus: 'not-authenticated',
        });
        return false;
      }

      // Si es un error de conectividad o del servidor, no destruimos la sesión ni borramos el token
      if (get().authStatus === 'checking') {
        set({
          authStatus: 'not-authenticated',
        });
      }
      return false;
    }
  },
}));

registerUnauthorizedHandler(() => {
  useAuthStore.getState().logout();
});

