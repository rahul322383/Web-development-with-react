import axiosInstance from "./axios";

export const leaveApi = {
  // Apply Leave
  applyLeave: async (data) => {
    const res = await axiosInstance.post("/leaves", data);
    return res.data.data;
  },

  // Get My Leaves
  getMyLeaves: async () => {
    const res = await axiosInstance.get("/leaves/my");
    return res.data.data; 
  },

  // Get Leave Balance
  getLeaveBalance: async () => {
    const res = await axiosInstance.get("/leaves/balance");
    return res.data.data;
  },

  // Manager: Pending Leaves
  getPendingLeaves: async () => {
    const res = await axiosInstance.get("/leaves/pending-manager");
    return res.data.data;
  },

  // Manager: Review Leave
  reviewLeave: async (id, data) => {
    const res = await axiosInstance.patch(`/leaves/${id}/review`, data);
    return res.data.data;
  },
};