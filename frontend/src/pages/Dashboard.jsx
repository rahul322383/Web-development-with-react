import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  memo,
} from "react";
import { motion } from "framer-motion";
import {
  Users, Calendar, Receipt, DollarSign, TrendingUp, Clock,
  HelpCircle, RefreshCw, Download, CalendarDays, ChevronRight,
  UserPlus, Briefcase, Activity, AlertCircle, CheckCircle,
  XCircle, Clock3,
} from "lucide-react";
import { userApi } from "../api/userApi";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../components/ui/StatCardSkeleton";

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const NUMBER_FORMATTER = new Intl.NumberFormat("en-IN");

const formatCurrency = (n) => CURRENCY_FORMATTER.format(Number(n) || 0);
const formatNumber = (n) => NUMBER_FORMATTER.format(Number(n) || 0);

// -----------------------------------------------------------------------------
// DashboardChart — fully hardened canvas renderer
// -----------------------------------------------------------------------------

const DashboardChart = memo(({ type = "bar", data, loading, height = 300 }) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    if (loading || !data?.labels?.length || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const container = canvas.parentElement;
    if (!ctx || !container) return;

    const draw = () => {
      const dpr = window.devicePixelRatio || 1;

      // FIX: clamp container width — avoids division by zero on first render
      const cssWidth = Math.max(container.clientWidth, 300);
      const cssHeight = height;

      canvas.width = cssWidth * dpr;
      canvas.height = cssHeight * dpr;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const padding = { top: 20, right: 20, bottom: 40, left: 60 };

      // FIX: clamp chart area — never goes negative
      const chartHeight = Math.max(cssHeight - padding.top - padding.bottom, 100);
      const chartW = Math.max(cssWidth - padding.left - padding.right, 1);

      // FIX: safe dataset extraction with type coercion
      const dataset = data?.datasets?.[0];
      if (!dataset) return;

      const values = Array.isArray(dataset.data)
        ? dataset.data.map((v) => Number(v) || 0)
        : [];
      if (!values.length) return;

      const maxValue = Math.max(...values, 1);

      // FIX: only accept hex colors for gradient — fall back cleanly otherwise
      const isHex = (c) => typeof c === "string" && /^#[0-9A-Fa-f]{3,8}$/.test(c);
      const rawBg = dataset.backgroundColor;
      const bg = isHex(rawBg) ? rawBg : "#4F46E5";
      const line = typeof dataset.borderColor === "string" ? dataset.borderColor : bg;

      ctx.clearRect(0, 0, cssWidth, cssHeight);

      // Grid lines
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(cssWidth - padding.right, y);
        ctx.stroke();
      }

      // Y-axis labels
      ctx.fillStyle = "#94a3b8";
      ctx.font = "10px Inter, sans-serif";
      ctx.textAlign = "right";
      for (let i = 0; i <= 5; i++) {
        const val = Math.round((maxValue / 5) * (5 - i));
        const y = padding.top + (chartHeight / 5) * i;
        ctx.fillText(formatNumber(val), padding.left - 6, y + 3);
      }

      // ── Bar chart ──────────────────────────────────────────────────
      if (type === "bar") {
        const slot = chartW / values.length;
        if (!Number.isFinite(slot) || slot <= 0) return;

        const barWidth = slot * 0.65;
        const barOffset = slot * 0.175; // centres the bar inside the slot

        ctx.font = "10px Inter, sans-serif";
        ctx.textAlign = "center";

        values.forEach((value, i) => {
          const safeVal = Math.max(Number(value) || 0, 0);
          const barHeight = (safeVal / maxValue) * chartHeight;
          const x = padding.left + i * slot + barOffset;
          const y = padding.top + chartHeight - barHeight;

          // Guard: skip degenerate geometry
          if (
            !Number.isFinite(x) || !Number.isFinite(y) ||
            !Number.isFinite(barWidth) || !Number.isFinite(barHeight) ||
            barWidth <= 0 || barHeight < 0
          ) return;

          // Gradient — safe because bg is validated hex
          const gradient = ctx.createLinearGradient(x, y, x, y + barHeight);
          gradient.addColorStop(0, bg);
          gradient.addColorStop(1, `${bg}99`);

          ctx.fillStyle = gradient;
          ctx.globalAlpha = 0.9;
          ctx.beginPath();

          // Rounded top corners
          const r = Math.min(4, barWidth / 2, barHeight);
          if (barHeight > r) {
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + barWidth - r, y);
            ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + r);
            ctx.lineTo(x + barWidth, y + barHeight);
            ctx.lineTo(x, y + barHeight);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
          } else {
            ctx.rect(x, y, barWidth, barHeight);
          }
          ctx.fill();
          ctx.globalAlpha = 1;

          // Value label above bar
          if (safeVal > 0) {
            ctx.fillStyle = "#64748b";
            ctx.fillText(safeVal, x + barWidth / 2, y - 5);
          }
        });
      }

      // ── Line chart ─────────────────────────────────────────────────
      if (type === "line") {
        const denom = Math.max(values.length - 1, 1);
        const points = values.map((v, i) => ({
          x: padding.left + (i * chartW) / denom,
          y: padding.top + chartHeight - (Math.max(Number(v) || 0, 0) / maxValue) * chartHeight,
        }));

        // Area fill
        ctx.beginPath();
        points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.lineTo(points[points.length - 1].x, padding.top + chartHeight);
        ctx.lineTo(points[0].x, padding.top + chartHeight);
        ctx.closePath();

        const areaGrad = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
        areaGrad.addColorStop(0, `${line}33`);
        areaGrad.addColorStop(1, `${line}00`);
        ctx.fillStyle = isHex(line) ? areaGrad : `${line}22`;
        ctx.fill();

        // Line
        ctx.beginPath();
        ctx.strokeStyle = line;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = "round";
        points.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
        ctx.stroke();

        // Dots
        points.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = line;
          ctx.fill();
          ctx.strokeStyle = "#fff";
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }

      // X-axis labels
      ctx.fillStyle = "#94a3b8";
      ctx.font = "11px Inter, sans-serif";
      ctx.textAlign = "center";

      const labelCount = data.labels.length;
      const labelDenom = Math.max(labelCount - 1, 1);

      if (type === "bar") {
        const slot = chartW / labelCount;
        data.labels.forEach((label, i) => {
          const x = padding.left + i * slot + slot / 2;
          ctx.fillText(label, x, cssHeight - padding.bottom + 20);
        });
      } else {
        data.labels.forEach((label, i) => {
          const x = padding.left + (i * chartW) / labelDenom;
          ctx.fillText(label, x, cssHeight - padding.bottom + 20);
        });
      }
    };

    const scheduleDraw = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(draw);
    };

    scheduleDraw();

    const ro = new ResizeObserver(scheduleDraw);
    ro.observe(container);

    return () => {
      ro.disconnect();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [data, loading, height, type]);

  if (loading) {
    return (
      <div className="w-full animate-pulse" aria-busy="true">
        <div className="bg-slate-200 dark:bg-slate-700 rounded-lg" style={{ height }} />
      </div>
    );
  }

  if (!data?.datasets?.[0]?.data?.length) {
    return (
      <div className="flex items-center justify-center text-slate-400 dark:text-slate-600 text-sm" style={{ height }}>
        No data available
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden">
      <canvas ref={canvasRef} role="img" aria-label="Chart" />
    </div>
  );
});
DashboardChart.displayName = "DashboardChart";

