'use strict';

const { sequelize } = require('../../database/initModels');
const { QueryTypes } = require('sequelize');

// ─── EMPLOYEE ────────────────────────────────────────────────────────────────

const getEmployeeSummary = () => sequelize.query(`
  SELECT
    COUNT(*)                                          AS total,
    SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END)   AS active,
    SUM(CASE WHEN is_active = 0 THEN 1 ELSE 0 END)   AS inactive,
    COUNT(DISTINCT department)                        AS totalDepartments
  FROM users
  WHERE role_id != (SELECT id FROM roles WHERE name = 'Admin')
`, { type: QueryTypes.SELECT });

const getEmployeesByDepartment = () => sequelize.query(`
  SELECT department, COUNT(*) AS total
  FROM users
  WHERE is_active = 1
  GROUP BY department
  ORDER BY total DESC
`, { type: QueryTypes.SELECT });

const getEmployeesByRole = () => sequelize.query(`
  SELECT r.name AS role, COUNT(u.id) AS total
  FROM users u
  JOIN roles r ON u.role_id = r.id
  GROUP BY r.name
`, { type: QueryTypes.SELECT });

const getNewHires = (from, to) => sequelize.query(`
  SELECT DATE(created_at) AS date, COUNT(*) AS count
  FROM users
  WHERE created_at BETWEEN :from AND :to
  GROUP BY DATE(created_at)
  ORDER BY date ASC
`, { replacements: { from, to }, type: QueryTypes.SELECT });

// ─── PAYROLL ─────────────────────────────────────────────────────────────────
// FIX: net_salary not net_pay | status: 'Draft','Processed','Locked'
// FIX: no pay_date — filter by year+month using BETWEEN on year/month cols

const getPayrollSummary = (from, to) => {
  // from/to are YYYY-MM-DD — extract year/month for filtering
  return sequelize.query(`
    SELECT
      COUNT(*)           AS totalPayrolls,
      SUM(net_salary)    AS totalNetSalary,
      AVG(net_salary)    AS avgNetSalary,
      MAX(net_salary)    AS maxNetSalary,
      MIN(net_salary)    AS minNetSalary,
      SUM(CASE WHEN status = 'Processed' THEN 1 ELSE 0 END) AS processed,
      SUM(CASE WHEN status = 'Draft'     THEN 1 ELSE 0 END) AS draft,
      SUM(CASE WHEN status = 'Locked'    THEN 1 ELSE 0 END) AS locked
    FROM payrolls
    WHERE STR_TO_DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-01'), '%Y-%m-%d')
          BETWEEN :from AND :to
  `, { replacements: { from, to }, type: QueryTypes.SELECT });
};

const getPayrollByDepartment = (from, to) => sequelize.query(`
  SELECT u.department,
         SUM(p.net_salary) AS totalNetSalary,
         COUNT(p.id)       AS count
  FROM payrolls p
  JOIN users u ON p.employee_id = u.id
  WHERE STR_TO_DATE(CONCAT(p.year, '-', LPAD(p.month, 2, '0'), '-01'), '%Y-%m-%d')
        BETWEEN :from AND :to
  GROUP BY u.department
  ORDER BY totalNetSalary DESC
`, { replacements: { from, to }, type: QueryTypes.SELECT });

const getPayrollTrend = (from, to) => sequelize.query(`
  SELECT CONCAT(year, '-', LPAD(month, 2, '0')) AS month,
         SUM(net_salary) AS total
  FROM payrolls
  WHERE STR_TO_DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-01'), '%Y-%m-%d')
        BETWEEN :from AND :to
  GROUP BY year, month
  ORDER BY year ASC, month ASC
`, { replacements: { from, to }, type: QueryTypes.SELECT });

// ─── LEAVE ───────────────────────────────────────────────────────────────────
// FIX: status values are 'Pending','Approved','Rejected' (capitalised)
// FIX: days_requested not total_days | no leave_type column

const getLeaveSummary = (from, to) => sequelize.query(`
  SELECT
    COUNT(*)                                                          AS total,
    SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END)             AS approved,
    SUM(CASE WHEN status = 'Pending'  THEN 1 ELSE 0 END)             AS pending,
    SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END)             AS rejected,
    SUM(CASE WHEN status = 'Approved' THEN days_requested ELSE 0 END) AS totalApprovedDays
  FROM leave_requests
  WHERE start_date BETWEEN :from AND :to
`, { replacements: { from, to }, type: QueryTypes.SELECT });

