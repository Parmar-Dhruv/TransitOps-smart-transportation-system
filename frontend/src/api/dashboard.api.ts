import { axiosInstance } from "../lib/axios";

export const dashboardApi = {
  getKPIs: async () => {
    return axiosInstance.get('/api/v1/dashboard/kpis');
  },
  getCharts: async () => {
    return axiosInstance.get('/api/v1/dashboard/charts');
  },
  getOverview: async () => {
    return axiosInstance.get('/api/v1/dashboard');
  }
};
