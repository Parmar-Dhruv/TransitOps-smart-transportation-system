import { axiosInstance } from "../lib/axios";

export const maintenanceApi = {
  getMaintenanceLogs: (params?: { vehicleId?: string; status?: string; page?: number; limit?: number }) =>
    axiosInstance.get('/api/v1/maintenance', { params }),

  scheduleMaintenance: (data: {
    vehicleId: string;
    description: string;
    cost: number;
    startDate: string;
    endDate?: string;
    status?: string;
  }) => axiosInstance.post('/api/v1/maintenance', data),

  updateMaintenance: (id: string, data: Partial<{
    description: string;
    cost: number;
    status: string;
    startDate: string;
    endDate: string;
  }>) => axiosInstance.put(`/api/v1/maintenance/${id}`, data),

  startMaintenance: (id: string) =>
    axiosInstance.post(`/api/v1/maintenance/${id}/start`),

  completeMaintenance: (id: string) =>
    axiosInstance.post(`/api/v1/maintenance/${id}/complete`),

  deleteLog: (id: string) =>
    axiosInstance.delete(`/api/v1/maintenance/${id}`)
};
