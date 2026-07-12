import { axiosInstance } from "../lib/axios";

export const fuelApi = {
  getFuelLogs: async () => {
    return axiosInstance.get('/api/v1/fuel');
  },
  createFuelLog: async (log: any) => {
    return axiosInstance.post('/api/v1/fuel', log);
  },
  deleteFuelLog: async (id: string) => {
    return axiosInstance.delete(`/api/v1/fuel/${id}`);
  }
};
