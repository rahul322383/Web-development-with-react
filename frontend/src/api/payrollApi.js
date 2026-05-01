// import axiosInstance from './axios';
// import { handleRequest } from '../utils/apiHandler';

// export const payrollApi = {
//   getMyPayrollHistory: (params) =>
//     handleRequest(() =>
//       axiosInstance.get('/payroll/my/history', { params })
//     ),

//   getYTDSummary: () =>
//     handleRequest(() =>
//       axiosInstance.get('/payroll/ytd')
//     ),

//   getSalaryBreakdown: (id) =>
//     handleRequest(() =>
//       axiosInstance.get(`/payroll/${id}/breakdown`)
//     ),

//   downloadPayslip: async (id) => {
//     try {
//       const res = await axiosInstance.get(
//         `/payroll/${id}/payslip`,
//         { responseType: 'blob' }
//       );

//       let filename = 'payslip.pdf';
//       const disposition = res.headers['content-disposition'];

//       if (disposition) {
//         const match = disposition.match(/filename="?(.+)"?/);
//         if (match) filename = match[1];
//       }

//       return { blob: res.data, filename };
//     } catch (error) {
//       throw new Error(
//         error.response?.data?.message || 'Download failed'
//       );
//     }
//   },

//   // Admin
//   processPayroll: (payload) =>
//     handleRequest(() =>
//       axiosInstance.post('/payroll/process', payload)
//     ),

//   lockPayroll: (payload) =>
//     handleRequest(() =>
//       axiosInstance.patch('/payroll/lock', payload)
//     ),
// };

// src/api/payrollApi.js
// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for every payroll API call.
//
// KEY DESIGN DECISIONS:
//   • All functions THROW on error (so React Query / try-catch works correctly).
//     Previously handleRequest swallowed errors and returned { data, error } —
//     that broke useMutation onSuccess/onError and required callers to manually
//     check `error` every time.
//   • Response shapes are normalised here so every caller gets a clean object.
//   • Month is always sent as a Number (1-12). The Postman docs showing "April"
//     were wrong — the Joi schema enforces an integer.
// ─────────────────────────────────────────────────────────────────────────────

import axiosInstance from './axios'; // your configured Axios instance

// ─────────────────────────────────────────────────────────────────────────────
// INTERNAL HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Unwrap a successful Axios response and surface the backend `data` field.
 * Backend always responds: { success, message?, data?, ... }
 */
const unwrap = (res) => res.data;

/**
 * Pull the inner payload out of the standard backend envelope.
 * { success: true, data: <payload> }  →  <payload>
 */
const payload = (res) => res.data?.data ?? res.data;

/**
 * Normalise any error into a plain Error so React Query receives a proper
 * rejection. Axios wraps HTTP errors in err.response.data.
 */
const normaliseError = (err) => {
  const msg =
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    'Request failed';
  const error = new Error(msg);
  error.statusCode = err?.response?.status ?? 500;
  error.raw = err?.response?.data ?? null;
  throw error;           // always throw — never swallow
};

// ─────────────────────────────────────────────────────────────────────────────
// EMPLOYEE ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /payroll/my/history
 * Returns the logged-in employee's full payroll history.
 * Response: Payroll[] (each with nested `items`)
 */
export const getMyPayrollHistory = async () => {
  try {
    const res = await axiosInstance.get('/payroll/my/history');
    // backend: { success, data: Payroll[] }
    const data = payload(res);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return normaliseError(err);
  }
};

/**
 * GET /payroll/ytd?employeeId=&year=
 * Year-to-date summary.
 *
 * BUG FIX: backend returns { grossEarnings, netSalary, totalTDS, totalPF, … }
 * YTDCards expects                { totalGross,   totalNet,   totalTDS, totalPF, … }
 * We remap here so callers never have to worry about the mismatch.
 *
 * @param {object} [params]
 * @param {number} [params.employeeId]  omit to use logged-in user
 * @param {number} [params.year]        defaults to current year on the server
 */
export const getYTDSummary = async (params = {}) => {
  try {
    const res = await axiosInstance.get('/payroll/ytd', { params });
    const data = payload(res) ?? {};

    // Remap backend field names → what the UI components expect
    return {
      totalGross: data.grossEarnings ?? data.totalGross ?? 0,
      totalNet: data.netSalary ?? data.totalNet ?? 0,
      totalTDS: data.totalTDS ?? 0,
      totalPF: data.totalPF ?? 0,
      totalBonus: data.totalBonus ?? 0,
      totalOvertimePay: data.totalOvertimePay ?? 0,
      monthsProcessed: data.monthsProcessed ?? 0,
      employeeId: data.employeeId,
      year: data.year,
    };
  } catch (err) {
    return normaliseError(err);
  }
};

/**
 * GET /payroll/:payrollId/breakdown
 * Full earnings + deductions for one payroll record.
 * Returns the Payroll object with nested `items` and `employee`.
 */
