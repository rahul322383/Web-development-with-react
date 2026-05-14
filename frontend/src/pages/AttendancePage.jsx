import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { parse, format } from 'date-fns';
import {
    LogIn,
    LogOut,
    Calendar,
    Clock,
    Users,
    AlertCircle,
    CheckCircle,
    XCircle,
    ChevronLeft,
    ChevronRight,
    Search,
    RefreshCw,
    UserCheck,
    UserX,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
    checkIn,
    checkOut,
    getMyAttendance,
    getTodaySummary,
    getTeamReport,
    getOvertimeSummary,
    adminRecord,
} from '../api/attendance.api';

// ─────────────────────────────────────────────────────────────
// DATE HELPERS — all timezone-safe
// ─────────────────────────────────────────────────────────────

/**
 * Parse a "YYYY-MM-DD" string as a LOCAL date.
 * new Date("2026-05-14") parses as UTC midnight → wrong day in IST.
 * new Date(2026, 4, 14) uses local time → correct.
 */
const parseLocalDate = (dateString) => {
    if (!dateString) return new Date();
    const [yyyy, mm, dd] = String(dateString).slice(0, 10).split('-').map(Number);
    return new Date(yyyy, mm - 1, dd);
};

/**
 * Safely format any date value coming from the API:
 *   - "YYYY-MM-DD" string       → parsed as local date
 *   - ISO datetime string        → date portion extracted, then local
 *   - Date object                → used directly
 *   - new-backend object shape   → .readable / .iso / .date
 */
const formatDate = (dateValue, fmt = 'dd MMM yyyy') => {
    if (!dateValue) return '—';

    // New-backend object shape
    if (typeof dateValue === 'object' && !(dateValue instanceof Date)) {
        if (dateValue.readable) return dateValue.readable;
        if (dateValue.iso) return format(parseLocalDate(dateValue.iso), fmt);
        if (dateValue.date) return format(parseLocalDate(dateValue.date), fmt);
    }

    const str = String(dateValue);

    // Plain "YYYY-MM-DD"
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
        return format(parseLocalDate(str), fmt);
    }

    // ISO datetime — extract just the date part
    if (str.includes('T')) {
        return format(parseLocalDate(str.slice(0, 10)), fmt);
    }

    return format(new Date(str), fmt);
};

// ─────────────────────────────────────────────────────────────
// EMPLOYEE NAME HELPER
// ─────────────────────────────────────────────────────────────

/**
 * Resolve a display name from an employee object.
 * Backend returns { first_name, last_name } — there is NO .name field.
 * This helper handles both snake_case and camelCase variants.
 */
const getEmployeeName = (employee, employeeId) => {
    if (!employee) return `ID: ${employeeId ?? '?'}`;

    // Pre-built .name (future-proof)
    if (employee.name) return employee.name;

    const first = employee.first_name || employee.firstName || '';
    const last = employee.last_name || employee.lastName || '';
    const full = `${first} ${last}`.trim();
    return full || employee.email || `ID: ${employeeId ?? '?'}`;
};

// ─────────────────────────────────────────────────────────────
// API PAYLOAD UNWRAPPER
// ─────────────────────────────────────────────────────────────

/**
 * Normalise both API response shapes:
 *   { success, data: { records, meta, summary } }   ← getTodaySummary, getMyAttendance
 *   { success, meta, records }                       ← getTeamReport (flat)
 */
const unwrapPayload = (res) => {
    const raw = res?.data ?? {};
    // Nested shape
    if (raw.data && typeof raw.data === 'object') return raw.data;
    // Flat shape
    return raw;
};

// ─────────────────────────────────────────────────────────────
// OTHER PURE HELPERS
// ─────────────────────────────────────────────────────────────

const getCurrentTime = () =>
    new Date().toISOString().split('T')[1].slice(0, 8);

const getDefaultMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
        startDate: format(firstDay, 'yyyy-MM-dd'),
        endDate: format(lastDay, 'yyyy-MM-dd'),
    };
};

