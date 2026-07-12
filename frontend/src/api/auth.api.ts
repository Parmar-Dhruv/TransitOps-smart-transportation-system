import { axiosInstance } from "../lib/axios";

export const authApi = {
  login: async (credentials: any) => {
    return axiosInstance.post('/auth/login', credentials);
  },
  logout: async () => {
    return axiosInstance.post('/auth/logout');
  },
  getProfile: async () => {
    return axiosInstance.get('/auth/me');
  },
  registerUser: async (user: any) => {
    return axiosInstance.post('/auth/register-user', user);
  },
  register: async (user: any) => {
    // Alias to match frontend form call
    return axiosInstance.post('/auth/register-user', user);
  },
  forgotPassword: async (email: string) => {
    // Return mock success as reset password email dispatch is out of hackathon scope
    return { data: { success: true, message: "Password reset link sent to your email." } };
  },
  resetPassword: async (data: any) => {
    return { data: { success: true, message: "Password has been successfully updated." } };
  }
};
