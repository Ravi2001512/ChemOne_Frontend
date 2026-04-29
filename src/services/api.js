import axios from "axios";

export const API = import.meta.env.VITE_API_URL;

const apiInstance = axios.create({
  baseURL: `${API}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

apiInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiInstance;