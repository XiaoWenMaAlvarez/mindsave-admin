import { beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { toast } from "sonner";

import NewUserPage from "@/users/pages/NewUserPage";
import UserPage from "@/users/pages/UserPage";
import { ADMIN, buildUser, loginAs, mockApi, renderWithRouter, resetTestState, route } from "./test-utils";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const listRoute = route("/users", <p>Listado de usuarios</p>);

const type = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });
const select = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

const alerts = () => screen.queryAllByRole("alert").map((a) => a.textContent);

describe("Formularios de usuario", () => {

  beforeEach(() => {
    resetTestState();
    loginAs();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  describe("Creación", () => {

    const renderCreate = () => renderWithRouter([route("/new-user", <NewUserPage />), listRoute], "/new-user");

    const fillValid = () => {
      type("Nombre del usuario", "  Nuevo Paciente  ");
      type("Correo electrónico", "nuevo@mindsave.test");
      type("Contraseña", "Prueba123");
    };

    test("CP-ADW-39 El formulario de creación parte con rol Usuario y correo no verificado", () => {
      renderCreate();

      expect((screen.getByLabelText("Rol del usuario") as HTMLSelectElement).value).toBe("USER_ROL");
      expect((screen.getByLabelText("Verificación del correo electrónico") as HTMLInputElement).checked).toBe(false);
    });

    test("CP-ADW-40 Enviar el formulario vacío muestra los errores y no llama a la API", async () => {
      renderCreate();

      fireEvent.click(screen.getByRole("button", { name: "Crear usuario" }));

      await waitFor(() => expect(alerts()).toEqual(expect.arrayContaining([
        "El nombre es requerido.", "Ingresa un correo electrónico válido.", "La contraseña es requerida.",
      ])));
      expect(mockApi.history.post).toHaveLength(0);
    });

    test.each([
      ["Nombre del usuario", "A", "El nombre no puede tener menos de 2 caracteres."],
      ["Nombre del usuario", "A".repeat(31), "El nombre no puede superar 30 caracteres."],
      ["Correo electrónico", "correo-invalido", "Ingresa un correo electrónico válido."],
      ["Contraseña", "12345", "La contraseña debe tener al menos 6 caracteres."],
      ["Contraseña", "x".repeat(21), "La contraseña no puede superar 20 caracteres."],
    ])("CP-ADW-41 Validar '%s' con el valor '%s'", async (label, value, message) => {
      renderCreate();
      fillValid();

      type(label, value);
      fireEvent.click(screen.getByRole("button", { name: "Crear usuario" }));

      expect(await screen.findByText(message)).toBeTruthy();
      expect(mockApi.history.post).toHaveLength(0);
    });

    test("CP-ADW-42 Crear un usuario envía los datos normalizados y vuelve al listado", async () => {
      mockApi.onPost("/user").reply(201, buildUser());
      const { router } = renderCreate();
      fillValid();
      select("Rol del usuario", "PROFESIONAL_ROL");
      fireEvent.click(screen.getByLabelText("Verificación del correo electrónico"));

      fireEvent.click(screen.getByRole("button", { name: "Crear usuario" }));

      await waitFor(() => expect(router.state.location.pathname).toBe("/users"));
      expect(JSON.parse(mockApi.history.post[0].data)).toEqual({
        email: "nuevo@mindsave.test", password: "Prueba123", name: "Nuevo Paciente", emailVerified: true, role: "PROFESIONAL_ROL",
      });
      expect(toast.success).toHaveBeenCalledWith("Usuario creado", expect.anything());
    });

    test("CP-ADW-43 Un error del backend al crear se informa y el formulario se mantiene", async () => {
      mockApi.onPost("/user").reply(400, { error: "Email already exists" });
      const { router } = renderCreate();
      fillValid();

      fireEvent.click(screen.getByRole("button", { name: "Crear usuario" }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith("No pudimos crear el usuario", { description: "Email already exists" }));
      expect(router.state.location.pathname).toBe("/new-user");
      expect((screen.getByLabelText("Correo electrónico") as HTMLInputElement).value).toBe("nuevo@mindsave.test");
    });

  });

  describe("Edición", () => {

    const other = buildUser({ id: "bbbbbbbb-0000-4000-8000-000000000001", name: "Bea Paciente", email: "bea@mindsave.test", emailVerified: false });
    const self = buildUser({ id: ADMIN.id, name: ADMIN.name, email: ADMIN.email, role: "PROFESIONAL_ROL" });

    const renderEdit = (user = other) => {
      mockApi.onGet(`/user/${user.id}`).reply(200, user);
      return renderWithRouter([route("/users/:id", <UserPage />), listRoute], `/users/${user.id}`);
    };

    const save = () => fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

    test("CP-ADW-44 Cargar los datos de la cuenta en el formulario con la contraseña vacía", async () => {
      renderEdit();

      await screen.findByText("Edición de usuario");
      expect((screen.getByLabelText("Nombre del usuario") as HTMLInputElement).value).toBe("Bea Paciente");
      expect((screen.getByLabelText("Correo electrónico") as HTMLInputElement).value).toBe("bea@mindsave.test");
      expect((screen.getByLabelText("Rol del usuario") as HTMLSelectElement).value).toBe("USER_ROL");
      expect((screen.getByLabelText("Verificación del correo electrónico") as HTMLInputElement).checked).toBe(false);
      expect((screen.getByLabelText("Contraseña") as HTMLInputElement).value).toBe("");
    });

    test("CP-ADW-45 Guardar con la contraseña vacía no envía el campo password", async () => {
      mockApi.onPut(`/user/${other.id}`).reply(200, { status: "success" });
      const { router } = renderEdit();
      await screen.findByText("Edición de usuario");

      type("Nombre del usuario", "Bea Editada");
      save();

      await waitFor(() => expect(router.state.location.pathname).toBe("/users"));
      const body = JSON.parse(mockApi.history.put[0].data);
      expect(body).toEqual({ email: "bea@mindsave.test", name: "Bea Editada", emailVerified: false, role: "USER_ROL" });
      expect(toast.success).toHaveBeenCalledWith("Cambios guardados", expect.anything());
    });

    test("CP-ADW-46 Guardar con una contraseña nueva la incluye en la petición", async () => {
      mockApi.onPut(`/user/${other.id}`).reply(200, { status: "success" });
      renderEdit();
      await screen.findByText("Edición de usuario");

      type("Contraseña", "NuevaClave1");
      save();

      await waitFor(() => expect(mockApi.history.put).toHaveLength(1));
      expect(JSON.parse(mockApi.history.put[0].data).password).toBe("NuevaClave1");
    });

    test("CP-ADW-47 Rechazar en edición una contraseña de menos de 6 caracteres", async () => {
      renderEdit();
      await screen.findByText("Edición de usuario");

      type("Contraseña", "123");
      save();

      expect(await screen.findByText("La contraseña debe tener al menos 6 y máximo 20 caracteres.")).toBeTruthy();
      expect(mockApi.history.put).toHaveLength(0);
    });

    test("CP-ADW-48 El administrador no puede quitarse el rol de administrador", async () => {
      renderEdit(self);
      await screen.findByText("Edición de usuario");

      select("Rol del usuario", "USER_ROL");
      save();

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith("No puedes cambiar tu rol", expect.anything()));
      expect(mockApi.history.put).toHaveLength(0);
    });

    test("CP-ADW-49 El administrador no puede desverificar su propio correo", async () => {
      renderEdit(self);
      await screen.findByText("Edición de usuario");

      fireEvent.click(screen.getByLabelText("Verificación del correo electrónico"));
      save();

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith("No puedes desverificar tu correo", expect.anything()));
      expect(mockApi.history.put).toHaveLength(0);
    });

    test("CP-ADW-50 El administrador sí puede cambiar el rol de otra cuenta", async () => {
      mockApi.onPut(`/user/${other.id}`).reply(200, { status: "success" });
      renderEdit();
      await screen.findByText("Edición de usuario");

      select("Rol del usuario", "PROFESIONAL_ROL");
      save();

      await waitFor(() => expect(mockApi.history.put).toHaveLength(1));
      expect(JSON.parse(mockApi.history.put[0].data).role).toBe("PROFESIONAL_ROL");
    });

    test("CP-ADW-51 Un error del backend al editar se informa sin salir del formulario", async () => {
      mockApi.onPut(`/user/${other.id}`).reply(400, { error: "Email already exists" });
      const { router } = renderEdit();
      await screen.findByText("Edición de usuario");

      save();

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith("No pudimos editar el usuario", { description: "Email already exists" }));
      expect(router.state.location.pathname).toBe(`/users/${other.id}`);
    });

    test("CP-ADW-52 Una cuenta inexistente muestra la página de error", async () => {
      mockApi.onGet("/user/no-existe").reply(400, { error: "User not found" });
      renderWithRouter([route("/users/:id", <UserPage />)], "/users/no-existe");

      expect(await screen.findByText("No pudimos cargar esta vista")).toBeTruthy();
      expect(screen.getByText("User not found")).toBeTruthy();
    });

  });

  // Defectos conocidos (registro DEF-AD-*): estas pruebas documentan el comportamiento esperado y hoy fallan.
  // `test.fails` las mantiene en verde mientras el defecto exista; al corregirlo, Vitest avisará para convertirlas en pruebas normales.
  describe("Defectos conocidos", () => {

    test.fails("DEF-AD-01 La protección de la propia cuenta debe funcionar aunque el administrador haya cambiado su correo", async () => {
      // El store conserva el correo con el que se inició sesión; la cuenta ya tiene un correo nuevo.
      const selfWithNewEmail = buildUser({ id: ADMIN.id, name: ADMIN.name, email: "nuevo-correo-admin@mindsave.test", role: "PROFESIONAL_ROL" });
      mockApi.onGet(`/user/${ADMIN.id}`).reply(200, selfWithNewEmail);
      mockApi.onPut(`/user/${ADMIN.id}`).reply(200, { status: "success" });
      renderWithRouter([route("/users/:id", <UserPage />), listRoute], `/users/${ADMIN.id}`);
      await screen.findByText("Edición de usuario");

      select("Rol del usuario", "USER_ROL");
      fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith("No puedes cambiar tu rol", expect.anything()), { timeout: 500 });
      expect(mockApi.history.put).toHaveLength(0);
    });

    test.fails("DEF-AD-02 Una contraseña de solo espacios debe rechazarse en lugar de descartarse sin aviso", async () => {
      const other = buildUser({ id: "bbbbbbbb-0000-4000-8000-000000000002" });
      mockApi.onGet(`/user/${other.id}`).reply(200, other);
      mockApi.onPut(`/user/${other.id}`).reply(200, { status: "success" });
      renderWithRouter([route("/users/:id", <UserPage />), listRoute], `/users/${other.id}`);
      await screen.findByText("Edición de usuario");

      type("Contraseña", "        ");
      fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

      await waitFor(() => expect(alerts().length).toBeGreaterThan(0), { timeout: 500 });
      expect(mockApi.history.put).toHaveLength(0);
    });

    test.fails("DEF-AD-05 Debe poder editarse una cuenta registrada desde la app con un nombre de más de 30 caracteres", async () => {
      // La app móvil y el backend no limitan el largo del nombre; el panel exige un máximo de 30.
      const longName = buildUser({ id: "bbbbbbbb-0000-4000-8000-000000000003", name: "María Fernanda de los Ángeles Rojas" });
      mockApi.onGet(`/user/${longName.id}`).reply(200, longName);
      mockApi.onPut(`/user/${longName.id}`).reply(200, { status: "success" });
      renderWithRouter([route("/users/:id", <UserPage />), listRoute], `/users/${longName.id}`);
      await screen.findByText("Edición de usuario");

      fireEvent.click(screen.getByLabelText("Verificación del correo electrónico"));
      fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));

      await waitFor(() => expect(mockApi.history.put).toHaveLength(1), { timeout: 500 });
    });

  });

});
