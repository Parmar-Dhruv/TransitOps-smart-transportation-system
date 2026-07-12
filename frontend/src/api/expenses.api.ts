import { axiosInstance } from "../lib/axios";

export const expensesApi = {
  getExpenses: async () => {
    return axiosInstance.get('/api/v1/expenses');
  },
  createExpense: async (expense: any) => {
    return axiosInstance.post('/api/v1/expenses', expense);
  },
  deleteExpense: async (id: string) => {
    return axiosInstance.delete(`/api/v1/expenses/${id}`);
  }
};
