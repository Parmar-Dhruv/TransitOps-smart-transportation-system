import { axiosInstance } from "../lib/axios";

export const driversApi = {
  getDrivers: async () => {
    return axiosInstance.get('/drivers');
    // Returns: { data: { success, message, data: { drivers: [], pagination: {} } } }
  },
  createDriver: async (driver: any) => {
    return axiosInstance.post('/drivers', driver);
  },
  updateDriver: async (id: string, driver: any) => {
    return axiosInstance.put(`/drivers/${id}`, driver);
  },
  deleteDriver: async (id: string) => {
    return axiosInstance.delete(`/drivers/${id}`);
  }
};
