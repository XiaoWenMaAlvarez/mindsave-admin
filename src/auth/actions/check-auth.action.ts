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
    localStorage.removeItem('token');
    throw new Error('Token expired or not valid', { cause: error });
  }
};
