import { afterAll, beforeAll, describe, expect, test } from "vitest";

import { loginAction } from "@/auth/actions/login.action";
import { checkAuthAction } from "@/auth/actions/check-auth.action";
import { useAuthStore } from "@/auth/store/auth.store";
import { createUserAction } from "@/users/actions/createUser.action";
import { deleteUserAction } from "@/users/actions/deleteUser.action";
import { editUserAction } from "@/users/actions/editUser.action";
import { getAllUsersByPageAction } from "@/users/actions/getAllUserByPage.action";
import { getUserByIdAction } from "@/users/actions/getUserByID.action";
import { restoreUserAction } from "@/users/actions/restoreUser.action";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const RUN_ID = Date.now().toString(36);
const PASSWORD = "Prueba123";
const email = (label: string) => `qa.${RUN_ID}.${label}@mindsave.test`;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Login de la API de usuario (app móvil), usado para comprobar el efecto de las acciones del panel.
const mobileLogin = async (userEmail: string, password = PASSWORD) => {
  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userEmail, password }),
  });
  return res.status;
};

describe("Contrato panel de administración ↔ backend", () => {

  const createdIds: string[] = [];
  let userId: string;

  beforeAll(async () => {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) throw new Error("Definir ADMIN_EMAIL y ADMIN_PASSWORD para las pruebas de contrato");
    localStorage.clear();
  });

  afterAll(async () => {
    for (const id of createdIds) await deleteUserAction(id).catch(() => undefined);
  });

  test("CT-ADW-01 El login del panel recibe la identidad y el token del administrador", async () => {
    const data = await loginAction(ADMIN_EMAIL, ADMIN_PASSWORD);

    expect(data).toMatchObject({ email: ADMIN_EMAIL, role: "PROFESIONAL_ROL" });
    expect(data.id).toMatch(UUID_RE);
    expect(typeof data.token).toBe("string");
  });

  test("CT-ADW-02 El store abre la sesión con el backend real", async () => {
    const ok = await useAuthStore.getState().login(ADMIN_EMAIL, ADMIN_PASSWORD);

    expect(ok).toBe(true);
    expect(useAuthStore.getState().authStatus).toBe("authenticated");
    expect(localStorage.getItem("token")).toBeTruthy();
  });

  test("CT-ADW-03 La revalidación de sesión renueva el token", async () => {
    const data = await checkAuthAction();

    expect(data.role).toBe("PROFESIONAL_ROL");
    expect(localStorage.getItem("token")).toBe(data.token);
  });

  test("CT-ADW-04 Crear un usuario devuelve la estructura que espera el panel", async () => {
    const created = await createUserAction({ email: email("contrato"), name: "QA Contrato", password: PASSWORD, emailVerified: true, role: "USER_ROL" });
    createdIds.push(created.id);
    userId = created.id;

    expect(created).toMatchObject({ email: email("contrato"), name: "QA Contrato", emailVerified: true, role: "USER_ROL", isActive: true });
    expect(created.id).toMatch(UUID_RE);
  });

  test("CT-ADW-05 El listado responde con results, totalPages, page y limit numéricos", async () => {
    const data = await getAllUsersByPageAction({ page: 1, limit: 10, query: `qa.${RUN_ID}` });

    expect(typeof data.totalPages).toBe("number");
    expect(data.page).toBe(1);
    expect(data.limit).toBe(10);
    expect(data.results.map((u) => u.id)).toContain(userId);
    expect(Object.keys(data.results[0]).sort()).toEqual(["email", "emailVerified", "id", "isActive", "name", "password", "role"]);
  });

  test("CT-ADW-06 El backend acepta todos los filtros y el límite máximo que envía el panel", async () => {
    const data = await getAllUsersByPageAction({ page: 1, limit: 100, query: `qa.${RUN_ID}`, rol: "USER_ROL", state: "active", emailVerify: "verify" });

    expect(data.limit).toBe(100);
    expect(data.results.map((u) => u.id)).toContain(userId);
  });

  test("CT-ADW-07 Obtener el detalle de una cuenta", async () => {
    const user = await getUserByIdAction(userId);

    expect(user).toMatchObject({ id: userId, email: email("contrato"), password: "" });
  });

  test("CT-ADW-08 Editar sin contraseña conserva la contraseña actual", async () => {
    await editUserAction({ id: userId, email: email("contrato"), name: "QA Contrato Editado", emailVerified: true, role: "USER_ROL" });

    expect((await getUserByIdAction(userId)).name).toBe("QA Contrato Editado");
    expect(await mobileLogin(email("contrato"))).toBe(200);
  });

  test("CT-ADW-09 Editar con contraseña nueva la reemplaza", async () => {
    await editUserAction({ id: userId, email: email("contrato"), name: "QA Contrato Editado", password: "OtraClave99", emailVerified: true, role: "USER_ROL" });

    expect(await mobileLogin(email("contrato"), "OtraClave99")).toBe(200);
    expect(await mobileLogin(email("contrato"))).toBe(400);
  });

  test("CT-ADW-10 Desactivar desde el panel bloquea el acceso en la app y restaurar lo devuelve", async () => {
    await deleteUserAction(userId);
    expect((await getUserByIdAction(userId)).isActive).toBe(false);
    expect(await mobileLogin(email("contrato"), "OtraClave99")).toBe(400);

    await restoreUserAction(userId);
    expect((await getUserByIdAction(userId)).isActive).toBe(true);
    expect(await mobileLogin(email("contrato"), "OtraClave99")).toBe(200);
  });

  test("CT-ADW-11 Un email duplicado llega al panel como mensaje de error", async () => {
    await expect(createUserAction({ email: email("contrato"), name: "Duplicado", password: PASSWORD, emailVerified: true, role: "USER_ROL" }))
      .rejects.toThrow("Email already exists");
  });

  test("CT-ADW-12 Una cuenta USER_ROL no puede iniciar sesión en el panel", async () => {
    // El backend rechaza antes de que el panel evalúe el rol, por lo que el mensaje visible es el del backend (DEF-AD-04).
    await expect(loginAction(email("contrato"), "OtraClave99")).rejects.toThrow("User not found");
  });

  test("CT-ADW-13 Un token inválido cierra la sesión del panel", async () => {
    localStorage.setItem("token", "token-invalido");
    useAuthStore.setState({ authStatus: "authenticated" });

    await expect(getAllUsersByPageAction({ page: 1, limit: 10 })).rejects.toThrow();

    expect(localStorage.getItem("token")).toBeNull();
    expect(useAuthStore.getState().authStatus).toBe("not-authenticated");
    await useAuthStore.getState().login(ADMIN_EMAIL, ADMIN_PASSWORD);
  });

});
