import api from './axios';

const passwordResetAPI = {

    // ==============================
    // 📩 FORGOT PASSWORD
    // ==============================
    forgotPassword: (payload) =>
        api.post('/auth/forgot-password', payload).then(res => res.data),

    // ==============================
    // 🔍 VERIFY RESET TOKEN
    // ==============================
    verifyResetToken: (params) =>
        api.get('/auth/verify-reset-token', { params }).then(res => res.data),

    // ==============================
    // 🔐 RESET PASSWORD
    // ==============================
    resetPassword: (payload) =>
        api.post('/auth/reset-password', payload).then(res => res.data),

    // ==============================
    // 🔑 CHANGE PASSWORD (LOGGED IN)
    // ==============================
    changePassword: (payload) =>
        api.post('/auth/change-password', payload).then(res => res.data),

};

export default passwordResetAPI;