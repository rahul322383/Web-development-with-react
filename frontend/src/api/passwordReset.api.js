// src/api/passwordReset.api.js
import axiosInstance from './axios'; // adjust to your axios instance

const passwordResetAPI = {
    forgotPassword: (email) =>
        axiosInstance.post('/password/forgot-password', { email }).then(r => r.data),

    verifyResetToken: (token) =>
        axiosInstance.get(`/password/verify-reset-token?token=${token}`).then(r => r.data),

    resetPassword: (token, newPassword) =>
        axiosInstance.post('/password/reset-password', { token, newPassword }).then(r => r.data),

    // FIX: pass userId so backend service receives all 3 required args
    changePassword: (userId, currentPassword, newPassword) =>
        axiosInstance.post('/password/change-password', { userId, currentPassword, newPassword }).then(r => r.data),
};

export default passwordResetAPI;