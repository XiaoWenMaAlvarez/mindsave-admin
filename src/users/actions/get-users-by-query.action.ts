import { mindsaveAPI } from "../api/mindsave.backend";
import type { User } from "../interfaces/user.interface";

export const getUsersByQuery = async (query: string): Promise<User[]> => {
  try {
    const response = await mindsaveAPI.get(`/admin/users-by-query?query=${query}`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}