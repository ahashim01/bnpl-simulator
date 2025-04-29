import axios from "axios";
import jwtDecode from "jwt-decode";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
});

// request: attach JWT if we have one
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// response: auto-refresh token (optional enhancement later)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      // TODO: try refresh-token flow; for now redirect to /login
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;
