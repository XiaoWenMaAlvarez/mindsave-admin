import axios from "axios";
import { mindsaveAPI } from "@/api/mindsave.backend"
import type { CheckAuthResponse } from '../interfaces/CheckAuthResponse.interface';

export const checkAuthAction = async (): Promise<CheckAuthResponse> => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No token found');

  try {
    const { data } = await mindsaveAPI.get<CheckAuthResponse>('/auth/check-status');
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        throw new Error('Token expired or not valid', { cause: error });
      }
      throw new Error(error.response?.data?.message || error.message || 'Error de conexión con el servidor', { cause: error });
    }
    throw error;
  }
};
