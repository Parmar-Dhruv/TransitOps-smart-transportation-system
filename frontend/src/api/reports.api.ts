import { axiosInstance } from "../lib/axios";

export const reportsApi = {
  getFleetSummary: async () => {
    return axiosInstance.get('/api/v1/reports/fleet');
  },
  getVehiclesReport: async () => {
    return axiosInstance.get('/api/v1/reports/vehicles');
  },
  getDriversReport: async () => {
    return axiosInstance.get('/api/v1/reports/drivers');
  },
  getTripsReport: async () => {
    return axiosInstance.get('/api/v1/reports/trips');
  },
  exportVehiclesCSV: () => {
    return `${axiosInstance.defaults.baseURL || ''}/api/v1/reports/export/vehicles`;
  },
  exportDriversCSV: () => {
    return `${axiosInstance.defaults.baseURL || ''}/api/v1/reports/export/drivers`;
  },
  exportTripsCSV: () => {
    return `${axiosInstance.defaults.baseURL || ''}/api/v1/reports/export/trips`;
  }
};
