import { mindsaveAPI, handleError } from "@/api/mindsave.backend"
import type { UserResponse } from "../interfaces/UserResponse.interface";


export const editUserAction = async ({ id, email, name, password, emailVerified, role} : Partial<UserResponse>) : Promise<string | null> => {
  try {
    await mindsaveAPI.put(`/user/${id}`, { 
      email, 
      password,
      name,
      emailVerified,
      role
    });
    return id!;
  } catch (error) {
    handleError(error as Error, "Error al intentar editar al usuario");
    return null
  }
}