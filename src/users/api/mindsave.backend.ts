import axios from "axios";

const adminToken = "x"

export const mindsaveAPI = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${adminToken}`
  }
})