import { mindsaveAPI } from "../api/mindsave.backend";
import type { User } from "../interfaces/user.interface";

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await mindsaveAPI.get(`/admin/user`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}