export const getSalaryBreakdown = async (payrollId) => {
  if (!payrollId) throw new Error('payrollId is required');
  try {
    const res = await axiosInstance.get(`/payroll/${payrollId}/breakdown`);
    return payload(res); // Payroll { id, month, year, netSalary, items, employee }
  } catch (err) {
    return normaliseError(err);
  }
};

/**
 * GET /payroll/:payrollId/payslip
 * Streams a PDF. Returns { blob: Blob, filename: string }.
 */
export const downloadPayslip = async (payrollId) => {
  if (!payrollId) throw new Error('payrollId is required');
  try {
    const res = await axiosInstance.get(`/payroll/${payrollId}/payslip`, {
      responseType: 'blob',
    });

    const disposition = res.headers?.['content-disposition'] ?? '';
    const match = disposition.match(/filename[^;=\n]*=(['"]?)([^'";\n]+)\1/);
    const filename = match?.[2]?.trim() ?? `payslip_${payrollId}.pdf`;

    return { blob: res.data, filename };
  } catch (err) {
    return normaliseError(err);
  }
};

/**
 * GET /payroll/my/history  (alias used by EmployeePayroll page)
 */
export const getPayrollHistory = getMyPayrollHistory;

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN / HR ENDPOINTS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /payroll/process
 * Triggers payroll generation for all active employees.
 *
 * BUG FIX: month must be an integer 1-12, NOT a string like "April".
 * The Joi schema on the backend enforces: Joi.number().integer().min(1).max(12)
 *
 * @param {{ month: number, year: number }} payload
 */
export const processPayroll = async ({ month, year }) => {
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (isNaN(m) || m < 1 || m > 12) throw new Error('month must be an integer between 1 and 12');
  if (isNaN(y) || y < 2000) throw new Error('year must be a valid integer ≥ 2000');

  try {
    const res = await axiosInstance.post('/payroll/process', { month: m, year: y });
    return unwrap(res);
    // { success, message, month, year, processedCount, totalAmount, results[] }
  } catch (err) {
    return normaliseError(err);
  }
};

/**
 * PATCH /payroll/lock
 * Locks (finalises) a payroll record. Irreversible.
 *
 * BUG FIX: previously handleRequest returned { data, error } so
 * useMutation's onSuccess received that wrapper instead of the real response,
 * and onError was never called on failure. Now we throw, letting React Query
 * route to onSuccess / onError correctly.
 *
 * @param {{ payrollId: number }} payload
 */
export const lockPayroll = async ({ payrollId }) => {
  const id = parseInt(payrollId, 10);
  if (isNaN(id) || id < 1) throw new Error('payrollId must be a positive integer');
  try {
    const res = await axiosInstance.patch('/payroll/lock', { payrollId: id });
    return unwrap(res);
    // { success, message, data: { id, status: 'Locked', … } }
  } catch (err) {
    return normaliseError(err);
  }
};

/**
 * GET /payroll/monthly-summary?month=&year=
 * HR bulk view for a given month.
 *
 * BUG FIX: AdminPayroll was passing this directly as a React Query queryFn,
 * which caused React Query's QueryFunctionContext object to be passed as the
 * first argument instead of month/year.
 * Callers must now do: queryFn: () => getMonthlySummary(month, year)
 *
 * @param {number} month  1-12
 * @param {number} year
 */
export const getMonthlySummary = async (month, year) => {
  const m = parseInt(month, 10);
  const y = parseInt(year, 10);

  if (isNaN(m) || m < 1 || m > 12) throw new Error('month must be an integer between 1 and 12');
  if (isNaN(y)) throw new Error('year is required');

  try {
    const res = await axiosInstance.get('/payroll/monthly-summary', { params: { month: m, year: y } });
    const data = payload(res) ?? {};
    // { month, year, count, totals: { totalGross, totalNet, totalTDS, totalPF }, records[] }
    return data;
  } catch (err) {
    return normaliseError(err);
  }
};

/**
 * GET /payroll/employee/:employeeId
 * HR viewing any employee's full payroll history.
 * Returns Payroll[] normalised so callers always get a plain array.
 *
 * BUG FIX: EmployeeLookupCard accessed data?.records which was undefined.
 * Backend returns { success, data: Payroll[] }. We extract and return the
 * array directly so the component just does Array.isArray(data) checks.
 */
export const getPayrollByEmployee = async (employeeId) => {
  const id = parseInt(employeeId, 10);
  if (isNaN(id) || id < 1) throw new Error('employeeId must be a positive integer');
  try {
    const res = await axiosInstance.get(`/payroll/employee/${id}`);
    const data = payload(res);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return normaliseError(err);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// NAMED EXPORT OBJECT  (drop-in replacement for import { payrollApi })
// ─────────────────────────────────────────────────────────────────────────────
export const payrollApi = {
  getMyPayrollHistory,
  getPayrollHistory,
  getYTDSummary,
  getSalaryBreakdown,
  downloadPayslip,
  processPayroll,
  lockPayroll,
  getMonthlySummary,
  getPayrollByEmployee,
};

export default payrollApi;