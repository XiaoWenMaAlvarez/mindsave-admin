import axios from "axios";
import { mindsaveAPI } from "../../api/mindsave.backend";
import type { UsersResponse } from "../interfaces/UsersResponse.interface";

export interface GetAllUsersByPageParams {
  page?: number;
  limit?: number;
  query?: string;
  rol?: string;
  state?: string;
  emailVerify?: string;
}

export const getAllUsersByPageAction = async (params: GetAllUsersByPageParams): Promise<UsersResponse> => {
  const {page, limit, query, rol, state, emailVerify} = params;

  try {
    const { data } = await mindsaveAPI.get<UsersResponse>("/user", {
      params: {
        page,
        limit,
        query,
        rol,
        state,
        emailVerify
      }
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const responseData = error.response?.data;
      const message =
        responseData?.error ||
        responseData?.message ||
        error.message ||
        "Error al obtener los usuarios";

      throw new Error(
        Array.isArray(message)
          ? message.join(", ")
          : typeof message === "string"
          ? message
          : JSON.stringify(message),
        { cause: error }
      );
    }
    throw new Error("Error al obtener los usuarios", { cause: error });
  }
}