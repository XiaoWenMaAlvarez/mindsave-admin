import { beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";

import { mindsaveAPI } from "@/api/mindsave.backend";
import { LoginPage } from "@/auth/pages/LoginPage";
import { useAuthStore } from "@/auth/store/auth.store";
import { AuthenticatedRoute, NotAuthenticatedRoute } from "@/components/routes/ProtectedRoutes";
import { ADMIN, loginAs, mockApi, renderWithRouter, resetTestState, route } from "./test-utils";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const loginResponse = (role = "PROFESIONAL_ROL") => ({ ...ADMIN, role, token: "token-nuevo" });

describe("Autenticación del panel", () => {

  beforeEach(() => {
    resetTestState();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  describe("Store de sesión", () => {

    test("CP-ADW-01 Iniciar sesión con una cuenta PROFESIONAL_ROL guarda el token y autentica", async () => {
      mockApi.onPost("/auth/login").reply(200, loginResponse());

      const ok = await useAuthStore.getState().login(ADMIN.email, "Prueba123");

      expect(ok).toBe(true);
      expect(localStorage.getItem("token")).toBe("token-nuevo");
      expect(useAuthStore.getState()).toMatchObject({ authStatus: "authenticated", user: ADMIN });
      expect(JSON.parse(mockApi.history.post[0].data)).toEqual({ email: ADMIN.email, password: "Prueba123" });
    });

    test("CP-ADW-02 Una respuesta con rol USER_ROL no abre sesión", async () => {
      mockApi.onPost("/auth/login").reply(200, loginResponse("USER_ROL"));

      const ok = await useAuthStore.getState().login(ADMIN.email, "Prueba123");

      expect(ok).toBe(false);
      expect(localStorage.getItem("token")).toBeNull();
      expect(useAuthStore.getState().authStatus).not.toBe("authenticated");
    });

    test("CP-ADW-03 Un error de login propaga el mensaje del backend y limpia la sesión", async () => {
      localStorage.setItem("token", "viejo");
      mockApi.onPost("/auth/login").reply(400, { error: "Invalid password" });

      await expect(useAuthStore.getState().login(ADMIN.email, "mala")).rejects.toThrow("Invalid password");
      expect(localStorage.getItem("token")).toBeNull();
      expect(useAuthStore.getState().authStatus).toBe("not-authenticated");
    });

    test("CP-ADW-04 Sin token guardado la revalidación deja la sesión cerrada sin llamar al backend", async () => {
      const ok = await useAuthStore.getState().checkAuthStatus();

      expect(ok).toBe(false);
      expect(useAuthStore.getState().authStatus).toBe("not-authenticated");
      expect(mockApi.history.get).toHaveLength(0);
    });

    test("CP-ADW-05 La revalidación exitosa renueva el token", async () => {
      localStorage.setItem("token", "token-viejo");
      mockApi.onGet("/auth/check-status").reply(200, loginResponse());

      const ok = await useAuthStore.getState().checkAuthStatus();

      expect(ok).toBe(true);
      expect(localStorage.getItem("token")).toBe("token-nuevo");
      expect(mockApi.history.get[0].headers?.Authorization).toBe("Bearer token-viejo");
      expect(useAuthStore.getState().authStatus).toBe("authenticated");
    });

    test.each([401, 403])("CP-ADW-06 Una revalidación rechazada con %i cierra la sesión", async (status) => {
      localStorage.setItem("token", "token-viejo");
      mockApi.onGet("/auth/check-status").reply(status, { error: "Invalid token" });

      const ok = await useAuthStore.getState().checkAuthStatus();

      expect(ok).toBe(false);
      expect(localStorage.getItem("token")).toBeNull();
      expect(useAuthStore.getState().authStatus).toBe("not-authenticated");
    });

    test("CP-ADW-07 Un error de red durante la revalidación conserva el token", async () => {
      localStorage.setItem("token", "token-viejo");
      mockApi.onGet("/auth/check-status").networkError();

      const ok = await useAuthStore.getState().checkAuthStatus();

      expect(ok).toBe(false);
      expect(localStorage.getItem("token")).toBe("token-viejo");
    });

    test("CP-ADW-08 Una revalidación con rol USER_ROL cierra la sesión", async () => {
      localStorage.setItem("token", "token-viejo");
      mockApi.onGet("/auth/check-status").reply(200, loginResponse("USER_ROL"));

      const ok = await useAuthStore.getState().checkAuthStatus();

      expect(ok).toBe(false);
      expect(localStorage.getItem("token")).toBeNull();
    });

    test("CP-ADW-09 Cerrar sesión elimina el token y el usuario", () => {
      loginAs();

      useAuthStore.getState().logout();

      expect(localStorage.getItem("token")).toBeNull();
      expect(useAuthStore.getState()).toMatchObject({ user: null, authStatus: "not-authenticated" });
    });

    test.each([401, 403])("CP-ADW-10 Una respuesta %i en cualquier petición cierra la sesión", async (status) => {
      loginAs();
      mockApi.onGet("/user").reply(status, { error: "Invalid Bearer token - user" });

      await expect(mindsaveAPI.get("/user")).rejects.toThrow();

      expect(localStorage.getItem("token")).toBeNull();
      expect(useAuthStore.getState().authStatus).toBe("not-authenticated");
    });

    test("CP-ADW-11 Un 401 en la petición de login no dispara el cierre global de sesión", async () => {
      loginAs();
      mockApi.onPost("/auth/login").reply(401, { error: "EMAIL_NOT_VERIFIED" });

      await expect(mindsaveAPI.post("/auth/login", {})).rejects.toThrow();

      expect(useAuthStore.getState().authStatus).toBe("authenticated");
    });

  });

  describe("Pantalla de login y rutas protegidas", () => {

    const routes = [
      route("/", <AuthenticatedRoute><p>Inicio privado</p></AuthenticatedRoute>),
      route("/login", <NotAuthenticatedRoute><LoginPage /></NotAuthenticatedRoute>),
    ];

    const fillAndSubmit = (email: string, password: string) => {
      fireEvent.change(screen.getByLabelText("Correo"), { target: { value: email } });
      fireEvent.change(screen.getByLabelText("Contraseña"), { target: { value: password } });
      fireEvent.click(screen.getByRole("button", { name: "Ingresar" }));
    };

    test("CP-ADW-12 Una ruta privada sin sesión redirige al login", async () => {
      useAuthStore.setState({ authStatus: "not-authenticated" });

      const { router } = renderWithRouter(routes, "/");

      await screen.findByText("Panel de administración");
      expect(router.state.location.pathname).toBe("/login");
    });

    test("CP-ADW-13 El login con sesión activa redirige al inicio", async () => {
      loginAs();

      const { router } = renderWithRouter(routes, "/login");

      await screen.findByText("Inicio privado");
      expect(router.state.location.pathname).toBe("/");
    });

    test("CP-ADW-14 Mientras se comprueba la sesión no se muestra contenido privado", () => {
      renderWithRouter(routes, "/");

      expect(screen.queryByText("Inicio privado")).toBeNull();
      expect(screen.queryByText("Panel de administración")).toBeNull();
    });

    test("CP-ADW-15 Iniciar sesión desde el formulario lleva al inicio", async () => {
      useAuthStore.setState({ authStatus: "not-authenticated" });
      mockApi.onPost("/auth/login").reply(200, loginResponse());
      const { router } = renderWithRouter(routes, "/login");

      fillAndSubmit(ADMIN.email, "Prueba123");

      await screen.findByText("Inicio privado");
      expect(router.state.location.pathname).toBe("/");
      expect(toast.success).toHaveBeenCalled();
    });

    test("CP-ADW-16 Credenciales inválidas muestran el error y mantienen el login", async () => {
      useAuthStore.setState({ authStatus: "not-authenticated" });
      mockApi.onPost("/auth/login").reply(400, { error: "Invalid password" });
      const { router } = renderWithRouter(routes, "/login");

      fillAndSubmit(ADMIN.email, "mala");

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith("No pudimos iniciar sesión", { description: "Invalid password" }));
      expect(router.state.location.pathname).toBe("/login");
    });

    test("CP-ADW-17 Una cuenta sin rol administrador recibe 'Acceso no autorizado'", async () => {
      useAuthStore.setState({ authStatus: "not-authenticated" });
      mockApi.onPost("/auth/login").reply(200, loginResponse("USER_ROL"));
      renderWithRouter(routes, "/login");

      fillAndSubmit("usuario@mindsave.test", "Prueba123");

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Acceso no autorizado", expect.anything()));
    });

    test("CP-ADW-18 El formulario se deshabilita mientras se envía", async () => {
      useAuthStore.setState({ authStatus: "not-authenticated" });
      mockApi.onPost("/auth/login").reply(() => new Promise(() => {}));
      renderWithRouter(routes, "/login");

      fillAndSubmit(ADMIN.email, "Prueba123");

      const button = await screen.findByRole("button", { name: /Ingresando/ });
      expect((button as HTMLButtonElement).disabled).toBe(true);
      expect((screen.getByLabelText("Correo") as HTMLInputElement).disabled).toBe(true);
    });

  });

});
