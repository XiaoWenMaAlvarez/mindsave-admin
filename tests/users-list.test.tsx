import { beforeEach, describe, expect, test, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { toast } from "sonner";

import UsersPage from "@/users/pages/UsersPage";
import { getPaginationItems } from "@/users/utils/pagination";
import { ADMIN, buildUser, currentSearch, loginAs, mockApi, renderWithRouter, resetTestState, route } from "./test-utils";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const activeUser = buildUser({ id: "aaaaaaaa-0000-4000-8000-000000000001", name: "Ana Activa", email: "ana@mindsave.test" });
const inactiveUser = buildUser({ id: "aaaaaaaa-0000-4000-8000-000000000002", name: "Ivan Inactivo", email: "ivan@mindsave.test", isActive: false, emailVerified: false });
const adminSelf = buildUser({ id: ADMIN.id, name: ADMIN.name, email: ADMIN.email, role: "PROFESIONAL_ROL" });

const page = (results = [activeUser, inactiveUser, adminSelf], totalPages = 1) => ({ results, totalPages, page: 1, limit: 10 });

const renderUsers = (url = "/users") => renderWithRouter([route("/users", <UsersPage />)], url);

// El listado se renderiza como tabla (escritorio) y como tarjetas (móvil); se toma la fila de la tabla.
const tableRow = (name: string) => screen.getAllByText(name)[0].closest("tr") as HTMLElement;

const lastListParams = () => mockApi.history.get.filter((r) => r.url === "/user").at(-1)?.params;

describe("Listado de usuarios", () => {

  beforeEach(() => {
    resetTestState();
    loginAs();
    vi.mocked(toast.success).mockClear();
    vi.mocked(toast.error).mockClear();
  });

  test("CP-ADW-19 Mostrar las cuentas con su rol, estado y verificación", async () => {
    mockApi.onGet("/user").reply(200, page());
    renderUsers();

    await screen.findAllByText("Ana Activa");
    const ana = tableRow("Ana Activa");
    const ivan = tableRow("Ivan Inactivo");
    const self = tableRow(ADMIN.name);

    expect(within(ana).getByText("Usuario")).toBeTruthy();
    expect(within(ana).getByText("Activo")).toBeTruthy();
    expect(within(ana).getByText("Verificado")).toBeTruthy();
    expect(within(ivan).getByText("Inactivo")).toBeTruthy();
    expect(within(ivan).getByText("No verificado")).toBeTruthy();
    expect(within(self).getByText("Administrador")).toBeTruthy();
    expect(within(self).getByText(/Tu cuenta/)).toBeTruthy();
  });

  test("CP-ADW-20 La consulta inicial usa page=1 y limit=10", async () => {
    mockApi.onGet("/user").reply(200, page());
    renderUsers();

    await screen.findAllByText("Ana Activa");
    expect(lastListParams()).toEqual({ page: 1, limit: 10 });
  });

  test("CP-ADW-21 Habilitar Eliminar en cuentas activas y Restaurar en inactivas", async () => {
    mockApi.onGet("/user").reply(200, page());
    renderUsers();

    await screen.findAllByText("Ana Activa");
    const button = (row: HTMLElement, name: RegExp) => within(row).getByRole("button", { name }) as HTMLButtonElement;

    expect(button(tableRow("Ana Activa"), /^Eliminar/).disabled).toBe(false);
    expect(button(tableRow("Ana Activa"), /^Restaurar/).disabled).toBe(true);
    expect(button(tableRow("Ivan Inactivo"), /^Eliminar/).disabled).toBe(true);
    expect(button(tableRow("Ivan Inactivo"), /^Restaurar/).disabled).toBe(false);
  });

  test("CP-ADW-22 La cuenta propia queda protegida contra eliminar y restaurar", async () => {
    mockApi.onGet("/user").reply(200, page());
    renderUsers();

    await screen.findAllByText("Ana Activa");
    const protectedButtons = within(tableRow(ADMIN.name)).getAllByRole("button", { name: /^Protegido/ }) as HTMLButtonElement[];

    expect(protectedButtons).toHaveLength(2);
    protectedButtons.forEach((b) => expect(b.disabled).toBe(true));
  });

  test("CP-ADW-23 Mostrar un estado vacío cuando no hay resultados", async () => {
    mockApi.onGet("/user").reply(200, page([]));
    renderUsers();

    expect(await screen.findByText("No encontramos usuarios")).toBeTruthy();
  });

  test("CP-ADW-24 Mostrar la página de error si la consulta falla", async () => {
    mockApi.onGet("/user").reply(500, { error: "Internal Server Error" });
    renderUsers();

    expect(await screen.findByText("No pudimos cargar esta vista")).toBeTruthy();
    expect(screen.getByText("Internal Server Error")).toBeTruthy();
  });

  describe("Búsqueda y filtros", () => {

    test("CP-ADW-25 Buscar recorta, pasa a minúsculas y vuelve a la página 1", async () => {
      mockApi.onGet("/user").reply(200, page(undefined, 5));
      const { router } = renderUsers("/users?page=3&limit=20");
      await screen.findAllByText("Ana Activa");

      fireEvent.change(screen.getByLabelText("Buscar usuarios por nombre o correo"), { target: { value: "  ANA@Mindsave  " } });
      fireEvent.click(screen.getByRole("button", { name: "Buscar" }));

      await waitFor(() => expect(currentSearch(router).get("query")).toBe("ana@mindsave"));
      expect(currentSearch(router).get("page")).toBe("1");
      expect(currentSearch(router).get("limit")).toBe("20");
      await waitFor(() => expect(lastListParams()).toMatchObject({ query: "ana@mindsave", page: 1, limit: 20 }));
    });

    test("CP-ADW-26 Limpiar la búsqueda elimina el parámetro query", async () => {
      mockApi.onGet("/user").reply(200, page(undefined, 5));
      const { router } = renderUsers("/users?query=ana&page=2");
      await screen.findAllByText("Ana Activa");

      fireEvent.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));

      await waitFor(() => expect(currentSearch(router).has("query")).toBe(false));
      expect(currentSearch(router).get("page")).toBe("1");
    });

    test.each([
      ["Estado del correo", "emailVerify", "unverify"],
      ["Rol", "rol", "PROFESIONAL_ROL"],
      ["Estado de la cuenta", "state", "inactive"],
    ])("CP-ADW-27 Filtrar por '%s' actualiza la URL, la consulta y conserva la búsqueda", async (label, param, value) => {
      mockApi.onGet("/user").reply(200, page(undefined, 5));
      const { router } = renderUsers("/users?query=ana&page=4");
      await screen.findAllByText("Ana Activa");

      fireEvent.change(screen.getByLabelText(label), { target: { value } });

      await waitFor(() => expect(currentSearch(router).get(param)).toBe(value));
      expect(currentSearch(router).get("page")).toBe("1");
      expect(currentSearch(router).get("query")).toBe("ana");
      await waitFor(() => expect(lastListParams()).toMatchObject({ [param]: value, query: "ana", page: 1 }));
    });

    test("CP-ADW-28 'Limpiar filtros' quita los tres filtros y conserva la búsqueda", async () => {
      mockApi.onGet("/user").reply(200, page(undefined, 5));
      const { router } = renderUsers("/users?query=ana&rol=USER_ROL&state=active&emailVerify=verify");
      await screen.findAllByText("Ana Activa");

      fireEvent.click(screen.getByRole("button", { name: /Limpiar filtros/ }));

      await waitFor(() => expect(currentSearch(router).has("rol")).toBe(false));
      expect(currentSearch(router).has("state")).toBe(false);
      expect(currentSearch(router).has("emailVerify")).toBe(false);
      expect(currentSearch(router).get("query")).toBe("ana");
    });

    test("CP-ADW-29 Normalizar parámetros inválidos de la URL antes de consultar", async () => {
      mockApi.onGet("/user").reply(200, page());
      renderUsers(`/users?page=-3&limit=500&rol=HACKER&state=borrado&emailVerify=x&query=${"b".repeat(150)}`);

      await screen.findAllByText("Ana Activa");
      expect(lastListParams()).toEqual({ page: 1, limit: 100, query: "b".repeat(100) });
    });

  });

  describe("Paginación", () => {

    test("CP-ADW-30 Sin paginación cuando hay una sola página", async () => {
      mockApi.onGet("/user").reply(200, page(undefined, 1));
      renderUsers();

      await screen.findAllByText("Ana Activa");
      expect(screen.queryByRole("navigation", { name: "Paginación de usuarios" })).toBeNull();
    });

    test("CP-ADW-31 Navegar a la página siguiente y a la última", async () => {
      mockApi.onGet("/user").reply(200, page(undefined, 5));
      const { router } = renderUsers();
      await screen.findAllByText("Ana Activa");

      fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));
      await waitFor(() => expect(currentSearch(router).get("page")).toBe("2"));

      fireEvent.click(await screen.findByRole("button", { name: "Última página" }));
      await waitFor(() => expect(currentSearch(router).get("page")).toBe("5"));
      expect((await screen.findByRole("button", { name: "Página siguiente" }) as HTMLButtonElement).disabled).toBe(true);
    });

    test("CP-ADW-32 Una página mayor al total se corrige a la última", async () => {
      mockApi.onGet("/user").reply(200, page(undefined, 3));
      const { router } = renderUsers("/users?page=9");

      await waitFor(() => expect(currentSearch(router).get("page")).toBe("3"));
    });

    test.each([
      [1, 3, [1, 2, 3]],
      [1, 10, [1, 2, 3, "ellipsis-right", 10]],
      [5, 10, [1, "ellipsis-left", 4, 5, 6, "ellipsis-right", 10]],
      [10, 10, [1, "ellipsis-left", 8, 9, 10]],
      [1, 0, []],
    ])("CP-ADW-33 Números de página para la página %i de %i", (current, total, expected) => {
      expect(getPaginationItems(current, total)).toEqual(expected);
    });

  });

  describe("Desactivar y restaurar", () => {

    test("CP-ADW-34 Desactivar requiere confirmación y luego recarga el listado", async () => {
      mockApi.onGet("/user").reply(200, page());
      mockApi.onDelete(`/user/${activeUser.id}`).reply(200, { status: "success" });
      renderUsers();
      await screen.findAllByText("Ana Activa");

      fireEvent.click(within(tableRow("Ana Activa")).getByRole("button", { name: /^Eliminar/ }));
      const dialog = await screen.findByRole("alertdialog");
      expect(mockApi.history.delete).toHaveLength(0);

      const getsBefore = mockApi.history.get.length;
      fireEvent.click(within(dialog).getByRole("button", { name: "Desactivar" }));

      await waitFor(() => expect(mockApi.history.delete).toHaveLength(1));
      await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
      await waitFor(() => expect(mockApi.history.get.length).toBeGreaterThan(getsBefore));
      expect(toast.success).toHaveBeenCalledWith("Usuario desactivado", expect.anything());
    });

    test("CP-ADW-35 Cancelar la confirmación no desactiva la cuenta", async () => {
      mockApi.onGet("/user").reply(200, page());
      renderUsers();
      await screen.findAllByText("Ana Activa");

      fireEvent.click(within(tableRow("Ana Activa")).getByRole("button", { name: /^Eliminar/ }));
      fireEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Cancelar" }));

      await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
      expect(mockApi.history.delete).toHaveLength(0);
    });

    test("CP-ADW-36 La tecla Escape cierra la confirmación", async () => {
      mockApi.onGet("/user").reply(200, page());
      renderUsers();
      await screen.findAllByText("Ana Activa");

      fireEvent.click(within(tableRow("Ana Activa")).getByRole("button", { name: /^Eliminar/ }));
      await screen.findByRole("alertdialog");
      fireEvent.keyDown(window, { key: "Escape" });

      await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
    });

    test("CP-ADW-37 Restaurar una cuenta inactiva tras confirmar", async () => {
      mockApi.onGet("/user").reply(200, page());
      mockApi.onPut(`/user/restore-user/${inactiveUser.id}`).reply(200, { status: "success" });
      renderUsers();
      await screen.findAllByText("Ivan Inactivo");

      fireEvent.click(within(tableRow("Ivan Inactivo")).getByRole("button", { name: /^Restaurar/ }));
      fireEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Restaurar" }));

      await waitFor(() => expect(mockApi.history.put).toHaveLength(1));
      expect(toast.success).toHaveBeenCalledWith("Usuario restaurado", expect.anything());
    });

    test("CP-ADW-38 Un error al desactivar se informa y la confirmación sigue abierta", async () => {
      mockApi.onGet("/user").reply(200, page());
      mockApi.onDelete(`/user/${activeUser.id}`).reply(404, { error: "ID not found" });
      renderUsers();
      await screen.findAllByText("Ana Activa");

      fireEvent.click(within(tableRow("Ana Activa")).getByRole("button", { name: /^Eliminar/ }));
      fireEvent.click(within(await screen.findByRole("alertdialog")).getByRole("button", { name: "Desactivar" }));

      await waitFor(() => expect(toast.error).toHaveBeenCalledWith("No pudimos desactivar el usuario", { description: "ID not found" }));
      expect(screen.getByRole("alertdialog")).toBeTruthy();
    });

  });

});