const getLeaveByStatus = (from, to) => sequelize.query(`
  SELECT status,
         COUNT(*)          AS total,
         SUM(days_requested) AS totalDays
  FROM leave_requests
  WHERE start_date BETWEEN :from AND :to
  GROUP BY status
`, { replacements: { from, to }, type: QueryTypes.SELECT });

const getLeaveTrend = (from, to) => sequelize.query(`
  SELECT DATE_FORMAT(start_date, '%Y-%m') AS month,
         COUNT(*)                          AS total,
         SUM(days_requested)               AS totalDays
  FROM leave_requests
  WHERE start_date BETWEEN :from AND :to
  GROUP BY month
  ORDER BY month ASC
`, { replacements: { from, to }, type: QueryTypes.SELECT });

const getTopLeaveUsers = (from, to) => sequelize.query(`
  SELECT u.first_name, u.last_name, u.department,
         COUNT(l.id)          AS requests,
         SUM(l.days_requested) AS totalDays
  FROM leave_requests l
  JOIN users u ON l.employee_id = u.id
  WHERE l.status = 'Approved'
    AND l.start_date BETWEEN :from AND :to
  GROUP BY u.id
  ORDER BY totalDays DESC
  LIMIT 10
`, { replacements: { from, to }, type: QueryTypes.SELECT });

// ─── EXPENSES ────────────────────────────────────────────────────────────────
// FIX: no single 'status' — has manager_approval_status & finance_approval_status
// FIX: payment_status: 'Unpaid','Processing','Paid'

const getExpenseSummary = (from, to) => sequelize.query(`
  SELECT
    COUNT(*)                                                                      AS total,
    SUM(amount)                                                                   AS totalAmount,
    AVG(amount)                                                                   AS avgAmount,
    SUM(CASE WHEN manager_approval_status = 'Approved' THEN amount ELSE 0 END)   AS managerApprovedAmount,
    SUM(CASE WHEN manager_approval_status = 'Pending'  THEN amount ELSE 0 END)   AS managerPendingAmount,
    SUM(CASE WHEN manager_approval_status = 'Rejected' THEN amount ELSE 0 END)   AS managerRejectedAmount,
    SUM(CASE WHEN finance_approval_status = 'Approved' THEN amount ELSE 0 END)   AS financeApprovedAmount,
    SUM(CASE WHEN finance_approval_status = 'Pending'  THEN amount ELSE 0 END)   AS financePendingAmount,
    SUM(CASE WHEN payment_status = 'Paid'              THEN amount ELSE 0 END)   AS totalPaidOut,
    SUM(CASE WHEN payment_status = 'Unpaid'            THEN amount ELSE 0 END)   AS totalUnpaid
  FROM expenses
  WHERE created_at BETWEEN :from AND :to
`, { replacements: { from, to }, type: QueryTypes.SELECT });

const getExpenseByCategory = (from, to) => sequelize.query(`
  SELECT category,
         COUNT(*)  AS count,
         SUM(amount) AS total
  FROM expenses
  WHERE created_at BETWEEN :from AND :to
  GROUP BY category
  ORDER BY total DESC
`, { replacements: { from, to }, type: QueryTypes.SELECT });

const getExpenseTrend = (from, to) => sequelize.query(`
  SELECT DATE_FORMAT(created_at, '%Y-%m') AS month,
         SUM(amount) AS total
  FROM expenses
  WHERE created_at BETWEEN :from AND :to
  GROUP BY month
  ORDER BY month ASC
`, { replacements: { from, to }, type: QueryTypes.SELECT });

const getTopSpenders = (from, to) => sequelize.query(`
  SELECT u.first_name, u.last_name, u.department,
         COUNT(e.id)    AS claims,
         SUM(e.amount)  AS totalSpent
  FROM expenses e
  JOIN users u ON e.employee_id = u.id
  WHERE e.manager_approval_status = 'Approved'
    AND e.finance_approval_status  = 'Approved'
    AND e.created_at BETWEEN :from AND :to
  GROUP BY u.id
  ORDER BY totalSpent DESC
  LIMIT 10
`, { replacements: { from, to }, type: QueryTypes.SELECT });

module.exports = {
  getEmployeeSummary, getEmployeesByDepartment, getEmployeesByRole, getNewHires,
  getPayrollSummary, getPayrollByDepartment, getPayrollTrend,
  getLeaveSummary, getLeaveByStatus, getLeaveTrend, getTopLeaveUsers,
  getExpenseSummary, getExpenseByCategory, getExpenseTrend, getTopSpenders,
};