import api from './axios';

// ─── Employee APIs ─────────────────────────

// ✅ Check-in
export const checkIn = (payload) => {
    return api.post('/attendance/checkin', payload);
};

// ✅ Check-out
export const checkOut = (payload) => {
    return api.patch('/attendance/checkout', payload);
};

// ✅ Get my attendance
export const getMyAttendance = (params) => {
    return api.get('/attendance/my', { params });
};


// ─── Admin / HR / Manager APIs ─────────────

// 📊 Today summary
export const getTodaySummary = () => {
    return api.get('/attendance/today');
};

// 📊 Team report
export const getTeamReport = (params) => {
    return api.get('/attendance/report', { params });
};

// ⏱️ Overtime summary
export const getOvertimeSummary = (params) => {
    return api.get('/attendance/overtime-summary', { params });
};

// 🛠️ Admin create/update record
export const adminRecord = (payload) => {
    return api.post('/attendance/admin', payload);
};

// 🔍 Get attendance by ID
export const getAttendanceById = (id) => {
    return api.get(`/attendance/${id}`);
};