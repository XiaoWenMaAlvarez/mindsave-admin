import { mindsaveAPI, handleError } from "../../api/mindsave.backend";

export const deleteUserAction = async (id: string): Promise<null> => {
  try {
    await mindsaveAPI.delete(`/user/${id}`);
    return null
  } catch (error) {
    handleError(error as Error, "Error al intenbtar eliminar al usuario");
    return null
  }
}