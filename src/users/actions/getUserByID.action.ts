import { mindsaveAPI, handleError } from "../../api/mindsave.backend";
import type { UserResponse } from "../interfaces/UserResponse.interface";

export const getUserByIdAction = async (id: string): Promise<UserResponse> => {
  try {
    const { data } = await mindsaveAPI.get<UserResponse>(`/user/${id}`);
    return data;
  } catch (error) {
    return handleError(error, "Error al obtener el usuario");
  }
};