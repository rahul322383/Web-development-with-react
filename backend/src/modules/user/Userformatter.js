'use strict';

// ─────────────────────────────────────────────
// Name Helpers (camelCase + snake_case safe)
// ─────────────────────────────────────────────

const getFirstName = (u) => u?.firstName ?? u?.first_name ?? '';
const getLastName = (u) => u?.lastName ?? u?.last_name ?? '';

const fullName = (u) => `${getFirstName(u)} ${getLastName(u)}`.trim();

const safe = (val) =>
    val === null || val === undefined || val === '' ? 'N/A' : val;

// ─────────────────────────────────────────────
// Changelog
// ─────────────────────────────────────────────

const CHANGE_FIELDS = [
    {
        key: 'firstName',
        format: (_, updated, existing) =>
            `Name changed from "${fullName(existing)}" to "${fullName(updated)}"`
    },
    {
        key: 'lastName',
        format: (_, updated, existing) =>
            `Name changed from "${fullName(existing)}" to "${fullName(updated)}"`
    },
    {
        key: 'email',
        format: (_, updated, existing) =>
            `Email changed from ${safe(existing.email)} to ${safe(updated.email)}`
    },
    {
        key: 'department',
        format: (_, updated, existing) =>
            `Department changed from ${safe(existing.department)} to ${safe(updated.department)}`
    },
    {
        key: 'managerId',
        format: () => 'Manager changed'
    },
    {
        key: 'baseSalary',
        format: () => 'Salary updated'
    },
    {
        key: 'isActive',
        format: (val) => `Status changed to ${val ? 'Active' : 'Inactive'}`
    }
];

/**
 * Build a human-readable changelog array by diffing two plain objects.
 * Name changes (firstName + lastName) are deduplicated to a single entry.
 */
const buildChangelog = (existing = {}, updated = {}) => {
    const changes = [];
    const handledKeys = new Set();

    for (const { key, format } of CHANGE_FIELDS) {
        // Deduplicate: firstName + lastName both map to a single "Name changed" entry
        const isNameKey = key === 'firstName' || key === 'lastName';
        if (isNameKey && handledKeys.has('name')) continue;

        if (existing[key] !== updated[key]) {
            if (isNameKey) handledKeys.add('name');
            changes.push(format(updated[key], updated, existing));
        }
    }

    return changes;
};

// ─────────────────────────────────────────────
// Monthly Formatter
// ─────────────────────────────────────────────

/**
 * Convert a raw DB result (array of { month, [key] }) into a
 * 12-element array indexed 1–12, filling gaps with 0.
 */
const formatMonthly = (data = [], key = 'count') => {
    const map = {};

    for (const item of data) {
        const month = Number(item?.month);
        const value = Number(item?.[key]);
        if (Number.isInteger(month) && month >= 1 && month <= 12) {
            map[month] = Number.isNaN(value) ? 0 : value;
        }
    }

    return Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        value: map[i + 1] ?? 0
    }));
};

// ─────────────────────────────────────────────
// Pagination
// ─────────────────────────────────────────────

const buildPagination = (count = 0, page = 1, limit = 10) => {
    const safeLimit = limit > 0 ? limit : 10;
    const totalPages = Math.ceil(count / safeLimit) || 1;
    return { total: count, page, limit: safeLimit, totalPages };
};

// ─────────────────────────────────────────────
// Leave DTO
// ─────────────────────────────────────────────

const cleanLeave = (leave = {}) => ({
    id: leave.id ?? null,
    status: leave.status ?? null,
    startDate: leave.startDate ?? null,
    endDate: leave.endDate ?? null,
    reason: leave.reason ?? null,
    employeeName: leave.employee ? fullName(leave.employee) : null,
    employeeEmail: leave.employee?.email ?? null,
    approverName: leave.approver ? fullName(leave.approver) : null,
    approverEmail: leave.approver?.email ?? null
});

// ─────────────────────────────────────────────
// Expense DTO
// ─────────────────────────────────────────────

const cleanExpense = (exp = {}) => ({
    id: exp.id ?? null,
    amount: Number(exp.amount ?? 0),
    category: exp.category ?? null,
    managerStatus: exp.managerApprovalStatus ?? null,
    financeStatus: exp.financeApprovalStatus ?? null,
    createdAt: exp.createdAt ?? null,
    employeeName: exp.employee ? fullName(exp.employee) : null,
    employeeEmail: exp.employee?.email ?? null
});

// ─────────────────────────────────────────────

module.exports = {
    fullName,
    buildChangelog,
    formatMonthly,
    buildPagination,
    cleanLeave,
    cleanExpense
};