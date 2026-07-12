import { axiosInstance } from "../lib/axios";

export const reportsApi = {
  getFleetReport: () =>
    axiosInstance.get('/api/v1/reports/fleet'),

  getVehiclesReport: () =>
    axiosInstance.get('/api/v1/reports/vehicles'),

  getDriversReport: () =>
    axiosInstance.get('/api/v1/reports/drivers'),

  getTripsReport: () =>
    axiosInstance.get('/api/v1/reports/trips'),

  exportVehiclesCSV: () =>
    axiosInstance.get('/api/v1/reports/export/vehicles', { responseType: 'blob' }),

  exportDriversCSV: () =>
    axiosInstance.get('/api/v1/reports/export/drivers', { responseType: 'blob' }),

  exportTripsCSV: () =>
    axiosInstance.get('/api/v1/reports/export/trips', { responseType: 'blob' })
};
