import { axiosInstance } from "../lib/axios";
import { Vehicle } from "../types";

export const vehiclesApi = {
  getVehicles: async () => {
    return axiosInstance.get<{ data: Vehicle[] }>('/vehicles');
  },
  createVehicle: async (vehicle: Partial<Vehicle>) => {
    return axiosInstance.post('/vehicles', vehicle);
  },
  updateVehicle: async (id: string, vehicle: Partial<Vehicle>) => {
    return axiosInstance.put(`/vehicles/${id}`, vehicle);
  },
  deleteVehicle: async (id: string) => {
    return axiosInstance.delete(`/vehicles/${id}`);
  }
};
