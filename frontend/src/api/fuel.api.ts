import { axiosInstance } from "../lib/axios";

export const fuelApi = {
  getFuelLogs: (params?: { vehicleId?: string; driverId?: string; page?: number; limit?: number }) =>
    axiosInstance.get('/api/v1/fuel', { params }),

  createFuelLog: (data: {
    vehicleId: string;
    driverId: string;
    liters: number;
    costPerLiter: number;
    odometer: number;
    refuelDate: string;
  }) => axiosInstance.post('/api/v1/fuel', data),

  deleteFuelLog: (id: string) =>
    axiosInstance.delete(`/api/v1/fuel/${id}`)
};
