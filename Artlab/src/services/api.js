import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});
api.defaults.withCredentials = true;
// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
