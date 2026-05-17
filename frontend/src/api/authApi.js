import axiosInstance from "./axios";

export const authApi = {
  register: async (userData) => {
    const res = await axiosInstance.post("/auth/register", userData);
    return res.data; // Returns { success: true, data: { ... } }
  },

  login: async (credentials) => {
    const res = await axiosInstance.post("/auth/login", credentials);
    return res.data; // Returns { success: true, data: { ... } }
  },

  logout: async (refreshToken) => {
    const res = await axiosInstance.post("/auth/logout", { refreshToken });
    return res.data;
  },
  getMe: async () => {
    const res = await axiosInstance.get("/auth/me");
    return res.data; // Returns { success: true, data: { ... } }
  },

  refreshToken: async (refreshToken) => {
    const res = await axiosInstance.post("/auth/refresh-token", {
      refreshToken
    });
    return res.data;
  },  

  updateProfile: async (profileData) => {
    const res = await axiosInstance.patch("/auth/profile", profileData);
    return res.data;
  }
};