/** Returns today as "YYYY-MM-DD" in LOCAL time — no UTC flip. */
const getTodayDate = () => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const cleanParams = (params) =>
    Object.fromEntries(
        Object.entries(params).filter(([, v]) => v !== '' && v !== null && v !== undefined)
    );

const safeNumber = (value, fallback = 0) => {
    const n = Number(value);
    return Number.isNaN(n) ? fallback : n;
};

/** Format minutes → "2h 15m", "45m", "3h", or "—". */
const formatDuration = (minutes) => {
    const m = safeNumber(minutes);
    if (m <= 0) return '—';
    const hrs = Math.floor(m / 60);
    const mins = m % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
};

const formatTo12Hour = (timeString) => {
    if (!timeString) return '—';
    const parsed = parse(timeString, 'HH:mm:ss', new Date());
    if (isNaN(parsed)) {
        const fallback = parse(timeString, 'HH:mm', new Date());
        if (isNaN(fallback)) return '—';
        return format(fallback, 'hh:mm a');
    }
    return format(parsed, 'hh:mm a');
};

const extractTime12Hour = (timeVal) => {
    if (!timeVal) return '—';
    if (typeof timeVal === 'string') return formatTo12Hour(timeVal);
    // new-backend object
    if (timeVal.dateTime?.readable) {
        const match = timeVal.dateTime.readable.match(/(\d{1,2}:\d{2}\s[AP]M)/i);
        return match ? match[1] : timeVal.time || '—';
    }
    if (timeVal.time) return formatTo12Hour(timeVal.time);
    return '—';
};

const extractWorkedHours = (record) => {
    if (!record) return '—';
    if (record.workedHours) return record.workedHours.formatted || '—';
    // Still checked in — workedMinutes will be null
    if (record.checkIn && !record.checkOut) return 'In progress';
    if (record.workedMinutes != null) return formatDuration(record.workedMinutes);
    return '—';
};

const extractLateMinutes = (record) => {
    if (!record) return '—';
    if (record.late) return record.late.formatted || '—';
    if (record.lateMinutes != null) return formatDuration(record.lateMinutes);
    return '—';
};

const extractOvertime = (record) => {
    if (!record) return '—';
    if (record.overtime) return record.overtime.formatted || '—';
    if (record.overtimeMinutes != null) return formatDuration(record.overtimeMinutes);
    return '—';
};

const resolveIsAdmin = (user) => {
    if (!user) return false;
    const roles = [
        user.role,
        user.primaryRole,
        ...(Array.isArray(user.roles) ? user.roles : []),
    ]
        .filter(Boolean)
        .map((r) => (typeof r === 'string' ? r : r?.name))
        .filter(Boolean)
        .map((r) => r.toLowerCase());
    return roles.some((r) => ['admin', 'hr', 'manager'].includes(r));
};

// ─────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────

const useDebounce = (value, delay = 500) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
};

// ─────────────────────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────────────────────

const Button = memo(({ children, variant = 'primary', isLoading, className = '', ...props }) => {
    const base = 'px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
    const variants = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600',
        danger: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700',
    };
    return (
        <button className={`${base} ${variants[variant]} ${className}`} disabled={isLoading || props.disabled} {...props}>
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
                </span>
            ) : children}
        </button>
    );
});

const Input = memo(({ label, error, ...props }) => (
    <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
        <input
            className={`px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'
                }`}
            {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
));

const Select = memo(({ label, options, ...props }) => (
    <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
        <select
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...props}
        >
            {options.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
));

const Card = memo(({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 ${className}`}>
        {children}
    </div>
));

const StatusBadge = memo(({ status }) => {
    const styles = {
        working: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
        checked_in: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
        present: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        late: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        absent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        half_day: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        on_leave: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        holiday: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    const key = status || 'absent';
    const display = key.replaceAll('_', ' ');
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${styles[key] || 'bg-gray-100 text-gray-800'}`}>
            {display}
        </span>
    );
});