// -----------------------------------------------------------------------------
// Spinner
// -----------------------------------------------------------------------------

const LoadingSpinner = memo(({ size = "default", text = "Loading..." }) => {
  const sizeClass =
    size === "small" ? "h-8 w-8" : size === "large" ? "h-16 w-16" : "h-12 w-12";
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className={`animate-spin rounded-full ${sizeClass} border-b-2 border-blue-600 dark:border-blue-400 mx-auto`} />
        <p className="mt-4 text-gray-600 dark:text-gray-400">{text}</p>
      </div>
    </div>
  );
});
LoadingSpinner.displayName = "LoadingSpinner";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const unwrap = (resp) => {
  let d = resp?.data ?? resp;
  for (let i = 0; i < 3; i++) {
    if (d && typeof d === "object" && "data" in d && !("summary" in d)) d = d.data;
    else break;
  }
  return d;
};

const isSameMonth = (date, m, y) => {
  const d = new Date(date);
  return d.getMonth() === m && d.getFullYear() === y;
};

// -----------------------------------------------------------------------------
// Sub-components
// -----------------------------------------------------------------------------

const ActivityItem = memo(({ activity }) => {
  const Icon = activity.icon;
  return (
    <div className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
      <Icon className="h-4 w-4 text-indigo-600 mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{activity.description}</p>
        <p className="text-xs text-slate-500 mt-0.5">{activity.time}</p>
      </div>
    </div>
  );
});
ActivityItem.displayName = "ActivityItem";

