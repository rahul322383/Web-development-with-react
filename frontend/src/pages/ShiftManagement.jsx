import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    createShift,
    getShifts,
    updateShift,
    deleteShift,
    assignShift,
    getEmployeeShiftHistory,
    getShiftReport,
} from '../api/attendance.api';
import { toast } from 'sonner';
import {
    AlertCircle,
    PlusCircle,
    Edit3,
    Trash2,
    Check,
    Calendar,
    Clock,
    RefreshCw,
    UserPlus,
    History,
    FileText,
} from 'lucide-react';

/* ========================== Utilities ========================== */
const unwrap = (res) => {
    let d = res?.data ?? res;
    // Sometimes backend wraps data in { data: { data: ... } }
    for (let i = 0; i < 3; i++) {
        if (d && typeof d === 'object' && 'data' in d && !('_id' in d)) {
            d = d.data;
        } else break;
    }
    return d;
};

const validateRequired = (value, label) => {
    if (value === undefined || value === null || (typeof value === 'string' && !value.trim())) {
        throw new Error(`${label} is required`);
    }
};

const WORKDAYS = [
    { id: 1, label: 'Mon' },
    { id: 2, label: 'Tue' },
    { id: 3, label: 'Wed' },
    { id: 4, label: 'Thu' },
    { id: 5, label: 'Fri' },
    { id: 6, label: 'Sat' },
    { id: 7, label: 'Sun' },
];

/* ========================== Subcomponents ========================== */
const ShiftCard = memo(({ shift, onEdit, onDelete }) => {
    const handleEdit = useCallback(() => onEdit(shift), [shift, onEdit]);
    const handleDelete = useCallback(() => onDelete(shift), [shift, onDelete]);

    return (
        <div className="border rounded-lg p-4 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
            <div>
                <h3 className="font-bold text-lg">{shift.name}</h3>
                <p className="text-sm text-gray-600">
                    <Clock className="inline h-4 w-4 mr-1" />
                    {shift.startTime} – {shift.endTime}
                </p>
                <p className="text-sm">
                    <Calendar className="inline h-4 w-4 mr-1" />
                    Days: {shift.workDays?.join(', ')} | Active: {shift.isActive ? 'Yes' : 'No'}
                </p>
                <p className="text-sm">
                    Night: {shift.isNightShift ? 'Yes' : 'No'} | OT multiplier: {shift.overtimeRateMultiplier}
                </p>
            </div>
            <div className="flex gap-2 mt-3">
                <button
                    onClick={handleEdit}
                    className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                >
                    <Edit3 className="h-4 w-4" /> Edit
                </button>
                <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
                >
                    <Trash2 className="h-4 w-4" /> Delete
                </button>
            </div>
        </div>
    );
});

const ConfirmModal = ({ open, title, message, onConfirm, onCancel }) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-gray-600 mb-4">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 border rounded hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const ShiftList = memo(({ shifts, loading, error, onEdit, onDelete }) => {
    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-gray-400" />
            </div>
        );
    }
    if (error) {
        return (
            <div className="flex flex-col items-center py-8 text-red-500">
                <AlertCircle className="h-10 w-10 mb-2" />
                <p>{error}</p>
            </div>
        );
    }
    if (shifts.length === 0) {
        return (
            <div className="flex flex-col items-center py-8 text-gray-500">
                <Calendar className="h-10 w-10 mb-2" />
                <p className="mb-4">No shifts found. Create your first shift to get started.</p>
                {/* CTA could be exposed via props, but for simplicity we rely on parent's "Create New" form */}
            </div>
        );
    }
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shifts.map((shift) => (
                <ShiftCard key={shift.id} shift={shift} onEdit={onEdit} onDelete={onDelete} />
            ))}
        </div>
    );
});