const SkeletonRow = ({ cols = 6 }) => (
    <tr>
        {Array.from({ length: cols }).map((_, i) => (
            <td key={i} className="p-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </td>
        ))}
    </tr>
);

// ─────────────────────────────────────────────────────────────
// SHARED ATTENDANCE ROW + CARD
// Centralising rendering avoids duplication and guarantees
// getEmployeeName() is always called correctly.
// ─────────────────────────────────────────────────────────────

/** Desktop table row */
const AttendanceRow = memo(({ rec, showEmployee = false }) => (
    <tr className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
        {showEmployee && (
            <td className="p-3 font-medium text-gray-900 dark:text-white">
                {getEmployeeName(rec.employee, rec.employeeId)}
            </td>
        )}
        <td className="p-3 text-gray-700 dark:text-gray-300">{formatDate(rec.date)}</td>
        <td className="p-3 text-blue-600 dark:text-blue-400 font-medium">{extractTime12Hour(rec.checkIn)}</td>
        <td className="p-3 text-blue-600 dark:text-blue-400 font-medium">{extractTime12Hour(rec.checkOut)}</td>
        <td className="p-3"><StatusBadge status={rec.status} /></td>
        <td className="p-3 font-medium text-gray-700 dark:text-gray-300">{extractWorkedHours(rec)}</td>
        <td className="p-3 text-orange-600 dark:text-orange-400">{extractOvertime(rec)}</td>
        <td className="p-3 text-red-600 dark:text-red-400">{extractLateMinutes(rec)}</td>
    </tr>
));

/** Mobile card */
const AttendanceCard = memo(({ rec, showEmployee = false }) => (
    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-start mb-3">
            <div>
                {showEmployee && (
                    <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">
                        {getEmployeeName(rec.employee, rec.employeeId)}
                    </p>
                )}
                <p className={`${showEmployee ? 'text-xs text-gray-500 dark:text-gray-400 mt-0.5' : 'font-semibold text-gray-900 dark:text-white'}`}>
                    {formatDate(rec.date)}
                </p>
            </div>
            <StatusBadge status={rec.status} />
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Check In</p>
                <p className="text-blue-600 dark:text-blue-400 font-medium">{extractTime12Hour(rec.checkIn)}</p>
            </div>
            <div className="space-y-1">
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Check Out</p>
                <p className="text-blue-600 dark:text-blue-400 font-medium">{extractTime12Hour(rec.checkOut)}</p>
            </div>
            <div className="space-y-1">
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Worked</p>
                <p className="text-green-600 dark:text-green-400 font-medium">{extractWorkedHours(rec)}</p>
            </div>
            <div className="space-y-1">
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Overtime</p>
                <p className="text-orange-600 dark:text-orange-400 font-medium">{extractOvertime(rec)}</p>
            </div>
            <div className="space-y-1">
                <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide">Late</p>
                <p className="text-red-600 dark:text-red-400 font-medium">{extractLateMinutes(rec)}</p>
            </div>
        </div>
    </div>
));

// ─────────────────────────────────────────────────────────────
// CHECK IN / OUT CARD
// ─────────────────────────────────────────────────────────────

