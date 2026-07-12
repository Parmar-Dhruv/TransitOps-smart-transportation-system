import { axiosInstance } from "../lib/axios";

export const maintenanceApi = {
  getMaintenanceLogs: async () => {
    return { data: [] };
  }
};

export const fuelApi = {
  getFuelLogs: async () => {
    return { data: [] };
  }
};

export const expensesApi = {
  getExpenses: async () => {
    return { data: [] };
  }
};

export const reportsApi = {
  getReports: async () => {
    return { data: [] };
  }
};

export const dashboardApi = {
  getDashboard: async () => {
    return { data: { metrics: {}, overview: [] } };
  }
};
