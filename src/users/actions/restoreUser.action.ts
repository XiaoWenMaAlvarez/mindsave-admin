import { mindsaveAPI, handleError } from "../../api/mindsave.backend";

export const restoreUserAction = async (id: string): Promise<void> => {
  try {
    await mindsaveAPI.put(`/user/restore-user/${id}`);
  } catch (error) {
    return handleError(error, "Error al intentar restaurar al usuario");
  }
};