const QuickStatRow = memo(({ icon: Icon, color, label, value }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
    <div className="flex items-center gap-2">
      <Icon className={`h-4 w-4 ${color} shrink-0`} />
      <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>
    </div>
    <span className="font-semibold text-slate-900 dark:text-white">{value}</span>
  </div>
));
QuickStatRow.displayName = "QuickStatRow";

const PendingLeaveRow = memo(({ leave }) => (
  <tr className="border-b border-slate-200 dark:border-slate-700 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
    <td className="py-3 px-4">
      <p className="text-sm font-medium text-slate-900 dark:text-white">{leave.employeeName || "Unknown"}</p>
      <p className="text-xs text-slate-500">{leave.employeeEmail}</p>
    </td>
    <td className="py-3 px-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
      </p>
    </td>
    <td className="py-3 px-4">
      <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
        {leave.reason?.replace(/-/g, " ") || "N/A"}
      </p>
    </td>
    <td className="py-3 px-4">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
        Pending
      </span>
    </td>
  </tr>
));
PendingLeaveRow.displayName = "PendingLeaveRow";

// -----------------------------------------------------------------------------
// Dashboard
// -----------------------------------------------------------------------------

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const abortRef = useRef(null);

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (!isRefresh) setLoading(true);
      const response = await userApi.getDashboardSummary({ signal: controller.signal });
      if (controller.signal.aborted) return;

      const innerData = unwrap(response);
      if (innerData?.summary) {
        setDashboardData(innerData);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      if (error?.name === "AbortError" || controller.signal.aborted) return;
      console.error("Dashboard fetch error:", error);
      toast.error("Failed to load dashboard data");
      setDashboardData(null);
    } finally {
      if (!controller.signal.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    return () => abortRef.current?.abort?.();
  }, [fetchDashboardData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData(true);
  }, [fetchDashboardData]);

  // ── Single-pass data processing ──────────────────────────────────────────

  const processedData = useMemo(() => {
    if (!dashboardData) return null;

    const {
      summary = {},
      charts = null,
      users = {},
      leaves = {},
      expenses = {},
    } = dashboardData;

    const userList = Array.isArray(users?.data) ? users.data : [];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let activeEmployees = 0;
    let newHiresThisMonth = 0;
    const departmentMap = new Map();

    for (const u of userList) {
      if (u.isActive) activeEmployees++;
      if (u.createdAt && isSameMonth(u.createdAt, currentMonth, currentYear)) {
        newHiresThisMonth++;
      }
      if (u.department) {
        const entry = departmentMap.get(u.department) || { employeeCount: 0, totalSalary: 0 };
        entry.employeeCount++;
        entry.totalSalary += parseFloat(u.baseSalary || 0);
        departmentMap.set(u.department, entry);
      }
    }

    const departmentStats = Array.from(departmentMap.entries()).map(([name, v]) => ({ name, ...v }));

    const approvedLeaves = summary?.leaves?.approved || 0;
    const pendingLeaves = summary?.leaves?.pending || 0;
    const rejectedLeaves = summary?.leaves?.rejected || 0;
    const totalLeaveRequests = approvedLeaves + pendingLeaves + rejectedLeaves;
    const totalUsers = summary?.totalUsers || 0;
    const attendanceRate = totalUsers > 0
      ? Math.min(100, Math.max(0, Math.round(100 - (totalLeaveRequests / totalUsers) * 5)))
      : 100;

    // Recent activities — capped slices
    const recentActivities = [];

    for (let i = 0; i < Math.min(3, userList.length); i++) {
      const u = userList[i];
      recentActivities.push({
        type: "hire",
        description: `${u.firstName} ${u.lastName} joined ${u.department}`,
        time: new Date(u.createdAt).toLocaleDateString(),
        sortKey: new Date(u.createdAt).getTime(),
        icon: UserPlus,
      });
    }

    const pendingLeavesList = leaves?.segmented?.pending || leaves?.pending || [];
    for (let i = 0; i < Math.min(2, pendingLeavesList.length); i++) {
      const l = pendingLeavesList[i];
      recentActivities.push({
        type: "leave",
        description: `${l.employeeName || "Employee"} requested leave`,
        time: new Date(l.startDate).toLocaleDateString(),
        sortKey: new Date(l.startDate).getTime(),
        icon: Calendar,
      });
    }

    const expenseList = Array.isArray(expenses?.data) ? expenses.data : [];
    for (let i = 0; i < Math.min(2, expenseList.length); i++) {
      const e = expenseList[i];
      recentActivities.push({
        type: "expense",
        description: `${e.employeeName} submitted expense of ₹${e.amount}`,
        time: new Date(e.createdAt).toLocaleDateString(),
        sortKey: new Date(e.createdAt).getTime(),
        icon: Receipt,
      });
    }

    recentActivities.sort((a, b) => b.sortKey - a.sortKey);

    // FIX: ensure chart arrays are always valid numbers
    const sanitizeChartArray = (arr) =>
      Array.isArray(arr) ? arr.map((v) => Number(v) || 0) : new Array(12).fill(0);

    const leaveChartData = {
      labels: MONTHS,
      datasets: [{
        label: "Leave Requests",
        data: sanitizeChartArray(charts?.leaves),
        backgroundColor: "#4F46E5",
        borderColor: "#4F46E5",
      }],
    };

    const departmentChartData = {
      labels: departmentStats.map((d) => d.name),
      datasets: [{
        label: "Employees",
        data: departmentStats.map((d) => d.employeeCount),
        backgroundColor: "#8B5CF6",
        borderColor: "#8B5CF6",
      }],
    };

    return {
      summary: {
        totalEmployees: totalUsers,
        activeEmployees,
        pendingLeaves,
        approvedLeaves,
        rejectedLeaves,
        newLeaves: summary?.newLeaves || 0,
        expensesClaimed: summary?.finance?.expensesClaimed || 0,
        salaryPaid: summary?.finance?.salaryPaid || 0,
        departments: departmentStats.length,
        newHiresThisMonth,
        attendanceRate,
      },
      charts: { leaves: leaveChartData, departments: departmentChartData },
      recentActivities: recentActivities.slice(0, 5),
      departmentStats,
      pendingLeaves: pendingLeavesList,
      users: userList,
    };
  }, [dashboardData]);

  const quickStats = useMemo(() => {
    if (!processedData) return [];
    const { summary } = processedData;
    return [
      {
        title: "Total Employees",
        value: formatNumber(summary.totalEmployees),
        icon: Users,
        trend: summary.newHiresThisMonth > 0 ? "up" : "neutral",
        trendValue: summary.newHiresThisMonth > 0 ? `+${summary.newHiresThisMonth}` : null,
        color: "indigo",
        subtext: `${summary.newHiresThisMonth} new this month`,
        path: "/users",
      },
      {
        title: "Pending Leaves",
        value: formatNumber(summary.pendingLeaves),
        icon: Calendar,
        trend: summary.newLeaves > 0 ? "up" : "neutral",
        trendValue: summary.newLeaves > 0 ? `+${summary.newLeaves}` : null,
        color: "amber",
        subtext: `${summary.approvedLeaves} approved`,
        path: "/pending-leave",
      },
      {
        title: "Expenses Claimed",
        value: formatCurrency(summary.expensesClaimed),
        icon: Receipt,
        trend: "neutral",
        trendValue: null,
        color: "rose",
        subtext: "Total claimed expenses",
        path: "/expenses",
      },
      {
        title: "Salary Paid",
        value: formatCurrency(summary.salaryPaid),
        icon: DollarSign,
        trend: "neutral",
        trendValue: null,
        color: "emerald",
        subtext: "Total salary disbursed",
        path: "/payroll",
      },
    ];
  }, [processedData]);

  const todayString = useMemo(() =>
    new Date().toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" }), []);

  const userFirstName = user?.firstName || user?.name?.split(" ")?.[0] || "User";

  if (loading && !dashboardData) return <LoadingSpinner text="Loading dashboard..." />;

  if (!processedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Data Available</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Unable to load dashboard data</p>
          <button onClick={handleRefresh} className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary, charts, recentActivities, pendingLeaves } = processedData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Welcome back,{" "}
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">{userFirstName}</span>!
                {" "}Here's what's happening with your organization.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Time period"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <button className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays className="w-4 h-4" />
            <span>{todayString}</span>
            <span className="mx-2">•</span>
            <span>Last updated: Just now</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="cursor-pointer"
              onClick={() => stat.path && navigate(stat.path)}
            >
              <StatCard {...stat} loading={loading} />
            </motion.div>
          ))}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Monthly Leave Requests
              </h3>
              <button
                onClick={() => navigate("/leave")}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <DashboardChart type="bar" data={charts.leaves} loading={loading} height={300} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Employees by Department
              </h3>
              <button
                onClick={() => navigate("/department-dashboard")}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <DashboardChart type="bar" data={charts.departments} loading={loading} height={300} />
          </motion.div>
        </div>

        {/* Bottom grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activities</h3>
            </div>
            <div className="space-y-3">
              {recentActivities.length > 0 ? (
                recentActivities.map((a, i) => <ActivityItem key={i} activity={a} />)
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">No recent activities</p>
              )}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Quick Stats</h3>
            </div>
            <div className="space-y-3">
              <QuickStatRow icon={UserPlus} color="text-emerald-600" label="New Hires (This Month)" value={formatNumber(summary.newHiresThisMonth)} />
              <QuickStatRow icon={Briefcase} color="text-indigo-600" label="Active Departments" value={formatNumber(summary.departments)} />
              <QuickStatRow icon={Activity} color="text-purple-600" label="Attendance Rate" value={`${summary.attendanceRate}%`} />
              <QuickStatRow icon={CheckCircle} color="text-emerald-600" label="Active Employees" value={formatNumber(summary.activeEmployees)} />
              <QuickStatRow icon={XCircle} color="text-rose-600" label="Rejected Leaves" value={formatNumber(summary.rejectedLeaves)} />
            </div>
          </motion.div>

          {/* Help & Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Need Help?</h3>
            </div>
            <p className="text-indigo-100 text-sm mb-6">
              Get the most out of HRMS with our comprehensive guides and dedicated support team.
            </p>
            <div className="space-y-3">
              <button className="w-full bg-white text-indigo-600 px-4 py-3 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-all">
                View Documentation
              </button>
              <button className="w-full bg-indigo-500/20 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-indigo-500/30 transition-all backdrop-blur border border-indigo-300/30">
                Contact Support
              </button>
            </div>
            <div className="mt-6 pt-6 border-t border-indigo-400/30 flex items-center justify-between text-sm">
              <span className="text-indigo-200">Response time</span>
              <span className="font-semibold">&lt; 2 hours</span>
            </div>
          </motion.div>
        </div>

        {/* Pending Leaves Table */}
        {pendingLeaves.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock3 className="w-5 h-5 text-amber-600" />
                Pending Leave Requests
              </h3>
              <button
                onClick={() => navigate("/pending-leave")}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Employee</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Date Range</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Reason</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingLeaves.slice(0, 5).map((leave) => (
                    <PendingLeaveRow key={leave.id} leave={leave} />
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;