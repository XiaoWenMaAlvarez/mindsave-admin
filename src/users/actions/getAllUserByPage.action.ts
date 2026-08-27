import { mindsaveAPI, handleError } from "../../api/mindsave.backend";
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
    return handleError(error, "Error al obtener los usuarios");
  }
};