import type { LoginResponse } from "../interfaces/LoginResponse.interface"
import { mindsaveAPI, handleError } from "@/api/mindsave.backend"

export const loginAction = async (email: string, password: string) : Promise<LoginResponse> => {
  try {
    const { data } = await mindsaveAPI.post<LoginResponse>("/auth/login", { email, password });
    return data;
  } catch (error) {
    return handleError(error, "Error al iniciar sesión");
  }
}