const CheckInOutCard = memo(({ onSuccess, todayStatus, userId }) => {
    const [checkingIn, setCheckingIn] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const abortRef = useRef(null);

    const canCheckIn = !todayStatus || ['absent', 'on_leave'].includes(todayStatus);
    const canCheckOut = ['working', 'checked_in', 'present', 'late', 'half_day'].includes(todayStatus);

    const handleCheckIn = async () => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setCheckingIn(true); setError(''); setMessage('');
        try {
            const res = await checkIn({ employeeId: userId, checkInTime: getCurrentTime() }, { signal: controller.signal });
            const payload = unwrapPayload(res);
            setMessage(payload.message ?? 'Checked in successfully');
            onSuccess?.();
        } catch (err) {
            if (err.name !== 'AbortError') setError(err.response?.data?.message || 'Check-in failed');
        } finally {
            setCheckingIn(false);
            abortRef.current = null;
        }
    };

    const handleCheckOut = async () => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;
        setCheckingOut(true); setError(''); setMessage('');
        try {
            const res = await checkOut({ employeeId: userId, checkOutTime: getCurrentTime() }, { signal: controller.signal });
            const payload = unwrapPayload(res);
            setMessage(payload.message ?? 'Checked out successfully');
            onSuccess?.();
        } catch (err) {
            if (err.name !== 'AbortError') setError(err.response?.data?.message || 'Check-out failed');
        } finally {
            setCheckingOut(false);
            abortRef.current = null;
        }
    };

    useEffect(() => () => { if (abortRef.current) abortRef.current.abort(); }, []);

    return (
        <Card>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    <Button onClick={handleCheckIn} isLoading={checkingIn} variant="primary" className="w-full sm:w-auto" disabled={!canCheckIn}>
                        <LogIn className="w-4 h-4 mr-2 inline" /> Check In
                    </Button>
                    <Button onClick={handleCheckOut} isLoading={checkingOut} variant="secondary" className="w-full sm:w-auto" disabled={!canCheckOut}>
                        <LogOut className="w-4 h-4 mr-2 inline" /> Check Out
                    </Button>
                </div>
                <div className="text-sm text-center sm:text-right w-full sm:w-auto">
                    {message && <p className="text-green-600 dark:text-green-400">{message}</p>}
                    {error && <p className="text-red-600   dark:text-red-400">{error}</p>}
                </div>
            </div>
        </Card>
    );
});

// ─────────────────────────────────────────────────────────────
// MY ATTENDANCE TABLE (Employee)
// ─────────────────────────────────────────────────────────────

const MY_HEADERS = ['Date', 'Check In', 'Check Out', 'Status', 'Worked', 'Overtime', 'Late'];

