import { axiosInstance } from "../lib/axios";
import { Driver } from "../types";

export const driversApi = {
  getDrivers: async () => {
    return axiosInstance.get<{ data: Driver[] }>('/drivers');
  },
  createDriver: async (driver: Partial<Driver>) => {
    return axiosInstance.post('/drivers', driver);
  },
  updateDriver: async (id: string, driver: Partial<Driver>) => {
    return axiosInstance.put(`/drivers/${id}`, driver);
  },
  deleteDriver: async (id: string) => {
    return axiosInstance.delete(`/drivers/${id}`);
  }
};
