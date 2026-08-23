import { mindsaveAPI, handleError } from "../../api/mindsave.backend";
import type { UserResponse } from "../interfaces/UserResponse.interface";

export const getUserByIdAction = async (id: string): Promise<UserResponse | null> => {

  try {
    const { data } = await mindsaveAPI.get<UserResponse>(`/user/${id}`);
    return data;
  } catch (error) {
    handleError(error as Error, "Error al obtener los usuarios");
    return null
  }
}