const MyAttendanceTable = memo(() => {
    const [records, setRecords] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(getDefaultMonthRange);
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
    const [reloadKey, setReloadKey] = useState(0);

    const debouncedFilters = useDebounce(filters, 500);
    const abortControllerRef = useRef(null);

    useEffect(() => () => { if (abortControllerRef.current) abortControllerRef.current.abort(); }, []);

    const fetchData = useCallback(async () => {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setLoading(true);
        try {
            const params = cleanParams({ ...debouncedFilters, page: pagination.page, limit: pagination.limit });
            const res = await getMyAttendance(params, { signal: controller.signal });
            const payload = unwrapPayload(res);
            setRecords(payload?.records ?? []);
            setStats(payload?.stats ?? null);
            const meta = payload?.meta ?? {};
            setPagination((prev) => ({ ...prev, total: meta.totalRecords ?? meta.count ?? 0 }));
        } catch (error) {
            if (error.name !== 'AbortError') console.error(error);
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    }, [debouncedFilters, pagination.page, pagination.limit]);

    useEffect(() => { fetchData(); }, [fetchData, reloadKey]);

    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const showingFrom = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
    const showingTo = Math.min(pagination.page * pagination.limit, pagination.total);

    const handleApply = () => {
        setPagination((p) => ({ ...p, page: 1 }));
        setReloadKey((k) => k + 1);
    };

    return (
        <Card>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5" /> My Attendance History
            </h2>

            {/* Filters */}
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
                <Input type="date" label="Start Date" value={filters.startDate} onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} />
                <Input type="date" label="End Date" value={filters.endDate} onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} />
                <div className="flex gap-2 sm:col-span-2 lg:col-span-2">
                    <Button onClick={handleApply} variant="outline" className="flex-1"><Search className="w-4 h-4 mr-2" />Apply</Button>
                    <Button onClick={() => setFilters(getDefaultMonthRange())} variant="secondary" className="flex-1">Reset</Button>
                </div>
            </div>

            {/* Stats strip */}
            {stats && !loading && (
                <div className="mb-4 grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                        { label: 'Present', value: stats.present, color: 'text-green-600' },
                        { label: 'Late', value: stats.late, color: 'text-yellow-600' },
                        { label: 'Half Day', value: stats.halfDay, color: 'text-orange-600' },
                        { label: 'Absent', value: stats.absent, color: 'text-red-600' },
                        { label: 'Overtime', value: formatDuration(stats.overtimeMinutes), color: 'text-blue-600' },
                        { label: 'Late Time', value: formatDuration(stats.lateMinutes), color: 'text-red-500' },
                    ].map((s) => (
                        <div key={s.label} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 text-center">
                            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {MY_HEADERS.map((h) => (
                                <th key={h} className="p-3 text-left text-gray-700 dark:text-gray-300 font-semibold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={MY_HEADERS.length} />)
                        ) : records.length === 0 ? (
                            <tr><td colSpan={MY_HEADERS.length} className="p-6 text-center text-gray-500">No records found</td></tr>
                        ) : (
                            records.map((rec) => <AttendanceRow key={rec.id} rec={rec} showEmployee={false} />)
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
                {loading ? (
                    <p className="text-center py-4 text-gray-500">Loading...</p>
                ) : records.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No records found</p>
                ) : (
                    records.map((rec) => <AttendanceCard key={rec.id} rec={rec} showEmployee={false} />)
                )}
            </div>

            {/* Pagination */}
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {showingFrom}–{showingTo} of {pagination.total}
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={pagination.page === 1} onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}><ChevronLeft className="w-4 h-4" /></Button>
                    <span className="px-3 py-1 text-sm self-center">{pagination.page} / {totalPages || 1}</span>
                    <Button variant="outline" disabled={pagination.page >= totalPages} onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}><ChevronRight className="w-4 h-4" /></Button>
                </div>
            </div>
        </Card>
    );
});

// ─────────────────────────────────────────────────────────────
// TODAY'S SUMMARY + RECORDS (Admin)
// ─────────────────────────────────────────────────────────────

const TEAM_HEADERS = ['Employee', 'Date', 'Check In', 'Check Out', 'Status', 'Worked', 'Overtime', 'Late'];

const TodaySummary = memo(() => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const abortRef = useRef(null);

    const fetchToday = useCallback(async () => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        try {
            const res = await getTodaySummary({ signal: controller.signal });
            const payload = unwrapPayload(res);
            setData(payload);
        } catch (error) {
            if (error.name !== 'AbortError') console.error(error);
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchToday();
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, [fetchToday]);

    const stats = useMemo(() => {
        if (!data?.summary) return [];
        const s = data.summary;
        const total =
            (s.present || 0) +
            (s.late || 0) +
            (s.absent || 0) +
            (s.half_day || 0) +
            (s.working || 0);
        return [
            { label: 'Present', value: s.present || 0, icon: CheckCircle, color: 'text-green-600' },
            { label: 'Late', value: s.late || 0, icon: AlertCircle, color: 'text-yellow-600' },
            { label: 'Absent', value: s.absent || 0, icon: XCircle, color: 'text-red-600' },
            { label: 'Half Day', value: s.half_day || 0, icon: UserX, color: 'text-orange-600' },
            { label: 'Working', value: s.working || 0, icon: UserCheck, color: 'text-blue-600' },
            { label: 'Total', value: total, icon: Users, color: 'text-gray-600 dark:text-gray-400' },
        ];
    }, [data]);

    const dateDisplay = data?.date ? formatDate(data.date) : '...';

    return (
        <Card>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5" /> Today's Overview — {dateDisplay}
            </h2>

            {/* Stat tiles */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg animate-pulse">
                            <div className="h-6 w-6 mx-auto mb-2 rounded-full bg-gray-300 dark:bg-gray-600" />
                            <div className="h-5 w-12 mx-auto mb-1 bg-gray-300 dark:bg-gray-600 rounded" />
                            <div className="h-4 w-16 mx-auto bg-gray-300 dark:bg-gray-600 rounded" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                            <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                        </div>
                    ))}
                </div>
            )}

            {/* Records */}
            {!loading && data?.records && data.records.length > 0 && (
                <>
                    <h3 className="text-md font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        Today's Records ({data.records.length})
                    </h3>
                    {/* Desktop */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    {TEAM_HEADERS.map((h) => (
                                        <th key={h} className="p-3 text-left text-gray-700 dark:text-gray-300 font-semibold">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.records.map((rec) => (
                                    <AttendanceRow key={rec.id} rec={rec} showEmployee={true} />
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {/* Mobile */}
                    <div className="md:hidden space-y-3">
                        {data.records.map((rec) => (
                            <AttendanceCard key={rec.id} rec={rec} showEmployee={true} />
                        ))}
                    </div>
                </>
            )}

            {!loading && (!data?.records || data.records.length === 0) && (
                <p className="text-center py-4 text-gray-500">No attendance records for today yet.</p>
            )}
        </Card>
    );
});

// ─────────────────────────────────────────────────────────────
// TEAM REPORT (Admin)
// ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'present', label: 'Present' },
    { value: 'late', label: 'Late' },
    { value: 'absent', label: 'Absent' },
    { value: 'half_day', label: 'Half Day' },
    { value: 'on_leave', label: 'On Leave' },
    { value: 'working', label: 'Working' },
];

const EMPTY_TEAM_FILTERS = { startDate: '', endDate: '', employeeId: '', status: '' };

const TeamReport = memo(() => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(EMPTY_TEAM_FILTERS);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [reloadKey, setReloadKey] = useState(0);
    const limit = 10;
    const abortRef = useRef(null);
    const debouncedFilters = useDebounce(filters, 400);

    const fetchData = useCallback(async () => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        try {
            const params = cleanParams({ ...debouncedFilters, page, limit });
            const res = await getTeamReport(params, { signal: controller.signal });

            // Team report returns { success, meta, records } — flat, no nested .data
            const raw = res?.data ?? {};
            const records = raw.records ?? raw.data?.records ?? [];
            const meta = raw.meta ?? raw.data?.meta ?? {};

            setRecords(records);
            setTotal(meta.count ?? meta.totalRecords ?? 0);
        } catch (error) {
            if (error.name !== 'AbortError') console.error(error);
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    }, [debouncedFilters, page]);

    useEffect(() => {
        fetchData();
        return () => { if (abortRef.current) abortRef.current.abort(); };
    }, [fetchData, reloadKey]);

    const totalPages = Math.ceil(total / limit);
    const handleApply = () => { setPage(1); setReloadKey((k) => k + 1); };

    return (
        <Card>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5" /> Team Attendance Report
            </h2>

            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input type="date" label="Start Date" value={filters.startDate} onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} />
                <Input type="date" label="End Date" value={filters.endDate} onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} />
                <Input type="number" label="Employee ID" value={filters.employeeId} onChange={(e) => setFilters((f) => ({ ...f, employeeId: e.target.value }))} placeholder="Optional" />
                <Select label="Status" options={STATUS_OPTIONS} value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))} />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Button onClick={handleApply} variant="primary" className="w-full sm:w-auto">Apply Filters</Button>
                <Button
                    onClick={() => { setFilters(EMPTY_TEAM_FILTERS); setPage(1); setReloadKey((k) => k + 1); }}
                    variant="secondary" className="w-full sm:w-auto"
                >
                    Clear
                </Button>
            </div>

            {/* Desktop */}
            <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            {TEAM_HEADERS.map((h) => (
                                <th key={h} className="p-3 text-left text-gray-700 dark:text-gray-300 font-semibold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={TEAM_HEADERS.length} />)
                        ) : records.length === 0 ? (
                            <tr><td colSpan={TEAM_HEADERS.length} className="p-6 text-center text-gray-500">No records found</td></tr>
                        ) : (
                            records.map((rec) => <AttendanceRow key={rec.id} rec={rec} showEmployee={true} />)
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile */}
            <div className="md:hidden space-y-3">
                {loading ? (
                    <p className="text-center py-4 text-gray-500">Loading...</p>
                ) : records.length === 0 ? (
                    <p className="text-center py-4 text-gray-500">No records found</p>
                ) : (
                    records.map((rec) => <AttendanceCard key={rec.id} rec={rec} showEmployee={true} />)
                )}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page {page} of {totalPages || 1} — Total: {total}
                </p>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft className="w-4 h-4" /></Button>
                    <span className="px-3 py-1 text-sm self-center">{page}</span>
                    <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}><ChevronRight className="w-4 h-4" /></Button>
                </div>
            </div>
        </Card>
    );
});

