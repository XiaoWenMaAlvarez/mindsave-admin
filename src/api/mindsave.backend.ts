import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

export const mindsaveAPI = axios.create({
  baseURL: `${BASE_URL}/admin`,
  headers: {
    "Content-Type": "application/json",
  }
})

mindsaveAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

//TODO: Función para centralizaar errores