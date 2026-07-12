import { axiosInstance } from "../lib/axios";

export const dashboardApi = {
  getKPIs: async () => {
    return axiosInstance.get('/api/v1/dashboard/kpis');
  },
  getDashboard: async () => {
    return axiosInstance.get('/api/v1/dashboard');
  },
  getFleetAnalytics: async () => {
    return axiosInstance.get('/api/v1/dashboard/fleet-analytics');
  },
  getTripAnalytics: async () => {
    return axiosInstance.get('/api/v1/dashboard/trip-analytics');
  },
  getRevenueAnalytics: async () => {
    return axiosInstance.get('/api/v1/dashboard/revenue-analytics');
  },
  getFuelAnalytics: async () => {
    return axiosInstance.get('/api/v1/dashboard/fuel-analytics');
  },
  getMaintenanceAnalytics: async () => {
    return axiosInstance.get('/api/v1/dashboard/maintenance-analytics');
  },
  getExpenseBreakdown: async () => {
    return axiosInstance.get('/api/v1/dashboard/expense-breakdown');
  },
  getRecentActivity: async () => {
    return axiosInstance.get('/api/v1/dashboard/recent-activity');
  },
  getAlerts: async () => {
    return axiosInstance.get('/api/v1/dashboard/alerts');
  },
  search: async (q: string) => {
    return axiosInstance.get('/api/v1/dashboard/search', { params: { q } });
  },
  // Backward compatibility for any legacy imports.
  getOverview: async () => {
    return axiosInstance.get('/api/v1/dashboard');
  },
  getCharts: async () => {
    return axiosInstance.get('/api/v1/dashboard/charts');
  }
};
