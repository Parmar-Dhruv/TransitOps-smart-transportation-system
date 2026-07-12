import { axiosInstance } from "../lib/axios";

export const tripsApi = {
  getTrips: async () => {
    // return axiosInstance.get('/trips');
    return { data: [] };
  },
  createTrip: async (trip: any) => {
    return axiosInstance.post('/trips', trip);
  },
  dispatchTrip: async (id: string) => {
    return axiosInstance.post(`/trips/${id}/dispatch`);
  },
  completeTrip: async (id: string) => {
    return axiosInstance.post(`/trips/${id}/complete`);
  },
  cancelTrip: async (id: string) => {
    return axiosInstance.post(`/trips/${id}/cancel`);
  },
};
