import axios from "axios";

import { queryClient } from "@/lib/queryClient";

const BASE_URL = import.meta.env.VITE_API_URL;

export const mindsaveAPI = axios.create({
  baseURL: `${BASE_URL}/admin`,
  headers: {
    "Content-Type": "application/json",
  }
})

let onUnauthorizedCallback: (() => void) | null = null;

export const registerUnauthorizedHandler = (handler: () => void) => {
  onUnauthorizedCallback = handler;
};

mindsaveAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

mindsaveAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status } = error.response;
      const url = error.config?.url || "";
      const isLoginRequest = url.includes("/auth/login");

      if ((status === 401 || status === 403) && !isLoginRequest) {
        if (onUnauthorizedCallback) {
          onUnauthorizedCallback();
        } else {
          localStorage.removeItem('token');
          queryClient.clear();
        }
      }
    }
    return Promise.reject(error);
  }
);

export const handleError = (error: unknown, messageDefault?: string): never => {
  const DEFAULT_MESSAGE = messageDefault || "Error al realizar la petición a Mindsave";
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data;
    const message = responseData?.error || responseData?.message || error.message || DEFAULT_MESSAGE;
    
    throw new Error(
      Array.isArray(message)
        ? message.join(", ")
        : typeof message === "string"
        ? message
        : JSON.stringify(message),
      { cause: error }
    );
  }
  const message = error instanceof Error && error.message ? error.message : DEFAULT_MESSAGE;
  throw new Error(message, { cause: error });
};
