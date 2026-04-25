import api from './axios';

const reportsAPI = {

    // 📊 Dashboard
    getDashboard: (params) =>
        api.get('/reports/dashboard', { params }).then(res => res.data),

    // 👥 Employees
    getEmployees: (params) =>
        api.get('/reports/employees', { params }).then(res => res.data),

    // 💰 Payroll
    getPayroll: (params) =>
        api.get('/reports/payroll', { params }).then(res => res.data),

    // 🏖️ Leave
    getLeave: (params) =>
        api.get('/reports/leave', { params }).then(res => res.data),

    // 🧾 Expenses
    getExpenses: (params) =>
        api.get('/reports/expenses', { params }).then(res => res.data),

    // 📥 Export CSV
    exportCSV: (module, params) =>
        api.get(`/reports/export/csv/${module}`, {
            params,
            responseType: 'blob'
        }),

    // 📄 Export PDF
    exportPDF: (module, params) =>
        api.get(`/reports/export/pdf/${module}`, {
            params,
            responseType: 'blob'
        }),

};

export default reportsAPI;