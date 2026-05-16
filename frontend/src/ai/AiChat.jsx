import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    MessageCircle, X, Send, Trash2, Loader2, Bot, User,
    RefreshCw, TrendingUp, Clock, Activity, ChevronDown, ChevronUp,
    Briefcase, Search, Star, AlertTriangle, BarChart2, UserCheck,
    FileText, Calendar, Shield, Award, Bell, DollarSign,
    CheckCircle, XCircle, Settings, Archive, Layers,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG & API
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL;

const getToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") || "";

const sendMessage = async (message) => {
    const res = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ message }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Request failed");
    }
    return res.json();
};

const clearServerHistory = async () => {
    await fetch(`${API_BASE}/ai/chat/history`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// RESPONSIVE HOOK
// ─────────────────────────────────────────────────────────────────────────────
const useViewport = () => {
    const [vp, setVp] = useState({ width: window.innerWidth, height: window.innerHeight });
    useEffect(() => {
        const h = () => setVp({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener("resize", h);
        return () => window.removeEventListener("resize", h);
    }, []);
    return {
        ...vp,
        isMobile: vp.width < 480,
        isSmall: vp.width < 640,
        isTablet: vp.width >= 480 && vp.width < 1024,
        isLarge: vp.width >= 1024,
    };
};

// ─────────────────────────────────────────────────────────────────────────────
// QUICK Q&A — offline instant answers
// ─────────────────────────────────────────────────────────────────────────────
const QUICK_QA = {
    "notice period": "Notice: 30 days for employees, 60 days for managers, 90 days for VP+.",
    "wfh policy": "WFH requires manager pre-approval via HRMS. Max 8 WFH days/month.",
    "can i work from home": "Yes! WFH must be pre-approved by your manager.",
    "salary date": "Salary is credited on the last working day of every month.",
    "when is salary": "Salary is credited on the last working day of every month.",
    "probation": "Probation is 3 months. Only 3 casual leaves allowed during probation.",
    "carry over": "Only Paid leave carries over — max 10 days. Excess is encashed.",
    "leave carry": "Paid leave carries over to next year — maximum 10 days. Excess encashed.",
    "overtime": "Overtime is paid above 9 hours/day with prior manager approval.",
    "medical certificate": "Medical certificate required for 3+ consecutive sick leaves.",
    "attendance minimum": "Minimum 70% attendance required per month. Below 70% triggers HR review.",
    "late arrival": "Marked Late if check-in after 9:15 AM. Early departure before 5:45 PM.",
    "working hours": "Standard: 9:00 AM – 6:00 PM, Monday to Friday.",
    "half day": "Half-day leaves are not supported. Minimum unit is 1 full working day.",
    "expense limit": "Meal: ₹150/day on travel. Accommodation cap: ₹3000/night. Bills required.",
    "referral bonus": "Referral bonus ₹10,000 on successful hire after 3 months.",
    "night shift": "Night shift (10 PM–7 AM) gets ₹2000/month allowance + 2 extra paid leaves/year.",
};

const getQuickAnswer = (msg) => {
    const lower = msg.toLowerCase().trim();
    for (const [key, val] of Object.entries(QUICK_QA)) {
        if (lower.includes(key)) return val;
    }
    return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// SUGGESTION GROUPS — mirrored from backend ALLOWED_ACTIONS
// ─────────────────────────────────────────────────────────────────────────────
const SUGGESTION_GROUPS = [
    {
        label: "My Info",
        icon: User,
        color: "#6366F1",
        items: [
            "How many leaves do I have?",
            "Show my attendance this month",
            "Show my latest payslip",
            "View my profile",
        ],
    },
    {
        label: "Leave & Shifts",
        icon: Calendar,
        color: "#0EA5E9",
        items: [
            "Apply casual leave tomorrow",
            "Show my pending leaves",
            "Show my current shift",
            "Upcoming public holidays",
        ],
    },
    {
        label: "Expenses",
        icon: DollarSign,
        color: "#10B981",
        items: [
            "Show my expense claims",
            "Submit a travel expense of ₹500",
            "Show team pending expenses",
            "Get my expense summary",
        ],
    },
    {
        label: "HR Policies",
        icon: Shield,
        color: "#8B5CF6",
        items: [
            "WFH policy",
            "What is the notice period?",
            "When is salary credited?",
            "Leave carry over policy",
        ],
    },
    {
        label: "Manager Tools",
        icon: BarChart2,
        color: "#F59E0B",
        items: [
            "Who is on leave tomorrow?",
            "Show late employees this week",
            "Team burnout report",
            "Predict attrition risk",
        ],
    },
    {
        label: "Recruitment",
        icon: Briefcase,
        color: "#EC4899",
        items: [
            "Show open positions",
            "Rank candidates for job 1",
            "Generate JD for Backend Developer",
            "Recruitment funnel summary",
        ],
    },
    {
        label: "Reports & Admin",
        icon: Archive,
        color: "#64748B",
        items: [
            "Generate attendance report",
            "Generate leave report",
            "Year-end summary",
            "Get audit logs",
        ],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────
const T = {
    purple: { bg: "#F5F3FF", border: "#DDD6FE", text: "#5B21B6", accent: "#7C3AED", light: "#EDE9FE" },
    blue: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF", accent: "#2563EB", light: "#DBEAFE" },
    green: { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534", accent: "#16A34A", light: "#DCFCE7" },
    amber: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", accent: "#D97706", light: "#FEF3C7" },
    red: { bg: "#FFF5F5", border: "#FECACA", text: "#991B1B", accent: "#DC2626", light: "#FEE2E2" },
    sky: { bg: "#F0F9FF", border: "#BAE6FD", text: "#0369A1", accent: "#0EA5E9", light: "#E0F2FE" },
    pink: { bg: "#FDF2F8", border: "#FBCFE8", text: "#9D174D", accent: "#EC4899", light: "#FCE7F3" },
    teal: { bg: "#F0FDFA", border: "#99F6E4", text: "#134E4A", accent: "#0D9488", light: "#CCFBF1" },
    orange: { bg: "#FFF7ED", border: "#FED7AA", text: "#9A3412", accent: "#EA580C", light: "#FFEDD5" },
    slate: { bg: "#F8FAFC", border: "#CBD5E1", text: "#334155", accent: "#475569", light: "#F1F5F9" },
    indigo: { bg: "#EEF2FF", border: "#C7D2FE", text: "#3730A3", accent: "#4F46E5", light: "#E0E7FF" },
    emerald: { bg: "#ECFDF5", border: "#A7F3D0", text: "#065F46", accent: "#059669", light: "#D1FAE5" },
};

const STATUS_COLORS = {
    Pending: { bg: "#FFF3CD", text: "#856404", border: "#FFE69C" },
    Approved: { bg: "#D1E7DD", text: "#0F5132", border: "#A3CFBB" },
    Rejected: { bg: "#F8D7DA", text: "#842029", border: "#F5C2C7" },
    Cancelled: { bg: "#E2E3E5", text: "#41464B", border: "#C4C8CB" },
    Present: { bg: "#D1E7DD", text: "#0F5132", border: "#A3CFBB" },
    Absent: { bg: "#F8D7DA", text: "#842029", border: "#F5C2C7" },
    Late: { bg: "#FFF3CD", text: "#856404", border: "#FFE69C" },
    WFH: { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" },
    High: { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },
    Medium: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
    Low: { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" },
    Strong: { bg: "#D1E7DD", text: "#0F5132", border: "#A3CFBB" },
    "Strong fit": { bg: "#D1E7DD", text: "#0F5132", border: "#A3CFBB" },
    Moderate: { bg: "#FFF3CD", text: "#856404", border: "#FFE69C" },
    "Moderate fit": { bg: "#FFF3CD", text: "#856404", border: "#FFE69C" },
    Weak: { bg: "#F8D7DA", text: "#842029", border: "#F5C2C7" },
    "Weak fit": { bg: "#F8D7DA", text: "#842029", border: "#F5C2C7" },
    Open: { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" },
    Closed: { bg: "#E2E3E5", text: "#41464B", border: "#C4C8CB" },
};

// ─────────────────────────────────────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Badge = ({ status }) => {
    const s = STATUS_COLORS[status] || STATUS_COLORS.Cancelled;
    return (
        <span style={{
            background: s.bg, color: s.text, border: `1px solid ${s.border}`,
            fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
            letterSpacing: "0.02em", whiteSpace: "nowrap", display: "inline-block",
        }}>{status}</span>
    );
};

const CardShell = ({ color = T.slate, icon: Icon, label, children, rightEl }) => (
    <div style={{
        marginTop: 8, background: color.bg, borderRadius: 12,
        padding: "10px 12px", border: `1px solid ${color.border}`,
    }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                {Icon && <Icon size={12} color={color.accent} strokeWidth={2.5} />}
                <span style={{
                    fontSize: 10, fontWeight: 700, color: color.accent,
                    textTransform: "uppercase", letterSpacing: "0.07em",
                }}>{label}</span>
            </div>
            {rightEl}
        </div>
        {children}
    </div>
);

const ScoreBar = ({ score, color, label }) => (
    <div style={{ marginTop: 4 }}>
        {label && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6B7280", marginBottom: 2 }}>
                <span>{label}</span>
                <span style={{ fontWeight: 700, color }}>{score}/100</span>
            </div>
        )}
        <div style={{ height: 4, background: "#E5E7EB", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
                width: `${Math.min(score, 100)}%`, height: "100%", background: color,
                borderRadius: 4, transition: "width 0.7s cubic-bezier(0.34,1.56,0.64,1)",
            }} />
        </div>
    </div>
);

const StatPill = ({ val, label, bg, text }) => (
    <div style={{ flex: 1, background: bg, borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
        <p style={{ fontSize: 20, fontWeight: 800, color: text, margin: 0, lineHeight: 1 }}>{val}</p>
        <p style={{ fontSize: 10, color: text, margin: 0, opacity: 0.75, marginTop: 2 }}>{label}</p>
    </div>
);

const Row = ({ label, value, dimLabel, rightColor }) => (
    <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "4px 0", borderBottom: "1px solid rgba(0,0,0,0.04)", fontSize: 12,
    }}>
        <span style={{ color: dimLabel ? "#9CA3AF" : "#374151" }}>{label}</span>
        <span style={{ fontWeight: 600, color: rightColor || "#111827" }}>{value}</span>
    </div>
);

const TagRow = ({ tags, bg, text, border }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
        {(tags || []).map((t, i) => (
            <span key={i} style={{
                fontSize: 10, background: bg, color: text,
                border: `1px solid ${border}`, borderRadius: 12, padding: "1px 7px",
            }}>{t}</span>
        ))}
    </div>
);

const ExpandBtn = ({ expanded, setExpanded, total, shown, color }) =>
    total > shown ? (
        <button onClick={() => setExpanded(v => !v)} style={{
            display: "flex", alignItems: "center", gap: 4, fontSize: 11,
            color, background: "none", border: "none", cursor: "pointer",
            padding: "4px 0 0", marginTop: 2,
        }}>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Show less" : `Show ${total - shown} more`}
        </button>
    ) : null;

const fmt = (n) => Number(n || 0).toLocaleString("en-IN");
const MN = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// ─────────────────────────────────────────────────────────────────────────────
// DATA CARDS — each matched to exact backend response shapes
// ─────────────────────────────────────────────────────────────────────────────

// Backend: { type:'leave_balance', balance: { sickRemaining, casualRemaining, paidRemaining,
//            maternityRemaining, paternityRemaining, bereavementRemaining, totalRemaining } }
const LeaveBalanceCard = ({ balance }) => {
    if (!balance) return null;
    // totalRemaining is now computed server-side and passed explicitly
    const total = balance.totalRemaining ??
        ((balance.sickRemaining ?? 0) + (balance.casualRemaining ?? 0) + (balance.paidRemaining ?? 0) +
            (balance.maternityRemaining ?? 0) + (balance.paternityRemaining ?? 0) + (balance.bereavementRemaining ?? 0));

    const tiles = [
        { label: "Sick", val: balance.sickRemaining ?? 0 },
        { label: "Casual", val: balance.casualRemaining ?? 0 },
        { label: "Paid", val: balance.paidRemaining ?? 0 },
        { label: "Maternity", val: balance.maternityRemaining ?? 0 },
        { label: "Paternity", val: balance.paternityRemaining ?? 0 },
        { label: "Bereavement", val: balance.bereavementRemaining ?? 0 },
    ];

    return (
        <CardShell color={T.purple} icon={Calendar} label={`Leave Balance ${new Date().getFullYear()}`}
            rightEl={
                <div style={{
                    background: T.purple.accent, borderRadius: 8, padding: "2px 10px",
                    fontSize: 12, fontWeight: 800, color: "#fff",
                }}>
                    {total} days left
                </div>
            }>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
                {tiles.map(t => (
                    <div key={t.label} style={{
                        background: "#fff", borderRadius: 8, padding: "6px 8px",
                        border: `1px solid ${T.purple.border}`, textAlign: "center",
                    }}>
                        <p style={{ fontSize: 10, color: "#9CA3AF", margin: 0 }}>{t.label}</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: t.val === 0 ? "#DC2626" : "#111827", margin: 0, lineHeight: 1.2 }}>{t.val}</p>
                    </div>
                ))}
            </div>
        </CardShell>
    );
};

// Backend: { type:'leave_list', leaves: [{ id, leaveType, status, startDate, endDate, daysRequested, reason }] }
const LeaveListCard = ({ leaves, onAction }) => {
    if (!leaves?.length) return null;
    return (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {leaves.map(l => (
                <div key={l.id} style={{
                    background: "#fff", borderRadius: 10, padding: "9px 12px",
                    border: "1px solid #E5E7EB",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{l.leaveType || "Leave"}</span>
                        <Badge status={l.status} />
                    </div>
                    <p style={{ color: "#6B7280", fontSize: 12, margin: "2px 0" }}>
                        {l.startDate} → {l.endDate} · <strong>{l.daysRequested}</strong> day(s)
                    </p>
                    {l.reason && <p style={{ color: "#9CA3AF", fontSize: 11, margin: 0, fontStyle: "italic" }}>{l.reason}</p>}
                    {l.rejectionReason && (
                        <p style={{ color: "#DC2626", fontSize: 11, margin: "3px 0 0" }}>
                            Reason: {l.rejectionReason}
                        </p>
                    )}
                    {l.status === "Pending" && (
                        <button onClick={() => onAction(`cancel leave ${l.id}`)} style={{
                            marginTop: 6, fontSize: 11, color: "#DC2626",
                            background: "none", border: "1px solid #FECACA",
                            borderRadius: 6, padding: "2px 10px", cursor: "pointer",
                        }}>Cancel</button>
                    )}
                </div>
            ))}
        </div>
    );
};

// Backend: { type:'payslip', payslip: { month, year, basicSalary, hra, transportAllowance,
//            medicalAllowance, bonus, pfDeduction, tdsDeduction, otherDeductions,
//            netSalary, grossSalary, totalDeductions } }
const PayslipCard = ({ payslip }) => {
    if (!payslip) return null;
    const rows = [
        { label: "Basic Salary", val: payslip.basicSalary ?? payslip.basic },
        { label: "HRA", val: payslip.hra },
        { label: "Transport", val: payslip.transportAllowance ?? payslip.transport },
        { label: "Medical", val: payslip.medicalAllowance ?? payslip.medical },
        { label: "Bonus", val: payslip.bonus },
        { label: "PF Deduction", val: payslip.pfDeduction, red: true },
        { label: "TDS Deduction", val: payslip.tdsDeduction ?? payslip.tds, red: true },
        { label: "Other Deductions", val: payslip.otherDeductions, red: true },
    ].filter(r => r.val != null && r.val !== 0 && r.val !== false);

    const gross = payslip.grossSalary ?? (
        (payslip.basicSalary ?? 0) + (payslip.hra ?? 0) +
        (payslip.transportAllowance ?? 0) + (payslip.medicalAllowance ?? 0) + (payslip.bonus ?? 0)
    );
    const deductions = payslip.totalDeductions ?? (
        (payslip.pfDeduction ?? 0) + (payslip.tdsDeduction ?? 0) + (payslip.otherDeductions ?? 0)
    );

    return (
        <CardShell color={T.green} icon={FileText}
            label={`Payslip — ${MN[payslip.month] || payslip.month} ${payslip.year}`}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <div style={{ flex: 1, background: T.green.light, borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                    <p style={{ fontSize: 10, color: T.green.text, margin: 0 }}>Gross</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: T.green.accent, margin: 0 }}>₹{fmt(gross)}</p>
                </div>
                <div style={{ flex: 1, background: T.red.light, borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                    <p style={{ fontSize: 10, color: T.red.text, margin: 0 }}>Deductions</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: T.red.accent, margin: 0 }}>-₹{fmt(deductions)}</p>
                </div>
                <div style={{ flex: 1, background: "#fff", borderRadius: 8, padding: "6px 8px", textAlign: "center", border: `2px solid ${T.green.accent}` }}>
                    <p style={{ fontSize: 10, color: T.green.text, margin: 0 }}>Net Pay</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: T.green.accent, margin: 0 }}>₹{fmt(payslip.netSalary)}</p>
                </div>
            </div>
            {rows.map(r => (
                <Row key={r.label} label={r.label}
                    value={`${r.red ? "-" : ""}₹${fmt(r.val)}`}
                    rightColor={r.red ? "#DC2626" : "#111827"} />
            ))}
        </CardShell>
    );
};

// Backend: { type:'attendance', summary: { present, absent, late, wfh, earlyLeave, holiday, total, pct, days }, records }
const AttendanceCard = ({ summary }) => {
    if (!summary) return null;
    const { present = 0, absent = 0, late = 0, wfh = 0, earlyLeave = 0, holiday = 0, total = 0, pct = 0, days = 30 } = summary;
    const bars = [
        { label: "Present", val: present, color: "#16A34A" },
        { label: "Absent", val: absent, color: "#DC2626" },
        { label: "Late", val: late, color: "#D97706" },
        { label: "WFH", val: wfh, color: "#2563EB" },
        { label: "Early Leave", val: earlyLeave, color: "#9333EA" },
        { label: "Holidays", val: holiday, color: "#6B7280" },
    ].filter(b => b.val > 0);

    return (
        <CardShell color={T.blue} icon={Activity}
            label={`Attendance · Last ${days} days`}
            rightEl={
                <span style={{ fontSize: 14, fontWeight: 800, color: pct >= 70 ? "#16A34A" : "#DC2626" }}>
                    {pct}%
                </span>
            }>
            <div style={{ display: "flex", height: 6, borderRadius: 4, overflow: "hidden", marginBottom: 10, background: "#DBEAFE" }}>
                {bars.map(b => (
                    <div key={b.label}
                        style={{ width: `${total > 0 ? (b.val / total) * 100 : 0}%`, background: b.color }}
                        title={`${b.label}: ${b.val}`}
                    />
                ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                {bars.map(b => (
                    <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
                        <span style={{ color: "#374151" }}>{b.label}</span>
                        <span style={{ fontWeight: 700, color: "#111827", marginLeft: "auto" }}>{b.val}</span>
                    </div>
                ))}
            </div>
            {pct < 70 && (
                <div style={{ marginTop: 8, background: T.red.bg, borderRadius: 6, padding: "5px 8px", border: `1px solid ${T.red.border}` }}>
                    <p style={{ fontSize: 11, color: T.red.text, margin: 0 }}>
                        ⚠ Below 70% minimum — HR review may be triggered.
                    </p>
                </div>
            )}
        </CardShell>
    );
};

// Backend: { type:'holidays', holidays: [{ date, name }] }
const HolidayCard = ({ holidays }) => {
    if (!holidays?.length) return null;
    return (
        <CardShell color={T.orange} icon={Calendar} label="Upcoming Holidays">
            {holidays.slice(0, 8).map(h => (
                <Row key={h.date} label={h.name} value={h.date} rightColor={T.orange.accent} />
            ))}
        </CardShell>
    );
};

// Backend: { type:'profile', profile: { id, email, designation, department,
//            employeeCode, managerId, firstName, lastName, joiningDate } }
const ProfileCard = ({ profile }) => {
    if (!profile) return null;
    const name = profile.name ||
        `${profile.firstName || profile.first_name || ""} ${profile.lastName || profile.last_name || ""}`.trim() ||
        profile.email;
    const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";

    return (
        <CardShell color={T.slate} icon={User} label="Employee Profile">
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: T.purple.light, display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: 800, fontSize: 16,
                    color: T.purple.accent, flexShrink: 0,
                }}>
                    {initials}
                </div>
                <div>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: "#111827" }}>{name}</p>
                    <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>
                        {profile.designation || "—"} · {profile.department || "—"}
                    </p>
                </div>
            </div>
            {[
                ["Employee ID", profile.employeeCode],
                ["Email", profile.email],
                ["Joined", profile.joiningDate],
                ["Manager ID", profile.managerId],
            ].filter(r => r[1]).map(([l, v]) => <Row key={l} label={l} value={String(v)} dimLabel />)}
        </CardShell>
    );
};

// Backend: { type:'team_leave_list', leaves: [{ id, status, leaveType, startDate, endDate,
//            daysRequested, reason, rejectionReason, employee: { firstName, lastName, designation } }] }
const TeamLeaveCard = ({ leaves, onAction }) => {
    if (!leaves?.length) return null;
    return (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {leaves.map(l => {
                // Backend includes() returns aliased firstName/lastName inside employee
                const empName = l.employee
                    ? `${l.employee.firstName || l.employee.first_name || ""} ${l.employee.lastName || l.employee.last_name || ""}`.trim()
                    : "Employee";
                return (
                    <div key={l.id} style={{
                        background: "#fff", borderRadius: 10, padding: "9px 12px",
                        border: "1px solid #E5E7EB",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                            <div>
                                <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{empName}</span>
                                {l.employee?.designation && (
                                    <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>
                                        {l.employee.designation}
                                    </span>
                                )}
                            </div>
                            <Badge status={l.status} />
                        </div>
                        <p style={{ color: "#6B7280", fontSize: 12, margin: "2px 0" }}>
                            {l.leaveType} · {l.startDate} → {l.endDate} ({l.daysRequested}d)
                        </p>
                        {l.reason && <p style={{ color: "#9CA3AF", fontSize: 11, margin: "0 0 6px", fontStyle: "italic" }}>{l.reason}</p>}
                        {l.status === "Pending" && (
                            <div style={{ display: "flex", gap: 6 }}>
                                <button onClick={() => onAction(`approve leave ${l.id}`)} style={{
                                    fontSize: 11, color: "#16A34A", background: "#F0FDF4",
                                    border: "1px solid #BBF7D0", borderRadius: 6, padding: "2px 10px", cursor: "pointer",
                                }}>✓ Approve</button>
                                <button onClick={() => onAction(`reject leave ${l.id} reason: not approved`)} style={{
                                    fontSize: 11, color: "#DC2626", background: "#FFF1F2",
                                    border: "1px solid #FECACA", borderRadius: 6, padding: "2px 10px", cursor: "pointer",
                                }}>✗ Reject</button>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// Backend: { type:'on_leave_tomorrow', leaves: [{ id, leaveType, employee: { first_name, last_name, designation, department } }], date }
const OnLeaveTomorrowCard = ({ leaves, date }) => {
    if (!leaves) return null;
    const dateStr = date ? new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "";
    return (
        <CardShell color={T.sky} icon={Clock} label={`On Leave Tomorrow · ${dateStr}`}>
            {!leaves.length
                ? <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>✓ Everyone is available tomorrow!</p>
                : leaves.map(l => {
                    const name = l.employee
                        ? `${l.employee.first_name || ""} ${l.employee.last_name || ""}`.trim()
                        : "—";
                    return (
                        <div key={l.id} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "5px 0", borderBottom: `1px solid ${T.sky.light}`, fontSize: 13,
                        }}>
                            <div>
                                <span style={{ fontWeight: 600, color: "#111827" }}>{name}</span>
                                {l.employee?.designation && (
                                    <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>
                                        {l.employee.designation}
                                    </span>
                                )}
                            </div>
                            <Badge status={l.leaveType || "Leave"} />
                        </div>
                    );
                })}
        </CardShell>
    );
};

// Backend: { type:'late_employees', employees: [{ employee: { id, name, designation }, count }], days }
const LateEmployeesCard = ({ employees, days }) => {
    if (!employees) return null;
    return (
        <CardShell color={T.amber} icon={Clock} label={`Late Arrivals · Last ${days} days`}>
            {!employees.length
                ? <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>✓ No late arrivals recorded!</p>
                : employees.map((e, i) => (
                    <div key={i} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "5px 0", borderBottom: `1px solid ${T.amber.light}`, fontSize: 13,
                    }}>
                        <div>
                            <span style={{ fontWeight: 600, color: "#111827" }}>{e.employee?.name || "—"}</span>
                            {e.employee?.designation && (
                                <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>
                                    {e.employee.designation}
                                </span>
                            )}
                        </div>
                        <span style={{
                            background: T.amber.light, color: T.amber.text,
                            border: `1px solid ${T.amber.border}`,
                            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        }}>{e.count}× late</span>
                    </div>
                ))
            }
        </CardShell>
    );
};

// Backend: { type:'burnout_report', employees: [{ employee:{id,name,designation}, score, risk, flags, attendancePct, lateCount }],
//            summary: { highRisk, mediumRisk, total } }
const BurnoutReportCard = ({ employees, summary }) => {
    const [expanded, setExpanded] = useState(false);
    if (!employees) return null;
    const shown = expanded ? employees : employees.slice(0, 3);
    const riskColor = (r) => r === "High" ? "#EF4444" : r === "Medium" ? "#F59E0B" : "#10B981";
    return (
        <CardShell color={T.red} icon={Activity} label="Team Burnout Report">
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                <StatPill val={summary?.highRisk ?? 0} label="High Risk" bg={T.red.light} text={T.red.text} />
                <StatPill val={summary?.mediumRisk ?? 0} label="Medium Risk" bg={T.amber.light} text={T.amber.text} />
                <StatPill val={summary?.total ?? 0} label="Total" bg={T.green.light} text={T.green.text} />
            </div>
            {shown.map((e, i) => (
                <div key={i} style={{
                    background: "#fff", borderRadius: 8, padding: "8px 10px",
                    marginBottom: 6, border: `1px solid ${T.red.border}`,
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div>
                            <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{e.employee?.name}</span>
                            {e.employee?.designation && (
                                <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{e.employee.designation}</span>
                            )}
                        </div>
                        <Badge status={e.risk} />
                    </div>
                    <ScoreBar score={e.score} color={riskColor(e.risk)} label="Burnout score" />
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
                        Attendance: <strong>{e.attendancePct}%</strong> · Late: <strong>{e.lateCount}×</strong>
                    </div>
                    {e.flags?.length > 0 && (
                        <TagRow tags={e.flags} bg={T.red.light} text={T.red.text} border={T.red.border} />
                    )}
                </div>
            ))}
            <ExpandBtn expanded={expanded} setExpanded={setExpanded} total={employees.length} shown={3} color={T.red.accent} />
        </CardShell>
    );
};

// Backend: { type:'leave_predictions', employees: [{ employee:{id,name,designation}, score, likelihood, reasons, remainingDays }] }
const LeavePredictionsCard = ({ employees }) => {
    const [expanded, setExpanded] = useState(false);
    if (!employees) return null;
    const shown = expanded ? employees : employees.slice(0, 3);
    const barColor = (l) => l === "High" ? T.purple.accent : l === "Medium" ? "#A78BFA" : "#DDD6FE";
    return (
        <CardShell color={T.purple} icon={TrendingUp} label="Leave Predictions · Next 2 Weeks">
            {shown.map((e, i) => (
                <div key={i} style={{
                    background: "#fff", borderRadius: 8, padding: "8px 10px",
                    marginBottom: 6, border: `1px solid ${T.purple.border}`,
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div>
                            <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{e.employee?.name}</span>
                            {e.employee?.designation && (
                                <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{e.employee.designation}</span>
                            )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {/* remainingDays now correctly computed server-side via totalRemaining() */}
                            <span style={{ fontSize: 10, color: "#9CA3AF" }}>{e.remainingDays}d left</span>
                            <Badge status={e.likelihood} />
                        </div>
                    </div>
                    <ScoreBar score={e.score} color={barColor(e.likelihood)} />
                    {e.reasons?.length > 0 && (
                        <TagRow tags={e.reasons} bg={T.purple.light} text={T.purple.text} border={T.purple.border} />
                    )}
                </div>
            ))}
            <ExpandBtn expanded={expanded} setExpanded={setExpanded} total={employees.length} shown={3} color={T.purple.accent} />
        </CardShell>
    );
};

// Backend: { type:'attrition_predictions', employees: [{ employee:{id,name,designation}, score, risk, reasons, burnoutScore }] }
const AttritionCard = ({ employees }) => {
    const [expanded, setExpanded] = useState(false);
    if (!employees) return null;
    const shown = expanded ? employees : employees.slice(0, 3);
    const riskColor = (r) => r === "High" ? "#EF4444" : r === "Medium" ? "#F59E0B" : "#10B981";
    return (
        <CardShell color={T.pink} icon={AlertTriangle} label="Attrition Risk Predictions">
            <div style={{ marginBottom: 8, background: T.pink.light, borderRadius: 8, padding: "6px 10px", fontSize: 11, color: T.pink.text }}>
                Based on burnout score, tenure, leave patterns and rejected requests.
            </div>
            {shown.map((e, i) => (
                <div key={i} style={{
                    background: "#fff", borderRadius: 8, padding: "8px 10px",
                    marginBottom: 6, border: `1px solid ${T.pink.border}`,
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div>
                            <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{e.employee?.name}</span>
                            {e.employee?.designation && (
                                <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{e.employee.designation}</span>
                            )}
                        </div>
                        <Badge status={e.risk} />
                    </div>
                    <ScoreBar score={e.score} color={riskColor(e.risk)} label="Attrition risk" />
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
                        Burnout score: <strong style={{ color: riskColor(e.burnoutScore >= 60 ? "High" : e.burnoutScore >= 30 ? "Medium" : "Low") }}>
                            {e.burnoutScore}/100
                        </strong>
                    </div>
                    {e.reasons?.length > 0 && (
                        <TagRow tags={e.reasons} bg={T.pink.light} text={T.pink.text} border={T.pink.border} />
                    )}
                </div>
            ))}
            <ExpandBtn expanded={expanded} setExpanded={setExpanded} total={employees.length} shown={3} color={T.pink.accent} />
        </CardShell>
    );
};

// Backend: { type:'performance_insights', employees: [{ employee:{id,name,designation}, attendancePct, lateCount, absentCount, performanceRisk, flags }] }
const PerformanceInsightsCard = ({ employees }) => {
    const [expanded, setExpanded] = useState(false);
    if (!employees) return null;
    const shown = expanded ? employees : employees.slice(0, 4);
    const pctColor = (p) => p >= 80 ? "#16A34A" : p >= 70 ? "#D97706" : "#DC2626";
    return (
        <CardShell color={T.teal} icon={BarChart2} label="Performance Insights">
            {shown.map((e, i) => (
                <div key={i} style={{
                    background: "#fff", borderRadius: 8, padding: "8px 10px",
                    marginBottom: 6, border: `1px solid ${T.teal.border}`,
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{e.employee?.name}</span>
                        <Badge status={e.performanceRisk} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <div style={{ flex: 1, height: 4, background: "#E5E7EB", borderRadius: 4, overflow: "hidden" }}>
                            <div style={{ width: `${e.attendancePct}%`, height: "100%", background: pctColor(e.attendancePct), borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: pctColor(e.attendancePct), minWidth: 36 }}>
                            {e.attendancePct}%
                        </span>
                    </div>
                    <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#6B7280" }}>
                        <span>Absent: <strong style={{ color: "#374151" }}>{e.absentCount}</strong></span>
                        <span>Late: <strong style={{ color: "#374151" }}>{e.lateCount}</strong></span>
                    </div>
                    {e.flags?.length > 0 && (
                        <TagRow tags={e.flags} bg={T.teal.light} text={T.teal.text} border={T.teal.border} />
                    )}
                </div>
            ))}
            <ExpandBtn expanded={expanded} setExpanded={setExpanded} total={employees.length} shown={4} color={T.teal.accent} />
        </CardShell>
    );
};

// Backend: { type:'monthly_summary', attendance:{present,absent,late,holiday,total,attended,pct},
//            leaves, payslip:{net,month,year}, balance:{remaining,sick,casual,paid,...}, suggestions[] }
const MonthlySummaryCard = ({ data }) => {
    if (!data) return null;
    const { attendance, leaves, payslip, balance, suggestions } = data;
    const pctColor = (attendance?.pct ?? 0) >= 70 ? T.green.accent : T.red.accent;
    return (
        <CardShell color={T.blue} icon={Award} label="Monthly Summary">
            {attendance && (
                <div style={{ marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: "#6B7280" }}>Attendance</span>
                        <span style={{ fontWeight: 700, color: pctColor }}>{attendance.pct}%</span>
                    </div>
                    <div style={{ height: 5, background: "#DBEAFE", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ width: `${attendance.pct}%`, height: "100%", background: pctColor, borderRadius: 4 }} />
                    </div>
                    <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#6B7280", marginTop: 4 }}>
                        <span>Present: <strong style={{ color: "#111827" }}>{attendance.present}</strong></span>
                        <span>Late: <strong style={{ color: "#111827" }}>{attendance.late}</strong></span>
                        <span>Absent: <strong style={{ color: "#111827" }}>{attendance.absent}</strong></span>
                    </div>
                </div>
            )}
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {balance && (
                    <div style={{ flex: 1, background: T.purple.light, borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                        {/* balance.remaining is now totalRemaining computed server-side */}
                        <p style={{ fontSize: 18, fontWeight: 800, color: T.purple.accent, margin: 0 }}>{balance.remaining}</p>
                        <p style={{ fontSize: 10, color: T.purple.text, margin: 0 }}>Leave days left</p>
                    </div>
                )}
                {leaves != null && (
                    <div style={{ flex: 1, background: T.amber.light, borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: T.amber.accent, margin: 0 }}>{leaves}</p>
                        <p style={{ fontSize: 10, color: T.amber.text, margin: 0 }}>Leave requests</p>
                    </div>
                )}
                {payslip && (
                    <div style={{ flex: 1, background: T.green.light, borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                        <p style={{ fontSize: 13, fontWeight: 800, color: T.green.accent, margin: 0 }}>
                            ₹{fmt(payslip.net)}
                        </p>
                        <p style={{ fontSize: 10, color: T.green.text, margin: 0 }}>
                            Net {MN[payslip.month]} {payslip.year}
                        </p>
                    </div>
                )}
            </div>
            {suggestions?.length > 0 && (
                <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 5px" }}>
                        AI Suggestions
                    </p>
                    {suggestions.map((s, i) => (
                        <div key={i} style={{
                            fontSize: 12, color: "#374151", padding: "4px 8px",
                            background: "#fff", borderRadius: 6, marginBottom: 4,
                            border: "1px solid #E5E7EB", lineHeight: 1.4,
                        }}>{s}</div>
                    ))}
                </div>
            )}
        </CardShell>
    );
};

// Backend: { type:'policy_results', query, results: "<string text>" }
const PolicySearchCard = ({ results, query }) => {
    if (!results) return null;
    return (
        <CardShell color={T.green} icon={Search} label={`Policy: "${query}"`}>
            <div style={{
                fontSize: 13, color: "#374151", lineHeight: 1.6,
                background: "#fff", borderRadius: 8, padding: "8px 10px",
                border: `1px solid ${T.green.border}`, whiteSpace: "pre-wrap",
            }}>
                {results}
            </div>
        </CardShell>
    );
};

// Backend: { type:'candidate_ranking', job, candidates: [{ rank, name, email, score, verdict }] }
const CandidateRankingCard = ({ candidates, job }) => {
    const [expanded, setExpanded] = useState(false);
    if (!candidates) return null;
    const shown = expanded ? candidates : candidates.slice(0, 4);
    return (
        <CardShell color={T.pink} icon={Star} label={`Candidates · ${job}`}>
            {shown.map((c, i) => (
                <div key={i} style={{
                    background: "#fff", borderRadius: 8, padding: "8px 10px",
                    marginBottom: 6, border: `1px solid ${T.pink.border}`,
                    display: "flex", alignItems: "center", gap: 10,
                }}>
                    <div style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                        background: i === 0 ? "#FEF3C7" : "#F3F4F6",
                        border: `2px solid ${i === 0 ? "#F59E0B" : "#E5E7EB"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 800,
                        color: i === 0 ? "#D97706" : "#6B7280",
                    }}>#{c.rank}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{c.name}</span>
                            <Badge status={c.verdict} />
                        </div>
                        <ScoreBar score={c.score} color={c.score >= 70 ? "#16A34A" : c.score >= 45 ? "#D97706" : "#DC2626"} />
                        <span style={{ fontSize: 10, color: "#9CA3AF" }}>{c.email}</span>
                    </div>
                </div>
            ))}
            <ExpandBtn expanded={expanded} setExpanded={setExpanded} total={candidates.length} shown={4} color={T.pink.accent} />
        </CardShell>
    );
};

// Backend: { type:'resume_screening', candidate, job, score, matched[], missing[], verdict }
const ResumeScreeningCard = ({ data }) => {
    if (!data) return null;
    const { candidate, job, score, matched, missing, verdict } = data;
    const scoreColor = score >= 70 ? "#16A34A" : score >= 45 ? "#D97706" : "#DC2626";
    return (
        <CardShell color={T.pink} icon={UserCheck} label={`Resume Screen · ${job}`}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{
                    width: 52, height: 52, borderRadius: "50%", background: T.pink.light,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 800, color: scoreColor, flexShrink: 0,
                    border: `2px solid ${scoreColor}`,
                }}>
                    {score}
                </div>
                <div>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: "#111827" }}>{candidate}</p>
                    <Badge status={verdict} />
                </div>
            </div>
            <ScoreBar score={score} color={scoreColor} label="Match score" />
            {matched?.length > 0 && (
                <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", margin: "0 0 4px", textTransform: "uppercase" }}>Matched Skills</p>
                    <TagRow tags={matched} bg={T.green.light} text={T.green.text} border={T.green.border} />
                </div>
            )}
            {missing?.length > 0 && (
                <div style={{ marginTop: 6 }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", margin: "0 0 4px", textTransform: "uppercase" }}>Missing Skills</p>
                    <TagRow tags={missing} bg={T.red.light} text={T.red.text} border={T.red.border} />
                </div>
            )}
        </CardShell>
    );
};

// Backend: { type:'generated_jd', role, department, jd }
const GeneratedJDCard = ({ role, department, jd }) => {
    const [copied, setCopied] = useState(false);
    if (!jd) return null;
    const copy = () => {
        navigator.clipboard.writeText(jd);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    return (
        <CardShell color={T.slate} icon={FileText} label={`JD · ${role} (${department})`}
            rightEl={
                <button onClick={copy} style={{
                    fontSize: 10, color: T.slate.accent, background: T.slate.bg,
                    border: `1px solid ${T.slate.border}`, borderRadius: 6,
                    padding: "2px 8px", cursor: "pointer",
                }}>
                    {copied ? "✓ Copied" : "Copy"}
                </button>
            }>
            <div style={{
                fontSize: 12, color: "#374151", lineHeight: 1.65,
                background: "#fff", borderRadius: 8, padding: "10px 12px",
                border: `1px solid ${T.slate.border}`, maxHeight: 220,
                overflowY: "auto", whiteSpace: "pre-wrap",
            }}>
                {jd}
            </div>
        </CardShell>
    );
};

// Backend: { type:'open_positions', jobs: [{ id, title, department, location, status, createdAt }] }
const OpenPositionsCard = ({ jobs }) => {
    if (!jobs) return null;
    return (
        <CardShell color={T.sky} icon={Briefcase} label="Open Positions">
            {!jobs.length
                ? <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>No open positions currently.</p>
                : jobs.map(j => (
                    <div key={j.id} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "6px 0", borderBottom: `1px solid ${T.sky.light}`, fontSize: 13,
                    }}>
                        <div style={{ minWidth: 0, flex: 1, marginRight: 8 }}>
                            <span style={{ fontWeight: 600, color: "#111827" }}>{j.title}</span>
                            <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{j.department}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                            {j.location && <span style={{ fontSize: 10, color: "#9CA3AF" }}>{j.location}</span>}
                            <Badge status={j.status || "Open"} />
                        </div>
                    </div>
                ))
            }
        </CardShell>
    );
};

// Backend: { type:'recruitment_summary', openJobs, candidatesByStatus:{...} }
const RecruitmentSummaryCard = ({ openJobs, candidatesByStatus }) => {
    if (openJobs == null) return null;
    return (
        <CardShell color={T.indigo} icon={Briefcase} label="Recruitment Summary">
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <div style={{ flex: 1, background: T.indigo.light, borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: T.indigo.accent, margin: 0 }}>{openJobs}</p>
                    <p style={{ fontSize: 10, color: T.indigo.text, margin: 0 }}>Open Jobs</p>
                </div>
                {Object.entries(candidatesByStatus || {}).map(([status, count]) => (
                    <div key={status} style={{ flex: 1, background: "#fff", borderRadius: 8, padding: "6px 8px", textAlign: "center", border: `1px solid ${T.indigo.border}` }}>
                        <p style={{ fontSize: 18, fontWeight: 800, color: "#111827", margin: 0 }}>{count}</p>
                        <p style={{ fontSize: 10, color: "#6B7280", margin: 0 }}>{status}</p>
                    </div>
                ))}
            </div>
        </CardShell>
    );
};

// Backend: { type:'expense_submitted'|'expense_list'|'expense_approved'|'expense_rejected',
//            expenses: [{ id, amount, category, description, status, expenseDate, rejectionReason }], total }
const ExpenseListCard = ({ expenses, total, onAction }) => {
    const [expanded, setExpanded] = useState(false);
    if (!expenses) return null;
    const shown = expanded ? expenses : expenses.slice(0, 4);
    return (
        <CardShell color={T.emerald} icon={DollarSign} label="Expense Claims"
            rightEl={
                total != null ? (
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.emerald.accent }}>
                        ₹{fmt(total)} total
                    </span>
                ) : null
            }>
            {!expenses.length
                ? <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>No expense claims found.</p>
                : shown.map(e => (
                    <div key={e.id} style={{
                        background: "#fff", borderRadius: 8, padding: "8px 10px",
                        marginBottom: 6, border: "1px solid #E5E7EB",
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                            <div>
                                <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>
                                    ₹{fmt(e.amount)}
                                </span>
                                <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{e.category}</span>
                            </div>
                            <Badge status={e.status} />
                        </div>
                        <p style={{ color: "#9CA3AF", fontSize: 11, margin: "2px 0 0", fontStyle: "italic" }}>{e.description}</p>
                        {e.expenseDate && <p style={{ color: "#9CA3AF", fontSize: 10, margin: 0 }}>{e.expenseDate}</p>}
                        {e.rejectionReason && (
                            <p style={{ color: "#DC2626", fontSize: 11, margin: "3px 0 0" }}>Reason: {e.rejectionReason}</p>
                        )}
                        {e.status === "Pending" && onAction && (
                            <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                                <button onClick={() => onAction(`approve expense ${e.id}`)} style={{
                                    fontSize: 11, color: "#16A34A", background: "#F0FDF4",
                                    border: "1px solid #BBF7D0", borderRadius: 6, padding: "2px 10px", cursor: "pointer",
                                }}>✓ Approve</button>
                                <button onClick={() => onAction(`reject expense ${e.id} reason: not approved`)} style={{
                                    fontSize: 11, color: "#DC2626", background: "#FFF1F2",
                                    border: "1px solid #FECACA", borderRadius: 6, padding: "2px 10px", cursor: "pointer",
                                }}>✗ Reject</button>
                            </div>
                        )}
                    </div>
                ))
            }
            <ExpandBtn expanded={expanded} setExpanded={setExpanded} total={expenses.length} shown={4} color={T.emerald.accent} />
        </CardShell>
    );
};

// Backend: { type:'expense_summary', summary: [{ category, status, total, count }] }
const ExpenseSummaryCard = ({ summary }) => {
    if (!summary?.length) return null;
    const grandTotal = summary.reduce((s, r) => s + Number(r.total || 0), 0);
    return (
        <CardShell color={T.emerald} icon={DollarSign} label="Expense Summary (Past Year)"
            rightEl={<span style={{ fontSize: 12, fontWeight: 700, color: T.emerald.accent }}>₹{fmt(grandTotal)}</span>}>
            {summary.map((r, i) => (
                <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "4px 0", borderBottom: "1px solid rgba(0,0,0,0.05)", fontSize: 12,
                }}>
                    <div>
                        <span style={{ fontWeight: 600, color: "#111827" }}>{r.category}</span>
                        <Badge status={r.status} />
                    </div>
                    <div style={{ textAlign: "right" }}>
                        <span style={{ fontWeight: 700, color: "#111827" }}>₹{fmt(r.total)}</span>
                        <span style={{ fontSize: 10, color: "#9CA3AF", marginLeft: 4 }}>({r.count})</span>
                    </div>
                </div>
            ))}
        </CardShell>
    );
};

// Backend: { type:'notifications', notifications: [{ id, message, type, isRead, createdAt }] }
const NotificationsCard = ({ notifications }) => {
    if (!notifications) return null;
    const typeIcon = (t) => {
        if (t?.includes("LEAVE")) return <Calendar size={11} color="#6366F1" />;
        if (t?.includes("EXPENSE")) return <DollarSign size={11} color="#10B981" />;
        if (t?.includes("SHIFT")) return <Clock size={11} color="#F59E0B" />;
        return <Bell size={11} color="#6B7280" />;
    };
    return (
        <CardShell color={T.indigo} icon={Bell} label={`Notifications (${notifications.length})`}>
            {!notifications.length
                ? <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>No unread notifications.</p>
                : notifications.map(n => (
                    <div key={n.id} style={{
                        display: "flex", gap: 8, padding: "6px 0",
                        borderBottom: `1px solid ${T.indigo.light}`,
                    }}>
                        <div style={{ flexShrink: 0, marginTop: 2 }}>{typeIcon(n.type)}</div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 12, color: "#374151", margin: 0, lineHeight: 1.4 }}>{n.message}</p>
                            {n.createdAt && (
                                <p style={{ fontSize: 10, color: "#9CA3AF", margin: "2px 0 0" }}>
                                    {new Date(n.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </p>
                            )}
                        </div>
                    </div>
                ))
            }
        </CardShell>
    );
};

// Backend: { type:'my_shift'|'team_shifts', shift: { name, startTime, endTime }, assignment: { effectiveFrom, effectiveTo } }
const ShiftCard = ({ shift, assignment, assignments }) => {
    // Single shift (my_shift)
    if (shift) {
        return (
            <CardShell color={T.amber} icon={Layers} label="My Current Shift">
                <Row label="Shift Name" value={shift.name || "—"} />
                <Row label="Hours" value={`${shift.startTime || "?"} – ${shift.endTime || "?"}`} />
                {assignment?.effectiveFrom && <Row label="From" value={assignment.effectiveFrom} dimLabel />}
                {assignment?.effectiveTo && <Row label="Until" value={assignment.effectiveTo} dimLabel />}
            </CardShell>
        );
    }
    // Team shifts
    if (assignments) {
        return (
            <CardShell color={T.amber} icon={Layers} label={`Team Shifts (${assignments.length})`}>
                {assignments.map((a, i) => {
                    const emp = a.employee;
                    const empName = emp ? `${emp.first_name || ""} ${emp.last_name || ""}`.trim() : "—";
                    return (
                        <div key={i} style={{
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            padding: "5px 0", borderBottom: `1px solid ${T.amber.light}`, fontSize: 12,
                        }}>
                            <div>
                                <span style={{ fontWeight: 600, color: "#111827" }}>{empName}</span>
                                {emp?.designation && <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{emp.designation}</span>}
                            </div>
                            <span style={{
                                background: T.amber.light, color: T.amber.text,
                                border: `1px solid ${T.amber.border}`,
                                fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 12,
                            }}>
                                {a.shift?.name || "—"}
                            </span>
                        </div>
                    );
                })}
            </CardShell>
        );
    }
    return null;
};

// Backend: { type:'shift_coverage', totalTeam, assigned, unassigned:[{id,name}] }
const ShiftCoverageCard = ({ data }) => {
    if (!data) return null;
    const { totalTeam, assigned, unassigned } = data;
    const pct = totalTeam > 0 ? Math.round((assigned / totalTeam) * 100) : 0;
    return (
        <CardShell color={T.amber} icon={Layers} label="Shift Coverage">
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <StatPill val={assigned} label="Assigned" bg={T.green.light} text={T.green.text} />
                <StatPill val={unassigned?.length ?? 0} label="Unassigned" bg={T.red.light} text={T.red.text} />
                <StatPill val={`${pct}%`} label="Coverage" bg={T.amber.light} text={T.amber.text} />
            </div>
            {unassigned?.length > 0 && (
                <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", margin: "0 0 4px" }}>
                        Unassigned Employees
                    </p>
                    {unassigned.map(u => (
                        <div key={u.id} style={{ fontSize: 12, color: "#374151", padding: "3px 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                            {u.name}
                        </div>
                    ))}
                </div>
            )}
        </CardShell>
    );
};

// Backend: { type:'report', reportType, year, month, rows: [...] }
const ReportCard = ({ data }) => {
    if (!data) return null;
    const { reportType, year, month, rows } = data;
    return (
        <CardShell color={T.slate} icon={FileText}
            label={`${reportType?.toUpperCase()} Report · ${month ? `${MN[month] || month}/` : ""}${year}`}>
            {!rows?.length
                ? <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>No data available for this period.</p>
                : rows.slice(0, 8).map((r, i) => (
                    <div key={i} style={{
                        display: "flex", justifyContent: "space-between", flexWrap: "wrap",
                        gap: 4, padding: "4px 0", borderBottom: "1px solid rgba(0,0,0,0.05)",
                        fontSize: 12,
                    }}>
                        {Object.entries(r).map(([k, v]) => (
                            <span key={k} style={{ color: "#374151" }}>
                                <span style={{ color: "#9CA3AF", fontSize: 10 }}>{k}: </span>
                                <strong>{String(v ?? "—")}</strong>
                            </span>
                        ))}
                    </div>
                ))
            }
        </CardShell>
    );
};

// Backend: { type:'year_end_summary', year, leaves:[...], attendance:[...], payroll:{totalPayroll,totalPF} }
const YearEndSummaryCard = ({ data }) => {
    if (!data) return null;
    const { year, leaves, attendance, payroll } = data;
    const totalLeaves = leaves?.reduce((s, r) => s + Number(r.totalDays || 0), 0) ?? 0;
    const attMap = (attendance || []).reduce((m, r) => { m[r.status] = Number(r.count); return m; }, {});
    return (
        <CardShell color={T.teal} icon={Award} label={`Year-End Summary ${year}`}>
            <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                <StatPill val={totalLeaves} label="Total Leave Days" bg={T.purple.light} text={T.purple.text} />
                <StatPill val={`₹${fmt(payroll?.totalPayroll)}`} label="Total Payroll" bg={T.green.light} text={T.green.text} />
                <StatPill val={`₹${fmt(payroll?.totalPF)}`} label="Total PF" bg={T.blue.light} text={T.blue.text} />
            </div>
            {leaves?.map((l, i) => (
                <Row key={i} label={l.leaveType} value={`${l.totalDays}d (${l.count} requests)`} />
            ))}
            <div style={{ marginTop: 8 }}>
                {Object.entries(attMap).map(([status, count]) => (
                    <Row key={status} label={status} value={String(count)} dimLabel />
                ))}
            </div>
        </CardShell>
    );
};

// Backend: { type:'carry_forward', processed, results:[{employeeId,carryForward,encash}], nextYear }
const CarryForwardCard = ({ data }) => {
    if (!data) return null;
    const { processed, results, nextYear } = data;
    return (
        <CardShell color={T.green} icon={CheckCircle} label={`Carry Forward → ${nextYear}`}>
            <div style={{ background: T.green.light, borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: T.green.accent, margin: 0 }}>
                    ✓ Processed {processed} employee(s)
                </p>
                <p style={{ fontSize: 11, color: T.green.text, margin: "2px 0 0" }}>
                    Max 10 paid days carried forward. Excess encashed.
                </p>
            </div>
            {results?.slice(0, 5).map((r, i) => (
                <Row key={i} label={`Employee #${r.employeeId}`}
                    value={`Carry: ${r.carryForward}d | Encash: ${r.encash}d`} />
            ))}
        </CardShell>
    );
};

// Backend: { type:'company_settings', settings:[{key,value}] }
const CompanySettingsCard = ({ settings }) => {
    if (!settings) return null;
    return (
        <CardShell color={T.slate} icon={Settings} label="Company Settings">
            {!settings.length
                ? <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>No settings found.</p>
                : settings.map((s, i) => (
                    <Row key={i} label={s.key} value={String(s.value ?? "—")} dimLabel />
                ))
            }
        </CardShell>
    );
};

// Backend: { type:'audit_logs', logs:[{userId,moduleName,actionType,newData,createdAt,user:{first_name,last_name}}] }
const AuditLogsCard = ({ logs }) => {
    const [expanded, setExpanded] = useState(false);
    if (!logs) return null;
    const shown = expanded ? logs : logs.slice(0, 5);
    return (
        <CardShell color={T.slate} icon={Shield} label={`Audit Logs (${logs.length})`}>
            {!logs.length
                ? <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>No audit logs found.</p>
                : shown.map((l, i) => {
                    const userName = l.user
                        ? `${l.user.first_name || ""} ${l.user.last_name || ""}`.trim()
                        : `User #${l.userId}`;
                    return (
                        <div key={i} style={{ padding: "5px 0", borderBottom: `1px solid ${T.slate.border}` }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                                <span style={{ fontWeight: 600, color: "#111827" }}>{l.actionType}</span>
                                <span style={{ fontSize: 10, color: "#9CA3AF" }}>
                                    {new Date(l.createdAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                            <p style={{ fontSize: 11, color: "#6B7280", margin: "1px 0 0" }}>
                                {userName} · {l.moduleName}
                            </p>
                        </div>
                    );
                })
            }
            <ExpandBtn expanded={expanded} setExpanded={setExpanded} total={logs.length} shown={5} color={T.slate.accent} />
        </CardShell>
    );
};

// ─────────────────────────────────────────────────────────────────────────────
// DATA CARD ROUTER — maps every backend `data.type` to its card
// ─────────────────────────────────────────────────────────────────────────────
const DataCard = ({ data, onAction }) => {
    if (!data) return null;
    switch (data.type) {
        // ── Leave ──────────────────────────────────────────────────────────
        case "leave_balance":
            return <LeaveBalanceCard balance={data.balance} />;
        case "leave_list":
        case "leave_applied":
        case "leave_cancelled":
            return <LeaveListCard leaves={data.leaves ?? (data.leave ? [data.leave] : [])} onAction={onAction} />;
        case "team_leave_list":
        case "leave_approved":
        case "leave_rejected":
            return <TeamLeaveCard leaves={data.leaves ?? (data.leave ? [data.leave] : [])} onAction={onAction} />;
        case "on_leave_tomorrow":
            return <OnLeaveTomorrowCard leaves={data.leaves} date={data.date} />;

        // ── Payroll ────────────────────────────────────────────────────────
        case "payslip":
            return <PayslipCard payslip={data.payslip} />;

        // ── Attendance ─────────────────────────────────────────────────────
        case "attendance":
            return <AttendanceCard summary={data.summary} />;
        case "late_employees":
            return <LateEmployeesCard employees={data.employees} days={data.days} />;

        // ── Holidays / Profile ─────────────────────────────────────────────
        case "holidays":
            return <HolidayCard holidays={data.holidays} />;
        case "profile":
            return <ProfileCard profile={data.profile} />;

        // ── Monthly Summary ────────────────────────────────────────────────
        case "monthly_summary":
            return <MonthlySummaryCard data={data} />;

        // ── Analytics ──────────────────────────────────────────────────────
        case "burnout_report":
            return <BurnoutReportCard employees={data.employees} summary={data.summary} />;
        case "leave_predictions":
            return <LeavePredictionsCard employees={data.employees} />;
        case "attrition_predictions":
            return <AttritionCard employees={data.employees} />;
        case "performance_insights":
            return <PerformanceInsightsCard employees={data.employees} />;

        // ── Policy ─────────────────────────────────────────────────────────
        case "policy_results":
            return <PolicySearchCard results={data.results} query={data.query} />;

        // ── Recruitment ────────────────────────────────────────────────────
        case "candidate_ranking":
            return <CandidateRankingCard candidates={data.candidates} job={data.job} />;
        case "resume_screening":
            return <ResumeScreeningCard data={data} />;
        case "generated_jd":
            return <GeneratedJDCard role={data.role} department={data.department} jd={data.jd} />;
        case "open_positions":
            return <OpenPositionsCard jobs={data.jobs} />;
        case "recruitment_summary":
            return <RecruitmentSummaryCard openJobs={data.openJobs} candidatesByStatus={data.candidatesByStatus} />;

        // ── Expenses ───────────────────────────────────────────────────────
        case "expense_submitted":
            return <ExpenseListCard expenses={data.expense ? [data.expense] : []} onAction={null} />;
        case "expense_list":
        case "team_expense_list":
            return <ExpenseListCard expenses={data.expenses} total={data.total} onAction={onAction} />;
        case "expense_approved":
        case "expense_rejected":
            return <ExpenseListCard expenses={data.expense ? [data.expense] : []} onAction={null} />;
        case "expense_summary":
            return <ExpenseSummaryCard summary={data.summary} />;

        // ── Notifications ──────────────────────────────────────────────────
        case "notifications":
            return <NotificationsCard notifications={data.notifications} />;

        // ── Shifts ─────────────────────────────────────────────────────────
        case "my_shift":
            return <ShiftCard shift={data.shift} assignment={data.assignment} />;
        case "team_shifts":
            return <ShiftCard assignments={data.assignments} />;
        case "shift_assigned":
            return <ShiftCard shift={data.assignment?.shift} assignment={data.assignment} />;
        case "shift_coverage":
            return <ShiftCoverageCard data={data} />;

        // ── Reports ────────────────────────────────────────────────────────
        case "report":
            return <ReportCard data={data} />;

        // ── Year-End ───────────────────────────────────────────────────────
        case "year_end_summary":
            return <YearEndSummaryCard data={data} />;
        case "carry_forward":
            return <CarryForwardCard data={data} />;
        case "balances_reset":
            return (
                <CardShell color={T.green} icon={CheckCircle} label="Leave Balances Reset">
                    <p style={{ fontSize: 13, color: T.green.accent, margin: 0 }}>
                        ✓ Reset for {data.updatedCount} employee(s) for year {data.year}.
                    </p>
                </CardShell>
            );

        // ── Settings ───────────────────────────────────────────────────────
        case "company_settings":
            return <CompanySettingsCard settings={data.settings} />;
        case "setting_updated":
            return (
                <CardShell color={T.green} icon={Settings} label="Setting Updated">
                    <Row label={data.setting?.key} value={String(data.setting?.value ?? "—")} />
                </CardShell>
            );

        // ── Audit ──────────────────────────────────────────────────────────
        case "audit_logs":
            return <AuditLogsCard logs={data.logs} />;

        default:
            return null;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAT PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
const Timestamp = ({ ts }) => (
    <span style={{ fontSize: 10, opacity: 0.45, marginTop: 2, display: "block" }}>
        {new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </span>
);

const Bubble = ({ msg, onAction, onRetry, isMobile }) => {
    const isUser = msg.role === "user";
    const avatarSize = isMobile ? 24 : 28;
    return (
        <div style={{
            display: "flex", gap: isMobile ? 6 : 8, marginBottom: isMobile ? 10 : 14,
            flexDirection: isUser ? "row-reverse" : "row",
        }}>
            <div style={{
                width: avatarSize, height: avatarSize, borderRadius: "50%", flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isUser
                    ? "linear-gradient(135deg, #3B82F6, #4F46E5)"
                    : "linear-gradient(135deg, #7C3AED, #6D28D9)",
                marginTop: 2,
            }}>
                {isUser
                    ? <User size={isMobile ? 11 : 13} color="#fff" />
                    : <Bot size={isMobile ? 11 : 13} color="#fff" />
                }
            </div>
            <div style={{ maxWidth: isMobile ? "88%" : "83%" }}>
                <div style={{
                    padding: isMobile ? "8px 11px" : "10px 13px",
                    fontSize: 13, lineHeight: 1.55,
                    whiteSpace: "pre-line", borderRadius: 16, wordBreak: "break-word",
                    ...(isUser ? {
                        background: "linear-gradient(135deg, #3B82F6, #4F46E5)",
                        color: "#fff", borderTopRightRadius: 4,
                    } : {
                        background: "#fff", color: "#1F2937",
                        border: "1px solid #F0F0F0",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                        borderTopLeftRadius: 4,
                    }),
                }}>
                    {msg.content}
                    {msg.isError && onRetry && (
                        <button onClick={() => onRetry(msg.originalMsg)} style={{
                            display: "flex", alignItems: "center", gap: 4, marginTop: 6,
                            fontSize: 11, color: "#F87171",
                            background: "none", border: "none", cursor: "pointer", padding: 0,
                        }}>
                            <RefreshCw size={11} /> Retry
                        </button>
                    )}
                </div>
                {!isUser && msg.data && <DataCard data={msg.data} onAction={onAction} />}
                <Timestamp ts={msg.ts} />
            </div>
        </div>
    );
};

const Typing = ({ isMobile }) => (
    <div style={{ display: "flex", gap: isMobile ? 6 : 8, marginBottom: 14 }}>
        <div style={{
            width: isMobile ? 24 : 28, height: isMobile ? 24 : 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
            display: "flex", alignItems: "center", justifyContent: "center",
        }}>
            <Bot size={isMobile ? 11 : 13} color="#fff" />
        </div>
        <div style={{
            background: "#fff", border: "1px solid #F0F0F0",
            borderRadius: 16, borderTopLeftRadius: 4,
            padding: isMobile ? "8px 13px" : "10px 16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}>
            <div style={{ display: "flex", gap: 4, alignItems: "center", height: 16 }}>
                {[0, 150, 300].map(d => (
                    <span key={d} style={{
                        width: 6, height: 6, borderRadius: "50%", background: "#A78BFA",
                        animation: "aiBounce 1s ease infinite", animationDelay: `${d}ms`,
                    }} />
                ))}
            </div>
        </div>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const AiChat = () => {
    const vp = useViewport();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [unread, setUnread] = useState(0);
    const [input, setInput] = useState("");
    const [activeGroup, setActiveGroup] = useState(null);
    const [messages, setMessages] = useState([{
        id: 0, role: "assistant", ts: Date.now(), data: null,
        content: "Hi! I'm your HR Assistant 👋\n\nAsk me about leaves, payslips, attendance, expenses, shifts, team analytics, recruitment, or any HR policy.",
    }]);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    const getPanelStyle = () => {
        const btnH = vp.isMobile ? 70 : 88;
        if (vp.isMobile) return {
            position: "fixed", bottom: btnH, right: 0, left: 0, zIndex: 9998,
            width: "100%", height: `calc(100vh - ${btnH}px)`, borderRadius: "20px 20px 0 0",
        };
        if (vp.isSmall) return {
            position: "fixed", bottom: btnH, right: 16, left: 16, zIndex: 9998,
            height: `calc(100vh - ${btnH + 16}px)`, borderRadius: 20,
        };
        if (vp.isTablet) {
            const w = Math.min(400, vp.width - 48);
            const h = Math.min(600, vp.height - btnH - 24);
            return { position: "fixed", bottom: btnH, right: 16, zIndex: 9998, width: w, height: h, borderRadius: 20 };
        }
        const w = Math.min(420, vp.width * 0.35);
        const h = Math.min(680, vp.height - btnH - 32);
        return { position: "fixed", bottom: btnH, right: 24, zIndex: 9998, width: w, height: h, borderRadius: 20 };
    };

    const fabSize = vp.isMobile ? 48 : 56;

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
    useEffect(() => {
        if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 150); }
    }, [open]);
    useEffect(() => {
        if (vp.isMobile && open) { document.body.style.overflow = "hidden"; }
        else { document.body.style.overflow = ""; }
        return () => { document.body.style.overflow = ""; };
    }, [vp.isMobile, open]);

    const push = (role, content, extra = {}) =>
        setMessages(prev => [...prev, { id: Date.now() + Math.random(), role, content, ts: Date.now(), ...extra }]);

    const handleSend = useCallback(async (text) => {
        const msg = (text ?? input).trim();
        if (!msg || loading) return;
        setInput("");
        setActiveGroup(null);
        push("user", msg);

        const quick = getQuickAnswer(msg);
        if (quick) { setTimeout(() => push("assistant", quick), 350); return; }

        setLoading(true);
        try {
            const result = await sendMessage(msg);
            push("assistant", result.reply || "Done!", { data: result.data });
            if (!open) setUnread(n => n + 1);
        } catch (err) {
            push("assistant", err.message || "Something went wrong. Please try again.", {
                isError: true, originalMsg: msg,
            });
        } finally {
            setLoading(false);
        }
    }, [input, loading, open]);

    const handleKey = (e) => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleClear = async () => {
        await clearServerHistory().catch(() => { });
        setMessages([{
            id: Date.now(), role: "assistant", ts: Date.now(), data: null,
            content: "Conversation cleared. How can I help you?",
        }]);
    };

    const showWelcome = messages.length === 1 && !loading;

    return (
        <>
            <style>{`
                @keyframes aiSlideUp {
                    from { opacity:0; transform:translateY(16px) scale(0.97); }
                    to   { opacity:1; transform:translateY(0) scale(1); }
                }
                @keyframes aiBounce {
                    0%,80%,100% { transform:translateY(0); }
                    40% { transform:translateY(-5px); }
                }
                @keyframes spin { to { transform:rotate(360deg); } }
                .ai-scroll::-webkit-scrollbar { width:3px; }
                .ai-scroll::-webkit-scrollbar-thumb { background:#DDD6FE; border-radius:4px; }
                .ai-chip:hover { background:#EDE9FE !important; border-color:#C4B5FD !important; color:#5B21B6 !important; }
            `}</style>

            {/* Mobile overlay */}
            {open && vp.isMobile && (
                <div onClick={() => setOpen(false)} style={{
                    position: "fixed", inset: 0, zIndex: 9997,
                    background: "rgba(0,0,0,0.2)", backdropFilter: "blur(2px)",
                }} />
            )}

            {/* FAB */}
            <button onClick={() => setOpen(o => !o)} aria-label="Open HR Assistant"
                style={{
                    position: "fixed",
                    bottom: vp.isMobile ? 16 : 24,
                    right: vp.isMobile ? 16 : 24,
                    zIndex: 9999,
                    width: fabSize, height: fabSize, borderRadius: "50%", border: "none",
                    background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                    color: "#fff", cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(109,40,217,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(109,40,217,0.55)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(109,40,217,0.45)"; }}
            >
                {open ? <X size={vp.isMobile ? 18 : 22} /> : <MessageCircle size={vp.isMobile ? 18 : 22} />}
                {!open && unread > 0 && (
                    <span style={{
                        position: "absolute", top: -4, right: -4,
                        width: 18, height: 18, borderRadius: "50%",
                        background: "#EF4444", color: "#fff", fontSize: 10, fontWeight: 800,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        border: "2px solid #fff",
                    }}>{unread}</span>
                )}
            </button>

            {/* Chat panel */}
            {open && (
                <div style={{
                    ...getPanelStyle(),
                    display: "flex", flexDirection: "column", overflow: "hidden",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(109,40,217,0.12)",
                    border: "1px solid rgba(200,180,255,0.2)",
                    background: "#F8F7FF",
                    animation: "aiSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                }}>

                    {/* Header */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: vp.isMobile ? "10px 12px" : "12px 14px",
                        background: "linear-gradient(135deg, #7C3AED, #5B21B6)", flexShrink: 0,
                    }}>
                        <div style={{
                            width: vp.isMobile ? 32 : 36, height: vp.isMobile ? 32 : 36,
                            borderRadius: "50%", background: "rgba(255,255,255,0.18)",
                            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                            <Bot size={vp.isMobile ? 15 : 18} color="#fff" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: vp.isMobile ? 13 : 14, color: "#fff", margin: 0 }}>
                                HR Assistant
                            </p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
                                Online · AI Powered
                            </p>
                        </div>
                        <button onClick={handleClear} title="Clear"
                            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.65)", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
                        ><Trash2 size={15} /></button>
                        <button onClick={() => setOpen(false)} title="Close"
                            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.65)", cursor: "pointer", padding: 6, borderRadius: 8, display: "flex" }}
                            onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                            onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
                        ><X size={16} /></button>
                    </div>

                    {/* Messages */}
                    <div className="ai-scroll" style={{
                        flex: 1, overflowY: "auto",
                        padding: vp.isMobile ? "10px 10px 0" : "14px 14px 0",
                        WebkitOverflowScrolling: "touch",
                    }}>
                        {messages.map(m => (
                            <Bubble key={m.id} msg={m} onAction={handleSend} onRetry={handleSend} isMobile={vp.isMobile} />
                        ))}
                        {loading && <Typing isMobile={vp.isMobile} />}
                        <div ref={bottomRef} style={{ height: 8 }} />
                    </div>

                    {/* Suggestion chips */}
                    {showWelcome && (
                        <div className="ai-scroll" style={{
                            flexShrink: 0, padding: vp.isMobile ? "6px 10px" : "8px 14px",
                            borderTop: "1px solid rgba(200,180,255,0.2)",
                            maxHeight: vp.isMobile ? 170 : 210, overflowY: "auto",
                            WebkitOverflowScrolling: "touch",
                        }}>
                            {/* Group tabs */}
                            <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
                                {SUGGESTION_GROUPS.map(g => {
                                    const Icon = g.icon;
                                    const active = activeGroup === g.label;
                                    return (
                                        <button key={g.label}
                                            onClick={() => setActiveGroup(active ? null : g.label)}
                                            style={{
                                                display: "flex", alignItems: "center", gap: 4,
                                                fontSize: vp.isMobile ? 9 : 10,
                                                padding: vp.isMobile ? "3px 7px" : "3px 8px",
                                                borderRadius: 20,
                                                border: `1px solid ${active ? g.color : "#DDD6FE"}`,
                                                background: active ? g.color : "#fff",
                                                color: active ? "#fff" : "#6B7280",
                                                cursor: "pointer", fontWeight: 600,
                                                transition: "all 0.15s", whiteSpace: "nowrap",
                                            }}>
                                            <Icon size={9} />
                                            {g.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Chips */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: vp.isMobile ? 5 : 6 }}>
                                {(activeGroup
                                    ? SUGGESTION_GROUPS.find(g => g.label === activeGroup)?.items || []
                                    : SUGGESTION_GROUPS.flatMap(g => g.items).slice(0, vp.isMobile ? 6 : 8)
                                ).map(s => (
                                    <button key={s} className="ai-chip" onClick={() => handleSend(s)}
                                        style={{
                                            fontSize: vp.isMobile ? 10 : 11,
                                            padding: vp.isMobile ? "4px 9px" : "5px 11px",
                                            borderRadius: 20, background: "#fff",
                                            border: "1px solid #DDD6FE", color: "#5B21B6",
                                            cursor: "pointer", fontWeight: 500, transition: "all 0.15s",
                                        }}>
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div style={{
                        padding: vp.isMobile ? "8px 10px 10px" : "10px 12px 12px",
                        flexShrink: 0, background: "#fff",
                        borderTop: "1px solid rgba(200,180,255,0.25)",
                        paddingBottom: `max(${vp.isMobile ? "10px" : "12px"}, env(safe-area-inset-bottom, 0px))`,
                    }}>
                        <div style={{
                            display: "flex", alignItems: "flex-end", gap: 8,
                            background: "#F5F3FF", borderRadius: 14,
                            padding: vp.isMobile ? "7px 9px 7px 11px" : "8px 10px 8px 12px",
                            border: "1px solid #DDD6FE",
                        }}>
                            <textarea ref={inputRef} rows={1} value={input} maxLength={500}
                                onChange={e => {
                                    setInput(e.target.value);
                                    e.target.style.height = "auto";
                                    e.target.style.height = Math.min(e.target.scrollHeight, vp.isMobile ? 60 : 80) + "px";
                                }}
                                onKeyDown={handleKey}
                                placeholder={vp.isMobile ? "Ask HR anything…" : "Ask about leaves, expenses, shifts, reports..."}
                                style={{
                                    flex: 1, background: "transparent", border: "none", outline: "none",
                                    fontSize: 13, color: "#1F2937", resize: "none", lineHeight: 1.5,
                                    maxHeight: vp.isMobile ? 60 : 80, minHeight: 20, fontFamily: "inherit",
                                    WebkitTapHighlightColor: "transparent",
                                }}
                            />
                            <button onClick={() => handleSend()} disabled={!input.trim() || loading}
                                style={{
                                    width: vp.isMobile ? 30 : 32, height: vp.isMobile ? 30 : 32,
                                    borderRadius: 10, flexShrink: 0, border: "none",
                                    background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    cursor: input.trim() && !loading ? "pointer" : "not-allowed",
                                    opacity: input.trim() && !loading ? 1 : 0.4,
                                    transition: "opacity 0.15s, transform 0.1s",
                                }}
                                onMouseEnter={e => { if (input.trim() && !loading) e.currentTarget.style.transform = "scale(1.08)"; }}
                                onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
                            >
                                {loading
                                    ? <Loader2 size={14} color="#fff" style={{ animation: "spin 1s linear infinite" }} />
                                    : <Send size={14} color="#fff" />
                                }
                            </button>
                        </div>
                        <p style={{ fontSize: 10, color: "#A78BFA", textAlign: "center", margin: "4px 0 0" }}>
                            {vp.isMobile ? "Tap send or press Enter" : "Enter to send · Shift+Enter for new line"}
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default AiChat;