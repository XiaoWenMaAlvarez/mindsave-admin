import { mindsaveAPI, handleError } from "@/api/mindsave.backend"
import type { NewUser } from "../interfaces/NewUser.interface";
import type { UserResponse } from "../interfaces/UserResponse.interface";


export const createUserAction = async ({ email, name, password, emailVerified, role} : NewUser) : Promise<UserResponse> => {
  try {
    const { data } = await mindsaveAPI.post<UserResponse>(`/user`, { 
      email, 
      password, 
      name, 
      emailVerified, 
      role 
    });
    return data;
  } catch (error) {
    return handleError(error, "Error al intentar crear al usuario");
  }
};