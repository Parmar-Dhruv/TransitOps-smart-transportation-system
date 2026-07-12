import { axiosInstance } from "../lib/axios";

export const tripsApi = {
  getTrips: async () => {
    return axiosInstance.get('/api/v1/trips');
  },
  createTrip: async (trip: any) => {
    return axiosInstance.post('/api/v1/trips', trip);
  },
  dispatchTrip: async (id: string) => {
    return axiosInstance.post(`/api/v1/trips/${id}/dispatch`);
  },
  completeTrip: async (id: string, details?: any) => {
    return axiosInstance.post(`/api/v1/trips/${id}/complete`, details);
  },
  cancelTrip: async (id: string, details?: any) => {
    return axiosInstance.post(`/api/v1/trips/${id}/cancel`, details);
  },
};