// ─────────────────────────────────────────────────────────────
// OVERTIME SUMMARY
// ─────────────────────────────────────────────────────────────

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: format(new Date(2000, i, 1), 'MMMM'),
}));

const OvertimeSummary = memo(() => {
    const [params, setParams] = useState({
        employeeId: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
    });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const abortRef = useRef(null);

    const handleFetch = async () => {
        if (!params.employeeId) { setError('Employee ID is required'); return; }
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true); setError('');
        try {
            const res = await getOvertimeSummary(cleanParams(params), { signal: controller.signal });
            const payload = unwrapPayload(res);
            setData(payload);
        } catch (err) {
            if (err.name !== 'AbortError') setError(err.response?.data?.message || 'Failed to fetch');
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    };

    useEffect(() => () => { if (abortRef.current) abortRef.current.abort(); }, []);

    const totalMins = data?.totalOvertimeMinutes ?? data?.summary?.totalOvertimeMinutes ?? 0;
    const overtimeDays = data?.overtimeDays ?? data?.summary?.overtimeDays ?? 0;
    const displayOT = data?.summary?.formatted || formatDuration(totalMins) || '0h 0m';

    return (
        <Card>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Overtime Summary</h2>
            <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Input type="number" label="Employee ID" value={params.employeeId} onChange={(e) => setParams((p) => ({ ...p, employeeId: e.target.value }))} placeholder="e.g., 12" />
                    <Select label="Month" options={MONTH_OPTIONS} value={params.month} onChange={(e) => setParams((p) => ({ ...p, month: parseInt(e.target.value, 10) }))} />
                    <Input type="number" label="Year" value={params.year} onChange={(e) => setParams((p) => ({ ...p, year: parseInt(e.target.value, 10) || p.year }))} />
                </div>
                <Button onClick={handleFetch} isLoading={loading} className="w-full sm:w-auto">Get Overtime</Button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {data && (
                    <div className="mt-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/40 dark:to-indigo-900/40 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Total Overtime</p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{displayOT}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">Overtime Days</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white">{overtimeDays}</p>
                            </div>
                        </div>
                        {(data.period || data.month) && (
                            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-blue-200 dark:border-blue-700">
                                Period: {data.period?.month ?? data.month}/{data.period?.year ?? data.year}
                            </p>
                        )}
                    </div>
                )}
            </div>
        </Card>
    );
});