const ShiftForm = memo(({ editingShift, onSave, onCancel, isSaving }) => {
    const [form, setForm] = useState({
        name: '',
        startTime: '',
        endTime: '',
        graceMins: '0',
        overtimeAfterMins: '0',
        overtimeRateMultiplier: '1.0',
        workDays: [1, 2, 3, 4, 5],
        isNightShift: false,
        isActive: true,
    });

    useEffect(() => {
        if (editingShift) {
            setForm({
                name: editingShift.name || '',
                startTime: editingShift.startTime || '',
                endTime: editingShift.endTime || '',
                graceMins: String(editingShift.graceMins ?? 0),
                overtimeAfterMins: String(editingShift.overtimeAfterMins ?? 0),
                overtimeRateMultiplier: String(editingShift.overtimeRateMultiplier ?? 1),
                workDays: editingShift.workDays || [],
                isNightShift: editingShift.isNightShift || false,
                isActive: editingShift.isActive ?? true,
            });
        }
    }, [editingShift]);

    const updateField = useCallback((name, value) => {
        setForm((prev) => ({ ...prev, [name]: value }));
    }, []);

    const toggleWorkDay = useCallback((day) => {
        setForm((prev) => ({
            ...prev,
            workDays: prev.workDays.includes(day)
                ? prev.workDays.filter((d) => d !== day)
                : [...prev.workDays, day],
        }));
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            validateRequired(form.name, 'Shift name');
            validateRequired(form.startTime, 'Start time');
            validateRequired(form.endTime, 'End time');
            const grace = Number(form.graceMins);
            const otAfter = Number(form.overtimeAfterMins);
            const otMult = Number(form.overtimeRateMultiplier);
            if (isNaN(grace) || grace < 0) throw new Error('Invalid grace minutes');
            if (isNaN(otAfter) || otAfter < 0) throw new Error('Invalid overtime after minutes');
            if (isNaN(otMult) || otMult <= 0) throw new Error('Overtime multiplier must be > 0');
            if (form.workDays.length === 0) throw new Error('Select at least one work day');

            const payload = {
                name: form.name.trim(),
                startTime: form.startTime,
                endTime: form.endTime,
                graceMins: grace,
                overtimeAfterMins: otAfter,
                overtimeRateMultiplier: otMult,
                workDays: form.workDays,
                isNightShift: form.isNightShift,
                isActive: form.isActive,
            };
            onSave(payload);
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl shadow space-y-4">
            <h2 className="text-xl font-semibold">
                {editingShift ? 'Edit Shift' : 'Create New Shift'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Name</label>
                    <input
                        type="text"
                        value={form.name}
                        onChange={(e) => updateField('name', e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Start Time</label>
                    <input
                        type="time"
                        value={form.startTime}
                        onChange={(e) => updateField('startTime', e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">End Time</label>
                    <input
                        type="time"
                        value={form.endTime}
                        onChange={(e) => updateField('endTime', e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Grace Minutes</label>
                    <input
                        type="number"
                        min="0"
                        value={form.graceMins}
                        onChange={(e) => updateField('graceMins', e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Overtime After (mins)</label>
                    <input
                        type="number"
                        min="0"
                        value={form.overtimeAfterMins}
                        onChange={(e) => updateField('overtimeAfterMins', e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">OT Rate Multiplier</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={form.overtimeRateMultiplier}
                        onChange={(e) => updateField('overtimeRateMultiplier', e.target.value)}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
            </div>

            {/* Work Days as checkboxes */}
            <div>
                <label className="block text-sm font-medium mb-2">Work Days</label>
                <div className="flex flex-wrap gap-3">
                    {WORKDAYS.map((day) => (
                        <label key={day.id} className="flex items-center gap-1 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.workDays.includes(day.id)}
                                onChange={() => toggleWorkDay(day.id)}
                            />
                            <span>{day.label}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.isNightShift}
                        onChange={(e) => updateField('isNightShift', e.target.checked)}
                    />
                    Night Shift
                </label>
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) => updateField('isActive', e.target.checked)}
                    />
                    Active
                </label>
            </div>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                    {isSaving ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : editingShift ? (
                        <Check className="h-4 w-4" />
                    ) : (
                        <PlusCircle className="h-4 w-4" />
                    )}
                    {editingShift ? 'Update Shift' : 'Create Shift'}
                </button>
                {editingShift && (
                    <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500">
                        Cancel Edit
                    </button>
                )}
            </div>
        </form>
    );
});

const AssignShiftForm = memo(({ shifts, onAssign, isAssigning }) => {
    const [form, setForm] = useState({
        employeeId: '',
        shiftId: '',
        effectiveFrom: '',
        effectiveTo: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        try {
            validateRequired(form.employeeId, 'Employee ID');
            validateRequired(form.shiftId, 'Shift');
            validateRequired(form.effectiveFrom, 'Effective from date');
            const employeeId = Number(form.employeeId);
            const shiftId = Number(form.shiftId);
            if (isNaN(employeeId) || employeeId <= 0) throw new Error('Invalid Employee ID');
            if (!shifts.find((s) => s.id === shiftId)) throw new Error('Invalid Shift ID');
            if (form.effectiveTo && form.effectiveTo < form.effectiveFrom) {
                throw new Error('"Effective To" must be after "Effective From"');
            }
            onAssign({
                employeeId,
                shiftId,
                effectiveFrom: form.effectiveFrom,
                effectiveTo: form.effectiveTo || null,
            });
            setForm({ employeeId: '', shiftId: '', effectiveFrom: '', effectiveTo: '' });
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl shadow space-y-4">
            <h2 className="text-xl font-semibold">Assign Shift to Employee</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium">Employee ID</label>
                    <input
                        type="number"
                        min="1"
                        value={form.employeeId}
                        onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Shift</label>
                    <select
                        value={form.shiftId}
                        onChange={(e) => setForm({ ...form, shiftId: e.target.value })}
                        required
                        className="w-full border rounded px-3 py-2"
                    >
                        <option value="">Select shift</option>
                        {shifts.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} (ID: {s.id})
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium">Effective From</label>
                    <input
                        type="date"
                        value={form.effectiveFrom}
                        onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })}
                        required
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Effective To (optional)</label>
                    <input
                        type="date"
                        value={form.effectiveTo}
                        onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })}
                        className="w-full border rounded px-3 py-2"
                    />
                </div>
            </div>
            <button
                type="submit"
                disabled={isAssigning}
                className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
            >
                {isAssigning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                Assign Shift
            </button>
        </form>
    );
});

const EmployeeHistory = memo(({ onFetch, history, loading, employeeId, setEmployeeId }) => {
    const handleFetch = () => {
        if (!employeeId) return toast.error('Enter an Employee ID');
        onFetch(Number(employeeId));
    };

    return (
        <div className="bg-gray-50 p-6 rounded-xl shadow space-y-4">
            <h2 className="text-xl font-semibold">Employee Shift History</h2>
            <div className="flex gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium">Employee ID</label>
                    <input
                        type="number"
                        min="1"
                        value={employeeId}
                        onChange={(e) => setEmployeeId(e.target.value)}
                        className="border rounded px-3 py-2"
                    />
                </div>
                <button
                    onClick={handleFetch}
                    disabled={loading}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <History className="h-4 w-4" />}
                    Get History
                </button>
            </div>
            {history.length > 0 && (
                <ul className="list-disc pl-5 space-y-1">
                    {history.map((item, idx) => (
                        <li key={idx}>
                            Shift: {item.shift?.name || item.shiftId} | From: {item.effectiveFrom}{' '}
                            {item.effectiveTo ? `To: ${item.effectiveTo}` : '(ongoing)'}
                        </li>
                    ))}
                </ul>
            )}
            {loading && history.length === 0 && <p className="text-gray-500">Loading history...</p>}
        </div>
    );
});

const ShiftReport = memo(({ onGenerate, reportData, loading }) => {
    const [params, setParams] = useState({ month: '', year: '' });

    const handleGenerate = () => {
        const payload = {};
        if (params.month) payload.month = Number(params.month);
        if (params.year) payload.year = Number(params.year);
        onGenerate(payload);
    };

    return (
        <div className="bg-gray-50 p-6 rounded-xl shadow space-y-4">
            <h2 className="text-xl font-semibold">Shift Report</h2>
            <div className="flex gap-4 items-end">
                <div>
                    <label className="block text-sm font-medium">Month (optional)</label>
                    <input
                        type="number"
                        min="1"
                        max="12"
                        value={params.month}
                        onChange={(e) => setParams({ ...params, month: e.target.value })}
                        className="border rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium">Year (optional)</label>
                    <input
                        type="number"
                        value={params.year}
                        onChange={(e) => setParams({ ...params, year: e.target.value })}
                        className="border rounded px-3 py-2"
                    />
                </div>
                <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                >
                    {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                    Generate Report
                </button>
            </div>
            {reportData && (
                <pre className="bg-white p-4 rounded overflow-auto text-sm">
                    {JSON.stringify(reportData, null, 2)}
                </pre>
            )}
        </div>
    );
});

/* ========================== Main Component ========================== */
const ShiftManagement = () => {
    const { user, meta } = useAuth();

    // Separate loading/error states per operation
    const [shifts, setShifts] = useState([]);
    const [loadingShifts, setLoadingShifts] = useState(false);
    const [errorShifts, setErrorShifts] = useState(null);

    const [editingShift, setEditingShift] = useState(null);
    const [savingShift, setSavingShift] = useState(false);

    const [assigningShift, setAssigningShift] = useState(false);

    const [historyEmployeeId, setHistoryEmployeeId] = useState('');
    const [history, setHistory] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(false);

    const [reportData, setReportData] = useState(null);
    const [loadingReport, setLoadingReport] = useState(false);

    // Delete confirmation
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchShifts = useCallback(async () => {
        setLoadingShifts(true);
        setErrorShifts(null);
        try {
            const data = unwrap(await getShifts());
            setShifts(Array.isArray(data) ? data : []);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to fetch shifts';
            setErrorShifts(msg);
            toast.error(msg);
        } finally {
            setLoadingShifts(false);
        }
    }, []);

    useEffect(() => {
        fetchShifts();
    }, [fetchShifts]);

    // ----- Create / Update -----
    const handleSaveShift = useCallback(
        async (payload) => {
            setSavingShift(true);
            try {
                if (editingShift) {
                    await updateShift(editingShift.id, payload);
                    toast.success('Shift updated');
                } else {
                    await createShift(payload);
                    toast.success('Shift created');
                }
                setEditingShift(null);
                await fetchShifts();
            } catch (err) {
                const msg = err?.response?.data?.message || 'Operation failed';
                toast.error(msg);
            } finally {
                setSavingShift(false);
            }
        },
        [editingShift, fetchShifts]
    );

    const handleEdit = useCallback((shift) => {
        setEditingShift(shift);
    }, []);

    const handleCancelEdit = useCallback(() => {
        setEditingShift(null);
    }, []);

    // ----- Delete with confirmation -----
    const handleDeleteRequest = useCallback((shift) => {
        setDeleteTarget(shift);
    }, []);

    const confirmDelete = useCallback(async () => {
        if (!deleteTarget) return;
        setSavingShift(true); // reuse saving flag for delete loading
        try {
            await deleteShift(deleteTarget.id);
            toast.success('Shift deleted');
            setDeleteTarget(null);
            await fetchShifts();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Delete failed');
        } finally {
            setSavingShift(false);
        }
    }, [deleteTarget, fetchShifts]);

    // ----- Assign -----
    const handleAssign = useCallback(
        async (payload) => {
            setAssigningShift(true);
            try {
                await assignShift(payload);
                toast.success('Shift assigned');
            } catch (err) {
                toast.error(err?.response?.data?.message || 'Assignment failed');
            } finally {
                setAssigningShift(false);
            }
        },
        []
    );

    // ----- History -----
    const handleFetchHistory = useCallback(async (empId) => {
        setLoadingHistory(true);
        try {
            const data = unwrap(await getEmployeeShiftHistory(empId));
            setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to fetch history');
            setHistory([]);
        } finally {
            setLoadingHistory(false);
        }
    }, []);

    // ----- Report -----
    const handleGenerateReport = useCallback(async (params) => {
        setLoadingReport(true);
        try {
            const data = unwrap(await getShiftReport(params));
            setReportData(data);
            toast.success('Report loaded');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Report failed');
            setReportData(null);
        } finally {
            setLoadingReport(false);
        }
    }, []);

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-10">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <Clock className="h-8 w-8" /> Shift Management
            </h1>

            {/* Shift List */}
            <section>
                <ShiftList
                    shifts={shifts}
                    loading={loadingShifts}
                    error={errorShifts}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                />
            </section>

            {/* Create / Edit Form */}
            <ShiftForm
                editingShift={editingShift}
                onSave={handleSaveShift}
                onCancel={handleCancelEdit}
                isSaving={savingShift}
            />

            {/* Assign Shift */}
            <AssignShiftForm
                shifts={shifts}
                onAssign={handleAssign}
                isAssigning={assigningShift}
            />

            {/* Employee History */}
            <EmployeeHistory
                onFetch={handleFetchHistory}
                history={history}
                loading={loadingHistory}
                employeeId={historyEmployeeId}
                setEmployeeId={setHistoryEmployeeId}
            />

            {/* Shift Report */}
            <ShiftReport
                onGenerate={handleGenerateReport}
                reportData={reportData}
                loading={loadingReport}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                open={!!deleteTarget}
                title="Delete Shift"
                message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
};

export default ShiftManagement;