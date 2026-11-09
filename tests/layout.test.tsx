import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

import { useAuthStore } from "@/auth/store/auth.store";
import { AuthenticatedRoute } from "@/components/routes/ProtectedRoutes";
import UsersLayout from "@/users/layout/UsersLayout";
import HomePage from "@/users/pages/HomePage";
import { ADMIN, loginAs, renderWithRouter, resetTestState, route } from "./test-utils";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const routes = [
  {
    path: "/",
    element: <AuthenticatedRoute><UsersLayout /></AuthenticatedRoute>,
    children: [
      { index: true, element: <HomePage /> },
      { path: "users", element: <p>Listado de usuarios</p> },
      { path: "new-user", element: <p>Formulario de creación</p> },
    ],
  },
  route("/login", <p>Pantalla de login</p>),
];

describe("Inicio y navegación del panel", () => {

  beforeEach(() => {
    resetTestState();
    loginAs();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test.each([
    [9, "Buenos días"],
    [15, "Buenas tardes"],
    [21, "Buenas noches"],
  ])("CP-ADW-53 A las %i:00 el inicio saluda con '%s' y el nombre del administrador", (hour, greeting) => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(2026, 9, 27, hour, 0, 0));

    renderWithRouter(routes, "/");

    expect(screen.getByText(greeting)).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1, name: ADMIN.name })).toBeTruthy();
  });

  test.each([
    ["Gestionar usuarios", "/users", "Listado de usuarios"],
    ["Crear usuario", "/new-user", "Formulario de creación"],
  ])("CP-ADW-54 El acceso directo '%s' lleva a %s", async (title, path, content) => {
    const { router } = renderWithRouter(routes, "/");

    fireEvent.click(screen.getByRole("link", { name: new RegExp(title) }));

    expect(await screen.findByText(content)).toBeTruthy();
    expect(router.state.location.pathname).toBe(path);
  });

  test("CP-ADW-55 La cabecera muestra al administrador y el enlace a Usuarios", async () => {
    const { router } = renderWithRouter(routes, "/");

    expect(screen.getAllByText(ADMIN.name).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("link", { name: "Usuarios" }));

    await waitFor(() => expect(router.state.location.pathname).toBe("/users"));
  });

  test("CP-ADW-56 Cerrar sesión desde la cabecera vuelve al login", async () => {
    const { router } = renderWithRouter(routes, "/users");

    fireEvent.click(screen.getByRole("button", { name: "Cerrar sesión" }));

    expect(await screen.findByText("Pantalla de login")).toBeTruthy();
    expect(router.state.location.pathname).toBe("/login");
    expect(localStorage.getItem("token")).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
  });

});
