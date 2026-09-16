import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const client = axios.create({ baseURL: API_BASE });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let queue = [];

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      const refresh = localStorage.getItem("refresh");
      if (!refresh) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }
      original._retry = true;
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject, original });
        });
      }
      isRefreshing = true;
      try {
        const { data } = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh });
        localStorage.setItem("access", data.access);
        client.defaults.headers.common.Authorization = `Bearer ${data.access}`;
        queue.forEach(({ resolve, original: o }) => {
          o.headers.Authorization = `Bearer ${data.access}`;
          resolve(client(o));
        });
        queue = [];
        original.headers.Authorization = `Bearer ${data.access}`;
        return client(original);
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default client;
