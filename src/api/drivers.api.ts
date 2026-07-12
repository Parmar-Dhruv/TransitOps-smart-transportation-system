import { axiosInstance } from "../lib/axios";
import { Driver } from "../types";

export const driversApi = {
  getDrivers: async () => {
    // return axiosInstance.get<Driver[]>('/drivers');
    return { data: [] as Driver[] };
  }
};
