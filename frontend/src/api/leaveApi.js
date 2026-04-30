// import axiosInstance from "./axios";


// export const leaveApi = {
//   applyLeave: async (data, options = {}) => {
//     const res = await axiosInstance.post("/leaves", data, {
//       signal: options.signal
//     });
//     return res.data;
//   },

//   getMyLeaves: async (options = {}) => {
//     const res = await axiosInstance.get("/leaves/my", {
//       signal: options.signal
//     });
//     return res.data;
//   },

//   getLeaveBalance: async (options = {}) => {
//     const res = await axiosInstance.get("/leaves/balance", {
//       signal: options.signal
//     });
//     return res.data;
//   },

//   getPendingLeaves: async (options = {}) => {
//     const res = await axiosInstance.get("/leaves/pending-manager", {
//       signal: options.signal
//     });
//     return res.data;
//   },

//   reviewLeave: async (id, data, options = {}) => {
//     const res = await axiosInstance.patch(`/leaves/${id}/review`, data, {
//       signal: options.signal
//     });
//     return res.data;
//   },

//   getTeamLeaves: async (options = {}) => {
//     const res = await axiosInstance.get("/leaves/team", {
//       signal: options.signal
//     });
//     return res.data;
//   },

//   getLeaveStats: async (options = {}) => {
//     const res = await axiosInstance.get("/leaves/stats", {
//       signal: options.signal
//     });
//     return res.data;
//   },

//   cancelLeave: async (id, options = {}) => {
//     const res = await axiosInstance.patch(`/leaves/${id}/review`, {}, {
//       signal: options.signal
//     });
//     return res.data;
//   },

//   getLeaveById: async (id, options = {}) => {
//     const res = await axiosInstance.get(`/leaves/${id}`, {
//       signal: options.signal
//     });
//     return res.data;
//   }


// };
import axiosInstance from "./axios";

export const leaveApi = {
  applyLeave: async (data, options = {}) => {
    const res = await axiosInstance.post("/leaves", data, {
      signal: options.signal
    });
    return res.data;
  },

  getMyLeaves: async (options = {}) => {
    const res = await axiosInstance.get("/leaves/my", {
      signal: options.signal
    });
    return res.data;
  },

  getLeaveBalance: async (options = {}) => {
    const res = await axiosInstance.get("/leaves/balance", {
      signal: options.signal
    });
    return res.data;
  },

  getPendingLeaves: async (options = {}) => {
    const res = await axiosInstance.get("/leaves/pending-manager", {
      signal: options.signal
    });
    return res.data;
  },

  reviewLeave: async (id, data, options = {}) => {
    const res = await axiosInstance.patch(`/leaves/${id}/review`, data, {
      signal: options.signal
    });
    return res.data;
  },

  getTeamLeaves: async (options = {}) => {
    const res = await axiosInstance.get("/leaves/team", {
      signal: options.signal
    });
    return res.data;
  },

  getLeaveStats: async (options = {}) => {
    const res = await axiosInstance.get("/leaves/stats", {
      signal: options.signal
    });
    return res.data;
  },

  // 🔧 FIX 3: Proper cancel endpoint (must exist on backend)
  cancelLeave: async (id, options = {}) => {
    const res = await axiosInstance.patch(`/leaves/${id}/cancel`, {}, {
      signal: options.signal,
    });
    return res.data;
  },

  getLeaveById: async (id, options = {}) => {
    const res = await axiosInstance.get(`/leaves/${id}`, {
      signal: options.signal
    });
    return res.data;
  }
};