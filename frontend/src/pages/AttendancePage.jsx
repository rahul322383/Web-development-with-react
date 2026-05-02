import { useState, useEffect } from 'react';
import { format } from 'date-fns';
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

const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

const getDefaultDates = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
        startDate: format(firstDay, 'yyyy-MM-dd'),
        endDate: format(lastDay, 'yyyy-MM-dd'),
    };
};

const useDebounce = (value, delay = 500) => {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debounced;
};

const cleanParams = (params) => {
    return Object.fromEntries(
        Object.entries(params).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
};

// ===== NEW HELPER: minutes → readable hours & minutes =====
const formatDuration = (minutes) => {
    if (!minutes || minutes <= 0) return '';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hrs === 0) return `${mins}m`;
    if (mins === 0) return `${hrs}h`;
    return `${hrs}h ${mins}m`;
};

// Helper to convert minutes to hours with 2 decimals (unchanged, for worked hours)
const minutesToHours = (minutes) => (minutes / 60).toFixed(2);

// ===== NEW: format the server’s check‑in message =====
const formatCheckInMessage = (rawMessage) => {
    // Example: "Checked in. Marked late by 808 min."
    const match = rawMessage.match(/late by (\d+) min/i);
    if (match) {
        const lateMinutes = parseInt(match[1], 10);
        const formatted = formatDuration(lateMinutes) || '0m';
        return rawMessage.replace(match[0], `late by ${formatted}`);
    }
    return rawMessage;
};

const Button = ({ children, variant = 'primary', isLoading, ...props }) => {
    const base = "px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600",
        secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600",
        danger: "bg-red-600 text-white hover:bg-red-700",
        outline: "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700",
    };
    return (
        <button className={`${base} ${variants[variant]}`} disabled={isLoading} {...props}>
            {isLoading ? (
                <span className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
                </span>
            ) : (
                children
            )}
        </button>
    );
};

