import type { ReactNode } from "react";
import { render } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider, type RouteObject } from "react-router";
import MockAdapter from "axios-mock-adapter";
import { vi } from "vitest";

import { mindsaveAPI } from "@/api/mindsave.backend";
import { useAuthStore } from "@/auth/store/auth.store";
import { queryClient } from "@/lib/queryClient";
import type { UserResponse } from "@/users/interfaces/UserResponse.interface";

// Intercepta las peticiones del cliente HTTP real del panel.
export const mockApi = new MockAdapter(mindsaveAPI);

export const ADMIN = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "admin@mindsave.cl",
  name: "Admin Principal",
  role: "PROFESIONAL_ROL" as const,
};

export const buildUser = (overrides: Partial<UserResponse> = {}): UserResponse => ({
  id: "22222222-2222-4222-8222-222222222222",
  email: "paciente@mindsave.test",
  name: "Paciente Prueba",
  password: "",
  emailVerified: true,
  role: "USER_ROL",
  isActive: true,
  ...overrides,
});

export const resetTestState = () => {
  mockApi.reset();
  queryClient.clear();
  // Sin reintentos para que los estados de error se muestren de inmediato en las pruebas.
  queryClient.setDefaultOptions({ queries: { retry: false } });
  localStorage.clear();
  useAuthStore.setState({ user: null, token: null, authStatus: "checking" });
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
};

export const loginAs = (user: typeof ADMIN = ADMIN) => {
  localStorage.setItem("token", "token-admin");
  useAuthStore.setState({ user, token: "token-admin", authStatus: "authenticated" });
};

export const renderWithRouter = (routes: RouteObject[], initialEntry: string) => {
  const router = createMemoryRouter(routes, { initialEntries: [initialEntry] });
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return { router, ...view };
};

export const route = (path: string, element: ReactNode): RouteObject => ({ path, element });

export const currentSearch = (router: ReturnType<typeof createMemoryRouter>) =>
  new URLSearchParams(router.state.location.search);
