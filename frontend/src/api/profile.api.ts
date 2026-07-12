import { axiosInstance } from "../lib/axios";

export const profileApi = {
  getProfile: async () => {
    return axiosInstance.get('/users/profile');
  },
  updateProfile: async (data: { name?: string; phone?: string | null; department?: string | null; designation?: string | null }) => {
    return axiosInstance.patch('/users/profile', data);
  },
  uploadPhoto: async (formData: FormData) => {
    return axiosInstance.post('/users/profile/photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deletePhoto: async () => {
    return axiosInstance.delete('/users/profile/photo');
  },
  changePassword: async (data: any) => {
    return axiosInstance.patch('/users/change-password', data);
  }
};