const Input = ({ label, error, ...props }) => (
    <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
        <input
            className={`px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${error ? 'border-red-500' : 'border-gray-300'
                }`}
            {...props}
        />
        {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
);

const Select = ({ label, options, ...props }) => (
    <div className="flex flex-col gap-1">
        {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
        <select
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...props}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    </div>
);

const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 ${className}`}>
        {children}
    </div>
);

const StatusBadge = ({ status }) => {
    const styles = {
        present: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        late: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        absent: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        half_day: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        on_leave: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
        holiday: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    };
    return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
            {status.replace('_', ' ')}
        </span>
    );
};

const CheckInOutCard = ({ onSuccess }) => {
    const [loading, setLoading] = useState({ in: false, out: false });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleCheckIn = async () => {
        setLoading({ ...loading, in: true });
        setError('');
        setMessage('');
        try {
            const res = await checkIn({ checkInTime: getCurrentTime() });
            const raw = res.data.message;
            setMessage(formatCheckInMessage(raw)); // ✅ format the late minutes
            onSuccess?.();
        } catch (err) {
            setError(err.response?.data?.message || 'Check-in failed');
        } finally {
            setLoading({ ...loading, in: false });
        }
    };

    const handleCheckOut = async () => {
        setLoading({ ...loading, out: true });
        setError('');
        setMessage('');
        try {
            const res = await checkOut({ checkOutTime: getCurrentTime() });
            setMessage(res.data.message);
            onSuccess?.();
        } catch (err) {
            setError(err.response?.data?.message || 'Check-out failed');
        } finally {
            setLoading({ ...loading, out: false });
        }
    };

    return (
        <Card>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-3">
                    <Button onClick={handleCheckIn} isLoading={loading.in} variant="primary">
                        <LogIn className="w-4 h-4 mr-2 inline" /> Check In
                    </Button>
                    <Button onClick={handleCheckOut} isLoading={loading.out} variant="secondary">
                        <LogOut className="w-4 h-4 mr-2 inline" /> Check Out
                    </Button>
                </div>
                <div className="text-sm">
                    {message && <p className="text-green-600 dark:text-green-400">{message}</p>}
                    {error && <p className="text-red-600 dark:text-red-400">{error}</p>}
                </div>
            </div>
        </Card>
    );
};

const MyAttendanceTable = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState(getDefaultDates());
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    const debouncedFilters = useDebounce(filters, 500);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const params = cleanParams({
                    ...debouncedFilters,
                    page: pagination.page,
                    limit: pagination.limit,
                });
                const res = await getMyAttendance(params);
                setRecords(res.data.records || []);
                setPagination(prev => ({
                    ...prev,
                    total: res.data.meta?.count || 0,
                }));
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [debouncedFilters, pagination.page]);

    const totalPages = Math.ceil(pagination.total / pagination.limit);

    return (
        <Card>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5" /> My Attendance History
            </h2>
            <div className="mb-4 flex flex-wrap gap-3 items-end">
                <Input
                    type="date"
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
                <Input
                    type="date"
                    label="End Date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
                <Button onClick={() => setPagination(p => ({ ...p, page: 1 }))} variant="outline">
                    <Search className="w-4 h-4 mr-2" /> Apply
                </Button>
                <Button onClick={() => setFilters(getDefaultDates())} variant="secondary">
                    Reset
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-left">Check In</th>
                            <th className="p-3 text-left">Check Out</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Worked</th>
                            <th className="p-3 text-left">Late</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="p-3 text-center">Loading...</td></tr>
                        ) : records.length === 0 ? (
                            <tr><td colSpan={6} className="p-3 text-center text-gray-500">No records found</td></tr>
                        ) : (
                            records.map(rec => (
                                <tr key={rec.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="p-3">{format(new Date(rec.date), 'dd MMM yyyy')}</td>
                                    <td className="p-3">{rec.checkIn?.slice(0, 5) || '—'}</td>
                                    <td className="p-3">{rec.checkOut?.slice(0, 5) || '—'}</td>
                                    <td className="p-3"><StatusBadge status={rec.status} /></td>
                                    <td className="p-3">
                                        {rec.workedMinutes ? `${minutesToHours(rec.workedMinutes)} hrs` : '—'}
                                    </td>
                                    <td className="p-3">
                                        {rec.lateMinutes > 0 ? formatDuration(rec.lateMinutes) : '—'}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} entries
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        disabled={pagination.page === 1}
                        onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <span className="px-3 py-1 text-sm">{pagination.page} / {totalPages || 1}</span>
                    <Button
                        variant="outline"
                        disabled={pagination.page >= totalPages}
                        onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                    >
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

const TodaySummary = () => {
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const res = await getTodaySummary();
                setSummary(res.data.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchSummary();
    }, []);

    if (loading) return <Card><p>Loading summary...</p></Card>;
    if (!summary) return null;

    const stats = [
        { label: 'Present', value: summary.present || 0, icon: CheckCircle, color: 'text-green-600' },
        { label: 'Late', value: summary.late || 0, icon: AlertCircle, color: 'text-yellow-600' },
        { label: 'Absent', value: summary.absent || 0, icon: XCircle, color: 'text-red-600' },
        { label: 'On Leave', value: summary.onLeave || 0, icon: Calendar, color: 'text-purple-600' },
        { label: 'Total Employees', value: summary.totalEmployees || 0, icon: Users, color: 'text-blue-600' },
    ];

    return (
        <Card>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Today's Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {stats.map(stat => (
                    <div key={stat.label} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-center">
                        <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const TeamReport = () => {
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ startDate: '', endDate: '', employeeId: '', status: '' });
    const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

    const fetchData = async () => {
        setLoading(true);
        try {
            const params = cleanParams({ ...filters, page: pagination.page, limit: pagination.limit });
            const res = await getTeamReport(params);
            setRecords(res.data.records || []);
            setPagination(prev => ({ ...prev, total: res.data.meta?.count || 0 }));
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters, pagination.page]);

    const totalPages = Math.ceil(pagination.total / pagination.limit);
    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'present', label: 'Present' },
        { value: 'late', label: 'Late' },
        { value: 'absent', label: 'Absent' },
        { value: 'half_day', label: 'Half Day' },
        { value: 'on_leave', label: 'On Leave' },
    ];

    return (
        <Card>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5" /> Team Attendance Report
            </h2>
            <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input
                    type="date"
                    label="Start Date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
                <Input
                    type="date"
                    label="End Date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
                <Input
                    type="number"
                    label="Employee ID"
                    placeholder="Optional"
                    value={filters.employeeId}
                    onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
                />
                <Select
                    label="Status"
                    options={statusOptions}
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                />
            </div>
            <div className="flex gap-2 mb-4">
                <Button onClick={() => setPagination(p => ({ ...p, page: 1 }))} variant="primary">
                    Apply Filters
                </Button>
                <Button onClick={() => setFilters({ startDate: '', endDate: '', employeeId: '', status: '' })} variant="secondary">
                    Clear
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="p-3 text-left">Employee</th>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-left">Check In</th>
                            <th className="p-3 text-left">Check Out</th>
                            <th className="p-3 text-left">Status</th>
                            <th className="p-3 text-left">Worked</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} className="p-3 text-center">Loading...</td></tr>
                        ) : records.length === 0 ? (
                            <tr><td colSpan={6} className="p-3 text-center text-gray-500">No records found</td></tr>
                        ) : (
                            records.map(rec => {
                                const employeeName = rec.employee?.name || rec.employeeName || `ID: ${rec.employeeId}`;
                                return (
                                    <tr key={rec.id} className="border-t dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <td className="p-3">{employeeName} (ID: {rec.employeeId})</td>
                                        <td className="p-3">{format(new Date(rec.date), 'dd MMM yyyy')}</td>
                                        <td className="p-3">{rec.checkIn?.slice(0, 5) || '—'}</td>
                                        <td className="p-3">{rec.checkOut?.slice(0, 5) || '—'}</td>
                                        <td className="p-3"><StatusBadge status={rec.status} /></td>
                                        <td className="p-3">
                                            {rec.workedMinutes ? `${minutesToHours(rec.workedMinutes)} hrs` : '—'}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                    Page {pagination.page} of {totalPages || 1}
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" disabled={pagination.page === 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" disabled={pagination.page >= totalPages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

const OvertimeSummary = () => {
    const [params, setParams] = useState({ employeeId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleFetch = async () => {
        if (!params.employeeId) {
            setError('Employee ID is required');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const res = await getOvertimeSummary(cleanParams(params));
            setData(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Overtime Summary</h2>
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                    <Input
                        type="number"
                        label="Employee ID"
                        value={params.employeeId}
                        onChange={(e) => setParams({ ...params, employeeId: e.target.value })}
                        placeholder="e.g., 12"
                    />
                    <Select
                        label="Month"
                        options={Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: format(new Date(2000, i, 1), 'MMMM') }))}
                        value={params.month}
                        onChange={(e) => setParams({ ...params, month: parseInt(e.target.value) })}
                    />
                    <Input
                        type="number"
                        label="Year"
                        value={params.year}
                        onChange={(e) => setParams({ ...params, year: e.target.value })}
                    />
                </div>
                <Button onClick={handleFetch} isLoading={loading}>Get Overtime</Button>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {data && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-lg font-medium">
                            Total Overtime: <span className="text-blue-600 dark:text-blue-400">{data.totalOvertimeHours} hrs</span>
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Employee: {data.employeeName}</p>
                    </div>
                )}
            </div>
        </Card>
    );
};

const ManualEntryForm = ({ onSuccess }) => {
    const [form, setForm] = useState({
        employeeId: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        checkIn: '',
        checkOut: '',
        status: '',
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const payload = { ...form };
            if (payload.status) {
                delete payload.checkIn;
                delete payload.checkOut;
            } else {
                delete payload.status;
            }
            const cleaned = cleanParams(payload);
            const res = await adminRecord(cleaned);
            setMessage(res.data.message);
            setForm({
                employeeId: '',
                date: format(new Date(), 'yyyy-MM-dd'),
                checkIn: '',
                checkOut: '',
                status: '',
                notes: '',
            });
            onSuccess?.();
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    const statusOptions = [
        { value: '', label: 'Use check-in/out times' },
        { value: 'absent', label: 'Absent' },
        { value: 'on_leave', label: 'On Leave' },
        { value: 'half_day', label: 'Half Day' },
        { value: 'holiday', label: 'Holiday' },
    ];

    return (
        <Card>
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Manual Entry (Admin)</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <Input
                        label="Employee ID"
                        type="number"
                        required
                        value={form.employeeId}
                        onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                    />
                    <Input
                        label="Date"
                        type="date"
                        required
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                    />
                </div>
                <Select
                    label="Status (optional)"
                    options={statusOptions}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                />
                {!form.status && (
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            label="Check In (HH:MM)"
                            placeholder="09:00"
                            value={form.checkIn}
                            onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                        />
                        <Input
                            label="Check Out (HH:MM)"
                            placeholder="18:00"
                            value={form.checkOut}
                            onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                        />
                    </div>
                )}
                <Input
                    label="Notes"
                    placeholder="Optional"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                />
                <div className="flex gap-3">
                    <Button type="submit" isLoading={loading}>Submit</Button>
                    {message && <p className="text-green-600 dark:text-green-400 self-center">{message}</p>}
                    {error && <p className="text-red-600 dark:text-red-400 self-center">{error}</p>}
                </div>
            </form>
        </Card>
    );
};

export default function AttendancePage() {
    const { user } = useAuth();
    const [refreshKey, setRefreshKey] = useState(0);
    const isAdmin = user?.role === 'admin' || user?.role === 'hr' || user?.role === 'manager';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Management</h1>
                {!isAdmin && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {format(new Date(), 'EEEE, dd MMMM yyyy')}
                    </p>
                )}
            </div>

            {!isAdmin ? (
                <>
                    <CheckInOutCard onSuccess={() => setRefreshKey(k => k + 1)} />
                    <MyAttendanceTable key={refreshKey} />
                </>
            ) : (
                <>
                    <TodaySummary />
                    <TeamReport />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <OvertimeSummary />
                        <ManualEntryForm onSuccess={() => setRefreshKey(k => k + 1)} />
                    </div>
                </>
            )}
        </div>
    );
}