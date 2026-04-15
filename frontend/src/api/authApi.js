// // // import axiosInstance from "./axios";

// // // const unwrap = (res) => res?.data?.data;

// // // export const authApi = {
// // //   register: async (userData) => {
// // //     const res = await axiosInstance.post("/auth/register", userData);
// // //     return unwrap(res);
// // //   },

// // //   login: async (credentials) => {
// // //     const res = await axiosInstance.post("/auth/login", credentials);
// // //     return unwrap(res);
// // //   },

// // //   logout: async () => {
// // //     const res = await axiosInstance.post("/auth/logout");
// // //     return res.data;
// // //   },

// // //   getMe: async () => {
// // //     const res = await axiosInstance.get("/auth/me");
// // //     return unwrap(res);
// // //   },

// // //   refreshToken: async (refreshToken) => {
// // //     const res = await axiosInstance.post("/auth/refresh-token", {
// // //       refreshToken
// // //     });
// // //     return unwrap(res);
// // //   }
// // // };

// // import axiosInstance from "./axios";

// // // DON'T double unwrap blindly
// // export const authApi = {
// //   register: async (userData) => {
// //     const res = await axiosInstance.post("/auth/register", userData);
// //     return res.data; // ✅ FIX HERE
// //   },

// //   login: async (credentials) => {
// //     const res = await axiosInstance.post("/auth/login", credentials);
// //     return res.data;
// //   },

// //   logout: async () => {
// //     const res = await axiosInstance.post("/auth/logout");
// //     return res.data;
// //   },

// //   getMe: async () => {
// //     const res = await axiosInstance.get("/auth/me");
// //     return res.data;
// //   },

// //   refreshToken: async (refreshToken) => {
// //     const res = await axiosInstance.post("/auth/refresh-token", {
// //       refreshToken
// //     });
// //     return res.data;
// //   }
// // };


// import axiosInstance from "./axios";

// export const authApi = {
//   register: async (userData) => {
//     const res = await axiosInstance.post("/auth/register", userData);
//     return res.data; // Returns the full response with success and data properties
//   },

//   login: async (credentials) => {
//     const res = await axiosInstance.post("/auth/login", credentials);
//     return res.data;
//   },

//   logout: async () => {
//     const res = await axiosInstance.post("/auth/logout");
//     return res.data;
//   },

//   getMe: async () => {
//     const res = await axiosInstance.get("/auth/me");
//     return res.data;
//   },

//   refreshToken: async (refreshToken) => {
//     const res = await axiosInstance.post("/auth/refresh-token", {
//       refreshToken
//     });
//     return res.data;
//   }
// };

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

  logout: async () => {
    const res = await axiosInstance.post("/auth/logout");
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
  }
};