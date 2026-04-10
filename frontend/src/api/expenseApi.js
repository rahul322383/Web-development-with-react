import axiosInstance from "./axios";

// 🔥 Abort controllers (for cancel requests)
const controllers = {};

const createController = (key) => {
  if (controllers[key]) {
    controllers[key].abort();
  }
  controllers[key] = new AbortController();
  return controllers[key];
};

export const cancelExpenseRequest = (key) => {
  if (controllers[key]) {
    controllers[key].abort();
  }
};

export const expenseApi = {

  // ✅ Submit Expense (with file upload)
  submitExpense: async (formData) => {
    const controller = createController('submitExpense');

    const res = await axiosInstance.post('/expenses', formData, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data;
  },

  // ✅ My Expenses
  getMyExpenses: async () => {
    const controller = createController('getMyExpenses');

    const res = await axiosInstance.get('/expenses/my', {
      signal: controller.signal,
    });

    return res.data;
  },

  // ✅ Manager Pending
  getPendingManagerExpenses: async () => {
    const controller = createController('getPendingManagerExpenses');

    const res = await axiosInstance.get('/expenses/pending-manager', {
      signal: controller.signal,
    });

    return res.data;
  },

  // ✅ Finance Pending
  getPendingFinanceExpenses: async () => {
    const controller = createController('getPendingFinanceExpenses');

    const res = await axiosInstance.get('/expenses/pending-finance', {
      signal: controller.signal,
    });

    return res.data;
  },

  // ✅ Manager Review
  managerReview: async (id, payload) => {
    const controller = createController(`managerReview-${id}`);

    const res = await axiosInstance.patch(
      `/expenses/${id}/manager-review`,
      payload,
      { signal: controller.signal }
    );

    return res.data;
  },

  // ✅ Finance Review
  financeReview: async (id, payload) => {
    const controller = createController(`financeReview-${id}`);

    const res = await axiosInstance.patch(
      `/expenses/${id}/finance-review`,
      payload,
      { signal: controller.signal }
    );

    return res.data;
  },
};