import { mindsaveAPI, handleError } from "../../api/mindsave.backend";

export const restoreUserAction = async (id: string): Promise<null> => {
  try {
    await mindsaveAPI.put(`/user/restore-user/${id}`);
    return null
  } catch (error) {
    handleError(error as Error, "Error al intentar restaurar al usuario");
    return null
  }
}