import { axiosInstance } from "../lib/axios";

export const driversApi = {
  getDrivers: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    axiosInstance.get('/drivers', { params }),

  getDriver: (id: string) =>
    axiosInstance.get(`/drivers/${id}`),

  createDriver: (data: {
    name: string;
    email: string;
    phone: string;
    licenseNumber: string;
    licenseExpiry: string;
    safetyScore?: number;
    status?: string;
  }) => axiosInstance.post('/drivers', data),

  updateDriver: (id: string, data: Partial<{
    name: string;
    email: string;
    phone: string;
    licenseNumber: string;
    licenseExpiry: string;
    safetyScore: number;
    status: string;
  }>) => axiosInstance.put(`/drivers/${id}`, data),

  deleteDriver: (id: string) =>
    axiosInstance.delete(`/drivers/${id}`)
};
