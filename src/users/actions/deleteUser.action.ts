import { mindsaveAPI, handleError } from "../../api/mindsave.backend";

export const deleteUserAction = async (id: string): Promise<void> => {
  try {
    await mindsaveAPI.delete(`/user/${id}`);
  } catch (error) {
    return handleError(error, "Error al intentar eliminar al usuario");
  }
};