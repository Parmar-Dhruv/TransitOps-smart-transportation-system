import { axiosInstance } from "../lib/axios";

export const maintenanceApi = {
  getMaintenanceLogs: async () => {
    return axiosInstance.get('/api/v1/maintenance');
  },
  scheduleMaintenance: async (log: any) => {
    return axiosInstance.post('/api/v1/maintenance', log);
  },
  startMaintenance: async (id: string) => {
    return axiosInstance.post(`/api/v1/maintenance/${id}/start`);
  },
  completeMaintenance: async (id: string) => {
    return axiosInstance.post(`/api/v1/maintenance/${id}/complete`);
  },
  deleteLog: async (id: string) => {
    return axiosInstance.delete(`/api/v1/maintenance/${id}`);
  }
};