// ─────────────────────────────────────────────────────────────
// MANUAL ENTRY FORM
// ─────────────────────────────────────────────────────────────

const EMPTY_FORM = {
    employeeId: '',
    date: getTodayDate(),
    checkIn: '',
    checkOut: '',
    status: '',
    notes: '',
};

const MANUAL_STATUS_OPTIONS = [
    { value: '', label: 'Use check-in/out times' },
    { value: 'absent', label: 'Absent' },
    { value: 'on_leave', label: 'On Leave' },
    { value: 'half_day', label: 'Half Day' },
    { value: 'holiday', label: 'Holiday' },
];

const ManualEntryForm = memo(({ onSuccess }) => {
    const [form, setForm] = useState(EMPTY_FORM);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const abortRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true); setError(''); setMessage('');
        try {
            const { checkIn: ci, checkOut: co, status, ...rest } = form;
            const payload = status ? { ...rest, status } : { ...rest, checkIn: ci, checkOut: co };
            const res = await adminRecord(cleanParams(payload), { signal: controller.signal });
            const resPayload = unwrapPayload(res);
            setMessage(resPayload.message || 'Record created successfully');
            setForm(EMPTY_FORM);
            onSuccess?.();
        } catch (err) {
            if (err.name !== 'AbortError') setError(err.response?.data?.message || 'Submission failed');
        } finally {
            if (!controller.signal.aborted) setLoading(false);
        }
    };

    useEffect(() => () => { if (abortRef.current) abortRef.current.abort(); }, []);

    return (
        <Card>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Manual Entry (Admin)</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input label="Employee ID" type="number" required value={form.employeeId} onChange={(e) => setForm((f) => ({ ...f, employeeId: e.target.value }))} placeholder="e.g., 1" />
                    <Input label="Date" type="date" required value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
                <Select label="Status (optional)" options={MANUAL_STATUS_OPTIONS} value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} />
                {!form.status && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <Input label="Check In (HH:MM)" placeholder="09:00" pattern="\d{2}:\d{2}" value={form.checkIn} onChange={(e) => setForm((f) => ({ ...f, checkIn: e.target.value }))} />
                        <Input label="Check Out (HH:MM)" placeholder="18:00" pattern="\d{2}:\d{2}" value={form.checkOut} onChange={(e) => setForm((f) => ({ ...f, checkOut: e.target.value }))} />
                    </div>
                )}
                <Input label="Notes" placeholder="Optional notes" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <Button type="submit" isLoading={loading} variant="primary">Submit Record</Button>
                    {message && <p className="text-green-600 dark:text-green-400 text-sm font-medium">{message}</p>}
                    {error && <p className="text-red-600   dark:text-red-400   text-sm font-medium">{error}</p>}
                </div>
            </form>
        </Card>
    );
});

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────

