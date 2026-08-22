import { useAuthStore } from '@/auth/store/auth.store';
import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router';
import LoadingPage from '../shared/LoadingPage';

export const AuthenticatedRoute = ({ children }: PropsWithChildren) => {
  const { authStatus } = useAuthStore();
  if (authStatus === 'checking') return <LoadingPage />;
  if (authStatus === 'not-authenticated') return <Navigate to="/login" />;
  return children;
};

export const NotAuthenticatedRoute = ({ children }: PropsWithChildren) => {
  const { authStatus } = useAuthStore();
  if (authStatus === 'checking') return <LoadingPage />;
  if (authStatus === 'authenticated') return <Navigate to="/" />;
  return children;
};
