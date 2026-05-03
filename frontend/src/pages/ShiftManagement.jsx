import React, { useState, useEffect } from 'react';
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

const ShiftManagement = () => {
    const { user, meta } = useAuth();   

    // ──────────────────── STATE ────────────────────
    const [shifts, setShifts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Create / Update form
    const [form, setForm] = useState({
        name: '',
        startTime: '',
        endTime: '',
        graceMins: '',
        overtimeAfterMins: '',
        overtimeRateMultiplier: '',
        workDays: [],
        isNightShift: false,
        isActive: true,
    });
    const [editingId, setEditingId] = useState(null);   // null = create mode

    // Assign shift
    const [assignForm, setAssignForm] = useState({
        employeeId: '',
        shiftId: '',
        effectiveFrom: '',
        effectiveTo: '',
    });

    // History / Report
    const [historyEmployeeId, setHistoryEmployeeId] = useState('');
    const [history, setHistory] = useState([]);
    const [reportParams, setReportParams] = useState({ month: '', year: '' });
    const [reportData, setReportData] = useState(null);

    // ──────────────────── FETCH SHIFTS ────────────────────
    const fetchShifts = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getShifts();
            // backend likely returns { data: [...] } or just the array
            const data = res.data?.data || res.data;
            setShifts(Array.isArray(data) ? data : []);
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to fetch shifts';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchShifts();
    }, []);

    // ──────────────────── FORM HANDLING ────────────────────
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        if (name === 'workDays') {
            // workDays is a string like "1,2,3"
            const arr = value
                .split(',')
                .map((s) => s.trim())
                .filter((s) => s !== '')
                .map(Number);
            setForm((prev) => ({ ...prev, [name]: arr }));
        } else if (type === 'checkbox') {
            setForm((prev) => ({ ...prev, [name]: checked }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    const resetForm = () => {
        setForm({
            name: '',
            startTime: '',
            endTime: '',
            graceMins: '',
            overtimeAfterMins: '',
            overtimeRateMultiplier: '',
            workDays: [],
            isNightShift: false,
            isActive: true,
        });
        setEditingId(null);
    };

    // ──────────────────── CREATE / UPDATE ────────────────────
    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            name: form.name,
            startTime: form.startTime,        // HH:mm
            endTime: form.endTime,
            graceMins: Number(form.graceMins),
            overtimeAfterMins: Number(form.overtimeAfterMins),
            overtimeRateMultiplier: Number(form.overtimeRateMultiplier),
            workDays: form.workDays,          // array of numbers
            isNightShift: form.isNightShift,
            isActive: form.isActive,
        };

        try {
            if (editingId) {
                // Update
                await updateShift(editingId, payload);
                toast.success('Shift updated successfully');
            } else {
                // Create
                await createShift(payload);
                toast.success('Shift created successfully');
            }
            fetchShifts();
            resetForm();
        } catch (err) {
            const msg = err?.response?.data?.message || 'Operation failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // Populate form for editing
    const startEdit = (shift) => {
        setForm({
            name: shift.name,
            startTime: shift.startTime,
            endTime: shift.endTime,
            graceMins: shift.graceMins,
            overtimeAfterMins: shift.overtimeAfterMins,
            overtimeRateMultiplier: shift.overtimeRateMultiplier,
            workDays: shift.workDays,
            isNightShift: shift.isNightShift,
            isActive: shift.isActive,
        });
        setEditingId(shift.id);
    };

    // ──────────────────── DELETE ────────────────────
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this shift?')) return;
        setLoading(true);
        try {
            await deleteShift(id);
            toast.success('Shift deleted');
            fetchShifts();
        } catch (err) {
            const msg = err?.response?.data?.message || 'Delete failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // ──────────────────── ASSIGN SHIFT ────────────────────
    const handleAssign = async (e) => {
        e.preventDefault();
        setLoading(true);
        const payload = {
            employeeId: Number(assignForm.employeeId),
            shiftId: Number(assignForm.shiftId),
            effectiveFrom: assignForm.effectiveFrom || undefined,
            effectiveTo: assignForm.effectiveTo || null,
        };
        try {
            await assignShift(payload);
            toast.success('Shift assigned to employee');
            setAssignForm({ employeeId: '', shiftId: '', effectiveFrom: '', effectiveTo: '' });
        } catch (err) {
            const msg = err?.response?.data?.message || 'Assignment failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    // ──────────────────── HISTORY ────────────────────
    const handleFetchHistory = async () => {
        if (!historyEmployeeId) return;
        setLoading(true);
        try {
            const res = await getEmployeeShiftHistory(historyEmployeeId);
            const data = res.data?.data || res.data;
            setHistory(Array.isArray(data) ? data : []);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to fetch history');
            setHistory([]);
        } finally {
            setLoading(false);
        }
    };

    // ──────────────────── REPORT ────────────────────
    const handleFetchReport = async () => {
        setLoading(true);
        try {
            const params = {};
            if (reportParams.month) params.month = Number(reportParams.month);
            if (reportParams.year) params.year = Number(reportParams.year);
            const res = await getShiftReport(params);
            setReportData(res.data?.data || res.data);
            toast.success('Report loaded');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Report failed');
            setReportData(null);
        } finally {
            setLoading(false);
        }
    };

    // ──────────────────── RENDER (only admin/hr) ────────────────────
    if (!user || (user.role !== 'admin' && user.role !== 'hr')) {
        return (
            <div className="p-6 text-center text-red-500">
                Access denied. Only admins / HR can manage shifts.
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 space-y-10">
            <h1 className="text-3xl font-bold">Shift Management</h1>

            {/* ─────────────── LIST ALL SHIFTS ─────────────── */}
            <section>
                <h2 className="text-2xl font-semibold mb-3">All Shifts</h2>
                {loading && <p>Loading shifts...</p>}
                {error && <p className="text-red-600">{error}</p>}
                {!loading && shifts.length === 0 && <p>No shifts found.</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {shifts.map((shift) => (
                        <div
                            key={shift.id}
                            className="border rounded-lg p-4 flex flex-col justify-between shadow"
                        >
                            <div>
                                <h3 className="font-bold text-lg">{shift.name}</h3>
                                <p className="text-sm text-gray-600">
                                    {shift.startTime} – {shift.endTime}
                                </p>
                                <p className="text-sm">
                                    Days: {shift.workDays?.join(', ')} | Active: {shift.isActive ? 'Yes' : 'No'}
                                </p>
                                <p className="text-sm">
                                    Night: {shift.isNightShift ? 'Yes' : 'No'} | Overtime multiplier: {shift.overtimeRateMultiplier}
                                </p>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={() => startEdit(shift)}
                                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(shift.id)}
                                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ─────────────── CREATE / UPDATE FORM ─────────────── */}
            <section className="bg-gray-50 p-6 rounded-xl shadow">
                <h2 className="text-2xl font-semibold mb-4">
                    {editingId ? 'Update Shift' : 'Create New Shift'}
                </h2>
                <form onSubmit={handleCreateOrUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleInputChange}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Start Time (HH:mm)</label>
                        <input
                            type="time"
                            name="startTime"
                            value={form.startTime}
                            onChange={handleInputChange}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">End Time (HH:mm)</label>
                        <input
                            type="time"
                            name="endTime"
                            value={form.endTime}
                            onChange={handleInputChange}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Grace Minutes</label>
                        <input
                            type="number"
                            name="graceMins"
                            value={form.graceMins}
                            onChange={handleInputChange}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Overtime After (mins)</label>
                        <input
                            type="number"
                            name="overtimeAfterMins"
                            value={form.overtimeAfterMins}
                            onChange={handleInputChange}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Overtime Rate Multiplier</label>
                        <input
                            type="number"
                            step="0.1"
                            name="overtimeRateMultiplier"
                            value={form.overtimeRateMultiplier}
                            onChange={handleInputChange}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Work Days (comma separated, 1=Monday)</label>
                        <input
                            type="text"
                            name="workDays"
                            value={form.workDays.join(',')}
                            onChange={handleInputChange}
                            placeholder="1,2,3,4,5"
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isNightShift"
                                checked={form.isNightShift}
                                onChange={handleInputChange}
                            />
                            Night Shift
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={form.isActive}
                                onChange={handleInputChange}
                            />
                            Active
                        </label>
                    </div>
                    <div className="md:col-span-2 flex gap-4 mt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                        >
                            {loading ? 'Saving...' : editingId ? 'Update Shift' : 'Create Shift'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
                            >
                                Cancel Edit
                            </button>
                        )}
                    </div>
                </form>
            </section>

            {/* ─────────────── ASSIGN SHIFT TO EMPLOYEE ─────────────── */}
            <section className="bg-gray-50 p-6 rounded-xl shadow">
                <h2 className="text-2xl font-semibold mb-4">Assign Shift to Employee</h2>
                <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium">Employee ID</label>
                        <input
                            type="number"
                            value={assignForm.employeeId}
                            onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Shift ID</label>
                        <select
                            value={assignForm.shiftId}
                            onChange={(e) => setAssignForm({ ...assignForm, shiftId: e.target.value })}
                            required
                            className="w-full border rounded px-3 py-2"
                        >
                            <option value="">Select a shift</option>
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
                            value={assignForm.effectiveFrom}
                            onChange={(e) => setAssignForm({ ...assignForm, effectiveFrom: e.target.value })}
                            required
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Effective To (optional)</label>
                        <input
                            type="date"
                            value={assignForm.effectiveTo}
                            onChange={(e) => setAssignForm({ ...assignForm, effectiveTo: e.target.value })}
                            className="w-full border rounded px-3 py-2"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Assigning...' : 'Assign Shift'}
                        </button>
                    </div>
                </form>
            </section>

            {/* ─────────────── EMPLOYEE SHIFT HISTORY ─────────────── */}
            <section className="bg-gray-50 p-6 rounded-xl shadow">
                <h2 className="text-2xl font-semibold mb-4">Employee Shift History</h2>
                <div className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium">Employee ID</label>
                        <input
                            type="number"
                            value={historyEmployeeId}
                            onChange={(e) => setHistoryEmployeeId(e.target.value)}
                            className="border rounded px-3 py-2"
                        />
                    </div>
                    <button
                        onClick={handleFetchHistory}
                        disabled={loading}
                        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                        Get History
                    </button>
                </div>
                {history.length > 0 && (
                    <div className="mt-4">
                        <h3 className="font-medium">History for Employee {historyEmployeeId}</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            {history.map((item, idx) => (
                                <li key={idx}>
                                    Shift: {item.shift?.name || item.shiftId} | From: {item.effectiveFrom} {item.effectiveTo ? `To: ${item.effectiveTo}` : '(ongoing)'}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>

            {/* ─────────────── SHIFT REPORT ─────────────── */}
            <section className="bg-gray-50 p-6 rounded-xl shadow">
                <h2 className="text-2xl font-semibold mb-4">Shift Report</h2>
                <div className="flex gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium">Month (optional)</label>
                        <input
                            type="number"
                            min="1"
                            max="12"
                            value={reportParams.month}
                            onChange={(e) => setReportParams({ ...reportParams, month: e.target.value })}
                            className="border rounded px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Year (optional)</label>
                        <input
                            type="number"
                            value={reportParams.year}
                            onChange={(e) => setReportParams({ ...reportParams, year: e.target.value })}
                            className="border rounded px-3 py-2"
                        />
                    </div>
                    <button
                        onClick={handleFetchReport}
                        disabled={loading}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                        Generate Report
                    </button>
                </div>
                {reportData && (
                    <div className="mt-4">
                        <h3 className="font-medium">Report Data</h3>
                        <pre className="bg-white p-4 rounded overflow-auto text-sm">
                            {JSON.stringify(reportData, null, 2)}
                        </pre>
                    </div>
                )}
            </section>
        </div>
    );
};

export default ShiftManagement;