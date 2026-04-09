// import axiosInstance from "./axios";

// export const leaveApi = {
//   // Apply Leave
//   applyLeave: async (data) => {
//     const res = await axiosInstance.post("/leaves", data);
//     return res.data.data;
//   },

//   // Get My Leaves
//   getMyLeaves: async () => {
//     const res = await axiosInstance.get("/leaves/my");
//     return res.data.data; 
//   },

//   // Get Leave Balance
//   getLeaveBalance: async () => {
//     const res = await axiosInstance.get("/leaves/balance");
//     return res.data.data;
//   },

//   // Manager: Pending Leaves
//   getPendingLeaves: async () => {
//     const res = await axiosInstance.get("/leaves/pending-manager");
//     return res.data.data;
//   },

//   // Manager: Review Leave
//   reviewLeave: async (id, data) => {
//     const res = await axiosInstance.patch(`/leaves/${id}/review`, data);
//     return res.data.data;
//   },
// };
import axiosInstance from "./axios";

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Request interceptor to add abort controller support
const abortControllers = new Map();

export const leaveApi = {
  // Apply Leave
  applyLeave: async (data, options = {}) => {
    try {
      const res = await axiosInstance.post("/leaves", data, {
        signal: options.signal
      });
      return res.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw error.response?.data || { 
        success: false, 
        message: "Failed to apply leave" 
      };
    }
  },

  // Get My Leaves
  getMyLeaves: async (options = {}) => {
    try {
      const res = await axiosInstance.get("/leaves/my", {
        signal: options.signal
      });
      return res.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw error.response?.data || { 
        success: false, 
        message: "Failed to fetch your leaves" 
      };
    }
  },

  // Get Leave Balance
  getLeaveBalance: async (options = {}) => {
    try {
      const res = await axiosInstance.get("/leaves/balance", {
        signal: options.signal
      });
      return res.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw error.response?.data || { 
        success: false, 
        message: "Failed to fetch leave balance" 
      };
    }
  },

  // Manager: Pending Leaves
  getPendingLeaves: async (options = {}) => {
    try {
      const res = await axiosInstance.get("/leaves/pending-manager", {
        signal: options.signal
      });
      return res.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw error.response?.data || { 
        success: false, 
        message: "Failed to fetch pending leaves" 
      };
    }
  },

  // Manager: Review Leave
  reviewLeave: async (id, data, options = {}) => {
    try {
      const res = await axiosInstance.patch(`/leaves/${id}/review`, data, {
        signal: options.signal
      });
      return res.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw error.response?.data || { 
        success: false, 
        message: "Failed to review leave" 
      };
    }
  },

  // Cancel Leave Request
  cancelLeave: async (id, options = {}) => {
    try {
      const res = await axiosInstance.patch(`/leaves/${id}/cancel`, {}, {
        signal: options.signal
      });
      return res.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw error.response?.data || { 
        success: false, 
        message: "Failed to cancel leave" 
      };
    }
  },

  // Get Leave Details by ID
  getLeaveById: async (id, options = {}) => {
    try {
      const res = await axiosInstance.get(`/leaves/${id}`, {
        signal: options.signal
      });
      return res.data;
    } catch (error) {
      if (error.name === 'AbortError') {
        throw error;
      }
      throw error.response?.data || { 
        success: false, 
        message: "Failed to fetch leave details" 
      };
    }
  }
};

// Helper to cancel ongoing requests
export const cancelLeaveRequest = (requestId) => {
  const controller = abortControllers.get(requestId);
  if (controller) {
    controller.abort();
    abortControllers.delete(requestId);
  }
};