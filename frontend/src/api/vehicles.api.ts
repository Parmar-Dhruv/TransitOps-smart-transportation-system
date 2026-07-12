import { axiosInstance } from "../lib/axios";

export const vehiclesApi = {
  getVehicles: async () => {
    return axiosInstance.get('/vehicles');
    // Returns: { data: { success, message, data: { vehicles: [], pagination: {} } } }
  },
  createVehicle: async (vehicle: any) => {
    return axiosInstance.post('/vehicles', vehicle);
  },
  updateVehicle: async (id: string, vehicle: any) => {
    return axiosInstance.put(`/vehicles/${id}`, vehicle);
  },
  deleteVehicle: async (id: string) => {
    return axiosInstance.delete(`/vehicles/${id}`);
  }
};
