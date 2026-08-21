import { useAuthStore } from '@/auth/store/auth.store';
import type { PropsWithChildren } from 'react';
import { Navigate } from 'react-router';

//TODO: Agregar un componente de carga
export const AuthenticatedRoute = ({ children }: PropsWithChildren) => {
  const { authStatus } = useAuthStore();
  if (authStatus === 'checking') return <h1>Cargando...</h1>;
  if (authStatus === 'not-authenticated') return <Navigate to="/login" />;
  return children;
};

export const NotAuthenticatedRoute = ({ children }: PropsWithChildren) => {
  const { authStatus } = useAuthStore();
  if (authStatus === 'checking') return <h1>Cargando...</h1>;
  if (authStatus === 'authenticated') return <Navigate to="/" />;
  return children;
};
