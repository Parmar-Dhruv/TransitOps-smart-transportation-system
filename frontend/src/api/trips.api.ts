import { axiosInstance } from "../lib/axios";

export const tripsApi = {
  getTrips: (params?: { status?: string; page?: number; limit?: number }) =>
    axiosInstance.get('/api/v1/trips', { params }),

  createTrip: (data: {
    vehicleId: string;
    driverId: string;
    routeDetails: string;
    cargoWeight: number;
    startOdometer?: number;
    startTime?: string;
    revenue?: number;
  }) => axiosInstance.post('/api/v1/trips', data),

  dispatchTrip: (id: string) =>
    axiosInstance.post(`/api/v1/trips/${id}/dispatch`),

  completeTrip: (id: string, data?: { endOdometer?: number; fuelUsed?: number; endTime?: string }) =>
    axiosInstance.post(`/api/v1/trips/${id}/complete`, data),

  cancelTrip: (id: string, data?: { cancelReason?: string }) =>
    axiosInstance.post(`/api/v1/trips/${id}/cancel`, data),

  deleteTrip: (id: string) =>
    axiosInstance.delete(`/api/v1/trips/${id}`)
};
