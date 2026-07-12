import { axiosInstance } from "../lib/axios";

const EXPENSE_CATEGORIES = [
  'TOLL', 'PARKING', 'DRIVER_ALLOWANCE', 'REPAIR',
  'MAINTENANCE', 'INSURANCE', 'PERMIT', 'FINE', 'MISCELLANEOUS'
] as const;

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const expensesApi = {
  getExpenses: (params?: { vehicleId?: string; driverId?: string; tripId?: string; category?: ExpenseCategory; page?: number; limit?: number }) =>
    axiosInstance.get('/api/v1/expenses', { params }),

  createExpense: (data: {
    amount: number;
    category: ExpenseCategory;
    date: string;
    description: string;
    vehicleId?: string | null;
    driverId?: string | null;
    tripId?: string | null;
  }) => axiosInstance.post('/api/v1/expenses', data),

  updateExpense: (id: string, data: Partial<{
    amount: number;
    category: ExpenseCategory;
    date: string;
    description: string;
  }>) => axiosInstance.put(`/api/v1/expenses/${id}`, data),

  deleteExpense: (id: string) =>
    axiosInstance.delete(`/api/v1/expenses/${id}`)
};
