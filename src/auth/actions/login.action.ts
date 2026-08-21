import axios from "axios";
import type { LoginResponse } from "../interfaces/LoginResponse.interface"
import { mindsaveAPI } from "@/api/mindsave.backend"

export const loginAction = async (email: string, password: string) : Promise<LoginResponse> => {
  try {
    const { data } = await mindsaveAPI.post<LoginResponse>("/auth/login", { email, password });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      const message =
        responseData?.error ||
        responseData?.message ||
        error.message ||
        "Error al iniciar sesión";

      throw new Error(
        Array.isArray(message)
          ? message.join(", ")
          : typeof message === "string"
          ? message
          : JSON.stringify(message),
        { cause: error }
      );
    }
    throw new Error("Error al iniciar sesión", { cause: error });
  }
}