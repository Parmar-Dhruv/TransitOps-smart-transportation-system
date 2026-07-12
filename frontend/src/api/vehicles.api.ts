import { axiosInstance } from "../lib/axios";

export const vehiclesApi = {
  getVehicles: (params?: { search?: string; status?: string; page?: number; limit?: number }) =>
    axiosInstance.get('/vehicles', { params }),

  getVehicle: (id: string) =>
    axiosInstance.get(`/vehicles/${id}`),

  createVehicle: (data: {
    registrationNumber: string;
    make: string;
    model: string;
    year: number;
    capacity: number;
    odometer: number;
    status?: string;
  }) => axiosInstance.post('/vehicles', data),

  updateVehicle: (id: string, data: Partial<{
    registrationNumber: string;
    make: string;
    model: string;
    year: number;
    capacity: number;
    odometer: number;
    status: string;
  }>) => axiosInstance.put(`/vehicles/${id}`, data),

  deleteVehicle: (id: string) =>
    axiosInstance.delete(`/vehicles/${id}`)
};