export default function AttendancePage() {
    const { user } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0);
    const [todayStatus, setTodayStatus] = useState(null);
    const isAdmin = resolveIsAdmin(user);
    const userId = user?.id;

    useEffect(() => {
        if (isAdmin || !userId) return;
        const controller = new AbortController();

        const fetchStatus = async () => {
            try {
                const today = getTodayDate();
                const params = { startDate: today, endDate: today, page: 1, limit: 1 };
                const res = await getMyAttendance(params, { signal: controller.signal });
                const payload = unwrapPayload(res);
                const records = payload?.records ?? [];
                setTodayStatus(records.length > 0 ? records[0].status : null);
            } catch (err) {
                if (err.name !== 'AbortError') console.error(err);
            }
        };

        fetchStatus();
        return () => controller.abort();
    }, [isAdmin, userId, refreshKey]);

    return (
        <div className="space-y-6 pt-20 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Management</h1>
                {!isAdmin && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(), 'EEEE, dd MMMM yyyy')}
                    </p>
                )}
            </div>

            {!isAdmin ? (
                <>
                    <CheckInOutCard
                        onSuccess={() => setRefreshKey((k) => k + 1)}
                        todayStatus={todayStatus}
                        userId={userId}
                    />
                    <MyAttendanceTable key={refreshKey} />
                </>
            ) : (
                <>
                    <TodaySummary />
                    <TeamReport />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <OvertimeSummary />
                        <ManualEntryForm onSuccess={() => setRefreshKey((k) => k + 1)} />
                    </div>
                </>
            )}
        </div>
    );
}