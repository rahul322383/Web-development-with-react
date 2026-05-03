import api from './axios';


// ─────────────────────────────────────────
// 🟢 EMPLOYEE ATTENDANCE APIs
// ─────────────────────────────────────────

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


// ─────────────────────────────────────────
// 🔵 ADMIN / HR ATTENDANCE APIs
// ─────────────────────────────────────────

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


// ─────────────────────────────────────────
// 🟣 SHIFT MANAGEMENT APIs
// ─────────────────────────────────────────

// ➕ Create shift
export const createShift = (payload) => {
    return api.post('/shifts', payload);
};

// 📋 List all shifts
export const getShifts = () => {
    return api.get('/shifts');
};

// ✏️ Update shift
export const updateShift = (id, payload) => {
    return api.put(`/shifts/${id}`, payload);
};

// ❌ Delete shift
export const deleteShift = (id) => {
    return api.delete(`/shifts/${id}`);
};


// ─────────────────────────────────────────
// 🟡 SHIFT ASSIGNMENT APIs
// ─────────────────────────────────────────

// 👤 Assign shift to employee
export const assignShift = (payload) => {
    return api.post('/shifts/assign', payload);
};

// 📜 Get employee shift history
export const getEmployeeShiftHistory = (employeeId) => {
    return api.get(`/shifts/history/${employeeId}`);
};


// ─────────────────────────────────────────
// 🔴 SHIFT REPORT APIs
// ─────────────────────────────────────────

// 📊 Get shift report
export const getShiftReport = (params) => {
    return api.get('/shifts/report', { params });
};