import axios from "axios";
import { queryClient } from "./queryClient";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    const method = response.config?.method?.toLowerCase();
    const requestUrl = response.config?.url || "";
    const isMutation = method === "post" || method === "put" || method === "patch" || method === "delete";
    const shouldRefreshDashboard =
      isMutation &&
      [
        "/vehicles",
        "/drivers",
        "/api/v1/trips",
        "/api/v1/maintenance",
        "/api/v1/fuel",
        "/api/v1/expenses"
      ].some((prefix) => requestUrl.startsWith(prefix));

    if (shouldRefreshDashboard) {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    }

    return response;
  },
  (error) => {
    // Optionally handle global errors (e.g., 401 refetch auth)
    return Promise.reject(error);
  }
);
