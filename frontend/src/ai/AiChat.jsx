

// import React, { useState, useRef, useEffect, useCallback } from "react";
// import {
//     MessageCircle, X, Send, Trash2, Loader2, Bot, User,
//     RefreshCw, TrendingUp, Clock, Activity, ChevronDown,
//     ChevronUp, Briefcase, Search, Zap, Star, AlertTriangle,
//     BarChart2, UserCheck, FileText, Calendar, Shield, Award,
// } from "lucide-react";

// // ─────────────────────────────────────────────────────────────────────────────
// // CONFIG & API
// // ─────────────────────────────────────────────────────────────────────────────
// const API_BASE = import.meta.env.VITE_API_URL;

// const getToken = () =>
//     localStorage.getItem("accessToken") ||
//     sessionStorage.getItem("accessToken") ||
//     "";

// const sendMessage = async (message) => {
//     const res = await fetch(`${API_BASE}/ai/chat`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${getToken()}`,
//         },
//         body: JSON.stringify({ message }),
//     });
//     if (!res.ok) {
//         const err = await res.json().catch(() => ({}));
//         throw new Error(err.message || "Request failed");
//     }
//     return res.json();
// };

// const clearServerHistory = async () => {
//     await fetch(`${API_BASE}/ai/chat/history`, {
//         method: "DELETE",
//         headers: { Authorization: `Bearer ${getToken()}` },
//     });
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // SUGGESTION GROUPS — updated with new actions
// // ─────────────────────────────────────────────────────────────────────────────
// const SUGGESTION_GROUPS = [
//     {
//         label: "My Info",
//         icon: User,
//         color: "#6366F1",
//         items: [
//             "How many leaves do I have?",
//             "Show my attendance this month",
//             "Show my latest payslip",
//             "View my profile",
//         ],
//     },
//     {
//         label: "Apply & Manage",
//         icon: Calendar,
//         color: "#0EA5E9",
//         items: [
//             "Apply casual leave tomorrow",
//             "Show my pending leaves",
//             "Upcoming public holidays",
//             "Monthly summary",
//         ],
//     },
//     {
//         label: "HR Policies",
//         icon: Shield,
//         color: "#10B981",
//         items: [
//             "Search policy for WFH",
//             "What is the notice period?",
//             "When is salary credited?",
//             "Leave carry over policy",
//         ],
//     },
//     {
//         label: "Manager Tools",
//         icon: BarChart2,
//         color: "#F59E0B",
//         items: [
//             "Who is on leave tomorrow?",
//             "Show late employees this week",
//             "Team burnout report",
//             "Predict attrition risk",
//         ],
//     },
//     {
//         label: "Recruitment",
//         icon: Briefcase,
//         color: "#EC4899",
//         items: [
//             "Show open positions",
//             "Rank candidates for job 1",
//             "Generate JD for Backend Developer",
//             "Screen candidate 5 for job 2",
//         ],
//     },
// ];

// // ─────────────────────────────────────────────────────────────────────────────
// // QUICK Q&A — instant client-side answers
// // ─────────────────────────────────────────────────────────────────────────────
// const QUICK_QA = {
//     "notice period": "Notice period is 30 days for employees. For managers, it's 30–90 days based on grade.",
//     "what is the notice period": "Notice period is 30 days for employees. For managers, 30–90 days based on grade.",
//     "wfh policy": "WFH is allowed but must be pre-approved by your manager via official channel before the working day.",
//     "can i work from home": "Yes! WFH must be pre-approved by your manager through the official channel.",
//     "half day": "Half-day leaves are not supported. Minimum leave unit is 1 full working day.",
//     "can i take half day": "Half-day leaves are not supported. The minimum is 1 full working day.",
//     "salary date": "Salary is credited on the last working day of every month to your registered bank account.",
//     "when is salary": "Salary is credited on the last working day of every month.",
//     "probation": "Probation is 3 months for new employees. Leave is limited during this period.",
//     "carry over": "Only Paid leave carries over — max 10 days. Sick and Casual leaves lapse at year end.",
//     "leave carry": "Only Paid leave carries over to the next year — maximum 10 days.",
//     "overtime": "Overtime is not tracked or calculated through this system.",
//     "medical certificate": "A medical certificate is required for 3 or more consecutive sick leaves.",
//     "attendance minimum": "Minimum 70% attendance per month is required. Below 70% triggers an HR review.",
//     "late arrival": "You're marked Late if check-in is after 9:15 AM. Early departure is before 5:45 PM.",
//     "working hours": "Standard hours: 9:00 AM – 6:00 PM, Monday to Friday.",
// };

// const getQuickAnswer = (msg) => {
//     const lower = msg.toLowerCase().trim();
//     for (const [key, val] of Object.entries(QUICK_QA)) {
//         if (lower.includes(key)) return val;
//     }
//     return null;
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // DESIGN TOKENS
// // ─────────────────────────────────────────────────────────────────────────────
// const T = {
//     purple: { bg: "#F5F3FF", border: "#DDD6FE", text: "#5B21B6", accent: "#7C3AED", light: "#EDE9FE" },
//     blue: { bg: "#EFF6FF", border: "#BFDBFE", text: "#1E40AF", accent: "#2563EB", light: "#DBEAFE" },
//     green: { bg: "#F0FDF4", border: "#BBF7D0", text: "#166534", accent: "#16A34A", light: "#DCFCE7" },
//     amber: { bg: "#FFFBEB", border: "#FDE68A", text: "#92400E", accent: "#D97706", light: "#FEF3C7" },
//     red: { bg: "#FFF5F5", border: "#FECACA", text: "#991B1B", accent: "#DC2626", light: "#FEE2E2" },
//     sky: { bg: "#F0F9FF", border: "#BAE6FD", text: "#0369A1", accent: "#0EA5E9", light: "#E0F2FE" },
//     pink: { bg: "#FDF2F8", border: "#FBCFE8", text: "#9D174D", accent: "#EC4899", light: "#FCE7F3" },
//     teal: { bg: "#F0FDFA", border: "#99F6E4", text: "#134E4A", accent: "#0D9488", light: "#CCFBF1" },
//     orange: { bg: "#FFF7ED", border: "#FED7AA", text: "#9A3412", accent: "#EA580C", light: "#FFEDD5" },
//     slate: { bg: "#F8FAFC", border: "#CBD5E1", text: "#334155", accent: "#475569", light: "#F1F5F9" },
// };

// const STATUS_COLORS = {
//     Pending: { bg: "#FFF3CD", text: "#856404", border: "#FFE69C" },
//     Approved: { bg: "#D1E7DD", text: "#0F5132", border: "#A3CFBB" },
//     Rejected: { bg: "#F8D7DA", text: "#842029", border: "#F5C2C7" },
//     Cancelled: { bg: "#E2E3E5", text: "#41464B", border: "#C4C8CB" },
//     Present: { bg: "#D1E7DD", text: "#0F5132", border: "#A3CFBB" },
//     Absent: { bg: "#F8D7DA", text: "#842029", border: "#F5C2C7" },
//     Late: { bg: "#FFF3CD", text: "#856404", border: "#FFE69C" },
//     High: { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },
//     Medium: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
//     Low: { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" },
//     Strong: { bg: "#D1E7DD", text: "#0F5132", border: "#A3CFBB" },
//     Moderate: { bg: "#FFF3CD", text: "#856404", border: "#FFE69C" },
//     Weak: { bg: "#F8D7DA", text: "#842029", border: "#F5C2C7" },
//     Open: { bg: "#DBEAFE", text: "#1E40AF", border: "#BFDBFE" },
//     Closed: { bg: "#E2E3E5", text: "#41464B", border: "#C4C8CB" },
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // MICRO COMPONENTS
// // ─────────────────────────────────────────────────────────────────────────────
// const Badge = ({ status }) => {
//     const s = STATUS_COLORS[status] || STATUS_COLORS.Cancelled;
//     return (
//         <span style={{
//             background: s.bg, color: s.text, border: `1px solid ${s.border}`,
//             fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
//             letterSpacing: "0.02em", whiteSpace: "nowrap",
//         }}>
//             {status}
//         </span>
//     );
// };

// const CardShell = ({ color = T.slate, icon: Icon, label, children, rightEl }) => (
//     <div style={{
//         marginTop: 8, background: color.bg, borderRadius: 12,
//         padding: "10px 12px", border: `1px solid ${color.border}`,
//     }}>
//         <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
//             <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
//                 {Icon && <Icon size={12} color={color.accent} strokeWidth={2.5} />}
//                 <span style={{
//                     fontSize: 10, fontWeight: 700, color: color.accent,
//                     textTransform: "uppercase", letterSpacing: "0.07em",
//                 }}>
//                     {label}
//                 </span>
//             </div>
//             {rightEl}
//         </div>
//         {children}
//     </div>
// );

// const ScoreBar = ({ score, color, label }) => (
//     <div style={{ marginTop: 4 }}>
//         {label && (
//             <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#6B7280", marginBottom: 2 }}>
//                 <span>{label}</span>
//                 <span style={{ fontWeight: 700, color }}>{score}/100</span>
//             </div>
//         )}
//         <div style={{ height: 4, background: "#E5E7EB", borderRadius: 4, overflow: "hidden" }}>
//             <div style={{
//                 width: `${score}%`, height: "100%", background: color,
//                 borderRadius: 4, transition: "width 0.7s cubic-bezier(0.34,1.56,0.64,1)",
//             }} />
//         </div>
//     </div>
// );

// const StatPill = ({ val, label, bg, text }) => (
//     <div style={{ flex: 1, background: bg, borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
//         <p style={{ fontSize: 20, fontWeight: 800, color: text, margin: 0, lineHeight: 1 }}>{val}</p>
//         <p style={{ fontSize: 10, color: text, margin: 0, opacity: 0.75, marginTop: 2 }}>{label}</p>
//     </div>
// );

// const Row = ({ label, value, dimLabel, mono, rightColor }) => (
//     <div style={{
//         display: "flex", justifyContent: "space-between", alignItems: "center",
//         padding: "4px 0", borderBottom: "1px solid rgba(0,0,0,0.04)", fontSize: 12,
//     }}>
//         <span style={{ color: dimLabel ? "#9CA3AF" : "#374151" }}>{label}</span>
//         <span style={{ fontWeight: 600, color: rightColor || "#111827", fontFamily: mono ? "monospace" : "inherit" }}>
//             {value}
//         </span>
//     </div>
// );

// const TagRow = ({ tags, bg, text, border }) => (
//     <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
//         {tags.map((t, i) => (
//             <span key={i} style={{
//                 fontSize: 10, background: bg, color: text, border: `1px solid ${border}`,
//                 borderRadius: 12, padding: "1px 7px",
//             }}>{t}</span>
//         ))}
//     </div>
// );

// const ExpandBtn = ({ expanded, setExpanded, total, shown, color }) => (
//     total > shown && (
//         <button onClick={() => setExpanded(v => !v)} style={{
//             display: "flex", alignItems: "center", gap: 4, fontSize: 11,
//             color, background: "none", border: "none", cursor: "pointer",
//             padding: "4px 0 0", marginTop: 2,
//         }}>
//             {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
//             {expanded ? "Show less" : `Show ${total - shown} more`}
//         </button>
//     )
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // DATA CARDS
// // ─────────────────────────────────────────────────────────────────────────────

// // ── Leave Balance ────────────────────────────────────────────────────────────
// const LeaveBalanceCard = ({ balance }) => {
//     if (!balance) return null;
//     const tiles = [
//         { label: "Sick", val: balance.sickRemaining ?? "—" },
//         { label: "Casual", val: balance.casualRemaining ?? "—" },
//         { label: "Paid", val: balance.paidRemaining ?? "—" },
//         { label: "Total", val: balance.remaining ?? "—", hi: true },
//     ];
//     return (
//         <CardShell color={T.purple} icon={Calendar} label={`Leave Balance ${new Date().getFullYear()}`}>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
//                 {tiles.map(t => (
//                     <div key={t.label} style={{
//                         background: t.hi ? T.purple.accent : "#fff",
//                         borderRadius: 8, padding: "6px 10px",
//                         border: `1px solid ${t.hi ? T.purple.accent : T.purple.border}`,
//                     }}>
//                         <p style={{ fontSize: 10, color: t.hi ? "#DDD6FE" : "#9CA3AF", margin: 0 }}>{t.label}</p>
//                         <p style={{ fontSize: 22, fontWeight: 800, color: t.hi ? "#fff" : "#111827", margin: 0, lineHeight: 1.1 }}>{t.val}</p>
//                         <p style={{ fontSize: 10, color: t.hi ? "#C4B5FD" : "#9CA3AF", margin: 0 }}>days left</p>
//                     </div>
//                 ))}
//             </div>
//         </CardShell>
//     );
// };

// // ── Leave List ───────────────────────────────────────────────────────────────
// const LeaveListCard = ({ leaves, onAction }) => {
//     if (!leaves?.length) return null;
//     return (
//         <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
//             {leaves.map(l => (
//                 <div key={l.id} style={{
//                     background: "#fff", borderRadius: 10, padding: "9px 12px",
//                     border: "1px solid #E5E7EB",
//                 }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
//                         <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{l.leaveType || "Leave"}</span>
//                         <Badge status={l.status} />
//                     </div>
//                     <p style={{ color: "#6B7280", fontSize: 12, margin: "2px 0" }}>
//                         {l.startDate} → {l.endDate} · <strong>{l.daysRequested}</strong> day(s)
//                     </p>
//                     <p style={{ color: "#9CA3AF", fontSize: 11, margin: 0, fontStyle: "italic" }}>{l.reason}</p>
//                     {l.status === "Pending" && (
//                         <button onClick={() => onAction(`cancel leave ${l.id}`)} style={{
//                             marginTop: 6, fontSize: 11, color: "#DC2626",
//                             background: "none", border: "1px solid #FECACA",
//                             borderRadius: 6, padding: "2px 10px", cursor: "pointer",
//                         }}>
//                             Cancel
//                         </button>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// };

// // ── Payslip ──────────────────────────────────────────────────────────────────
// const PayslipCard = ({ payslip }) => {
//     if (!payslip) return null;
//     const MN = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//     const rows = [
//         { label: "Basic", val: payslip.basic },
//         { label: "HRA", val: payslip.hra },
//         { label: "Transport", val: payslip.transport },
//         { label: "Medical", val: payslip.medical },
//         { label: "Bonus", val: payslip.bonus },
//         { label: "PF", val: payslip.pfDeduction && `-${payslip.pfDeduction}`, red: true },
//         { label: "TDS", val: payslip.tds && `-${payslip.tds}`, red: true },
//     ].filter(r => r.val != null && r.val !== false);

//     return (
//         <CardShell color={T.green} icon={FileText} label={`Payslip — ${MN[payslip.month]} ${payslip.year}`}>
//             {rows.map(r => (
//                 <Row key={r.label} label={r.label}
//                     value={`₹${Number(r.val).toLocaleString("en-IN")}`}
//                     rightColor={r.red ? "#DC2626" : "#111827"} />
//             ))}
//             <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, padding: "7px 0 0", color: T.green.accent }}>
//                 <span>Net Pay</span>
//                 <span>₹{Number(payslip.netSalary).toLocaleString("en-IN")}</span>
//             </div>
//         </CardShell>
//     );
// };

// // ── Attendance ───────────────────────────────────────────────────────────────
// const AttendanceCard = ({ summary }) => {
//     if (!summary) return null;
//     const { present, absent, late, wfh, total, pct, days } = summary;
//     const bars = [
//         { label: "Present", val: present, color: "#16A34A" },
//         { label: "Absent", val: absent, color: "#DC2626" },
//         { label: "Late", val: late, color: "#D97706" },
//         { label: "WFH", val: wfh, color: "#2563EB" },
//     ];
//     return (
//         <CardShell color={T.blue} icon={Activity}
//             label={`Attendance · Last ${days} days`}
//             rightEl={
//                 <span style={{
//                     fontSize: 14, fontWeight: 800,
//                     color: pct >= 70 ? "#16A34A" : "#DC2626",
//                 }}>{pct}%</span>
//             }>
//             {/* stacked bar */}
//             <div style={{ display: "flex", height: 6, borderRadius: 4, overflow: "hidden", marginBottom: 10, background: "#DBEAFE" }}>
//                 {bars.map(b => (
//                     <div key={b.label} style={{ width: `${total > 0 ? (b.val / total) * 100 : 0}%`, background: b.color }} />
//                 ))}
//             </div>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
//                 {bars.map(b => (
//                     <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
//                         <span style={{ width: 8, height: 8, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
//                         <span style={{ color: "#374151" }}>{b.label}</span>
//                         <span style={{ fontWeight: 700, color: "#111827", marginLeft: "auto" }}>{b.val}</span>
//                     </div>
//                 ))}
//             </div>
//             {pct < 70 && (
//                 <div style={{ marginTop: 8, background: T.red.bg, borderRadius: 6, padding: "5px 8px", border: `1px solid ${T.red.border}` }}>
//                     <p style={{ fontSize: 11, color: T.red.text, margin: 0 }}>
//                         ⚠ Below 70% minimum — HR review may be triggered.
//                     </p>
//                 </div>
//             )}
//         </CardShell>
//     );
// };

// // ── Holidays ─────────────────────────────────────────────────────────────────
// const HolidayCard = ({ holidays }) => {
//     if (!holidays?.length) return null;
//     return (
//         <CardShell color={T.orange} icon={Calendar} label="Upcoming Holidays">
//             {holidays.slice(0, 6).map(h => (
//                 <Row key={h.date} label={h.name} value={h.date} rightColor={T.orange.accent} />
//             ))}
//         </CardShell>
//     );
// };

// // ── Profile ───────────────────────────────────────────────────────────────────
// const ProfileCard = ({ profile }) => {
//     if (!profile) return null;
//     const initials = profile.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
//     return (
//         <CardShell color={T.slate} icon={User} label="Employee Profile">
//             <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
//                 <div style={{
//                     width: 44, height: 44, borderRadius: "50%",
//                     background: T.purple.light, display: "flex", alignItems: "center",
//                     justifyContent: "center", fontWeight: 800, fontSize: 16, color: T.purple.accent,
//                     flexShrink: 0,
//                 }}>
//                     {initials}
//                 </div>
//                 <div>
//                     <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: "#111827" }}>{profile.name}</p>
//                     <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>{profile.designation} · {profile.department}</p>
//                     {profile.role && (
//                         <span style={{ fontSize: 10, background: T.purple.light, color: T.purple.accent, borderRadius: 10, padding: "1px 7px", marginTop: 3, display: "inline-block" }}>
//                             {profile.role}
//                         </span>
//                     )}
//                 </div>
//             </div>
//             {[["Employee ID", profile.employeeCode], ["Email", profile.email], ["Joined", profile.joiningDate]]
//                 .filter(r => r[1])
//                 .map(([l, v]) => <Row key={l} label={l} value={v} dimLabel />)}
//         </CardShell>
//     );
// };

// // ── Team Leaves ───────────────────────────────────────────────────────────────
// const TeamLeaveCard = ({ leaves, onAction }) => {
//     if (!leaves?.length) return null;
//     return (
//         <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
//             {leaves.map(l => (
//                 <div key={l.id} style={{
//                     background: "#fff", borderRadius: 10, padding: "9px 12px",
//                     border: "1px solid #E5E7EB",
//                 }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
//                         <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>
//                             {l.employee?.name || "Employee"}
//                         </span>
//                         <Badge status={l.status} />
//                     </div>
//                     <p style={{ color: "#6B7280", fontSize: 12, margin: "2px 0" }}>
//                         {l.leaveType} · {l.startDate} → {l.endDate} ({l.daysRequested}d)
//                     </p>
//                     <p style={{ color: "#9CA3AF", fontSize: 11, margin: "0 0 6px", fontStyle: "italic" }}>{l.reason}</p>
//                     {l.status === "Pending" && (
//                         <div style={{ display: "flex", gap: 6 }}>
//                             <button onClick={() => onAction(`approve leave ${l.id}`)} style={{
//                                 fontSize: 11, color: "#16A34A", background: "#F0FDF4",
//                                 border: "1px solid #BBF7D0", borderRadius: 6, padding: "2px 10px", cursor: "pointer",
//                             }}>✓ Approve</button>
//                             <button onClick={() => onAction(`reject leave ${l.id}`)} style={{
//                                 fontSize: 11, color: "#DC2626", background: "#FFF1F2",
//                                 border: "1px solid #FECACA", borderRadius: 6, padding: "2px 10px", cursor: "pointer",
//                             }}>✗ Reject</button>
//                         </div>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// };

// // ── Who On Leave Tomorrow ────────────────────────────────────────────────────
// const OnLeaveTomorrowCard = ({ leaves, date }) => {
//     if (!leaves) return null;
//     const dateStr = date ? new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "";
//     return (
//         <CardShell color={T.sky} icon={Clock} label={`On Leave Tomorrow · ${dateStr}`}>
//             {!leaves.length
//                 ? <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>✓ Everyone is available tomorrow!</p>
//                 : leaves.map(l => (
//                     <div key={l.id} style={{
//                         display: "flex", justifyContent: "space-between", alignItems: "center",
//                         padding: "5px 0", borderBottom: `1px solid ${T.sky.light}`, fontSize: 13,
//                     }}>
//                         <div>
//                             <span style={{ fontWeight: 600, color: "#111827" }}>{l.employee?.name || "—"}</span>
//                             <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{l.employee?.designation}</span>
//                         </div>
//                         <Badge status={l.leaveType || "Leave"} />
//                     </div>
//                 ))
//             }
//         </CardShell>
//     );
// };

// // ── Late Employees ───────────────────────────────────────────────────────────
// const LateEmployeesCard = ({ employees, days }) => {
//     if (!employees) return null;
//     return (
//         <CardShell color={T.amber} icon={Clock} label={`Late Arrivals · Last ${days} days`}>
//             {!employees.length
//                 ? <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>✓ No late arrivals recorded!</p>
//                 : employees.map((e, i) => (
//                     <div key={i} style={{
//                         display: "flex", justifyContent: "space-between", alignItems: "center",
//                         padding: "5px 0", borderBottom: `1px solid ${T.amber.light}`, fontSize: 13,
//                     }}>
//                         <div>
//                             <span style={{ fontWeight: 600, color: "#111827" }}>{e.employee?.name || "—"}</span>
//                             <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{e.employee?.designation}</span>
//                         </div>
//                         <span style={{
//                             background: T.amber.light, color: T.amber.text, border: `1px solid ${T.amber.border}`,
//                             fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
//                         }}>{e.count}x late</span>
//                     </div>
//                 ))
//             }
//         </CardShell>
//     );
// };

// // ── Burnout Report ───────────────────────────────────────────────────────────
// const BurnoutReportCard = ({ employees, summary }) => {
//     const [expanded, setExpanded] = useState(false);
//     if (!employees) return null;
//     const shown = expanded ? employees : employees.slice(0, 3);
//     const riskColor = (r) => r === "High" ? "#EF4444" : r === "Medium" ? "#F59E0B" : "#10B981";

//     return (
//         <CardShell color={T.red} icon={Activity} label="Team Burnout Report">
//             <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
//                 <StatPill val={summary.highRisk} label="High Risk" bg={T.red.light} text={T.red.text} />
//                 <StatPill val={summary.mediumRisk} label="Medium Risk" bg={T.amber.light} text={T.amber.text} />
//                 <StatPill val={summary.total} label="Total" bg={T.green.light} text={T.green.text} />
//             </div>
//             {shown.map((e, i) => (
//                 <div key={i} style={{
//                     background: "#fff", borderRadius: 8, padding: "8px 10px",
//                     marginBottom: 6, border: `1px solid ${T.red.border}`,
//                 }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
//                         <div>
//                             <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{e.employee?.name}</span>
//                             <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{e.employee?.designation}</span>
//                         </div>
//                         <Badge status={e.risk} />
//                     </div>
//                     <ScoreBar score={e.score} color={riskColor(e.risk)} label="Burnout score" />
//                     {e.flags?.length > 0 && (
//                         <TagRow tags={e.flags} bg={T.red.light} text={T.red.text} border={T.red.border} />
//                     )}
//                 </div>
//             ))}
//             <ExpandBtn expanded={expanded} setExpanded={setExpanded} total={employees.length} shown={3} color={T.red.accent} />
//         </CardShell>
//     );
// };

// // ── Leave Predictions ────────────────────────────────────────────────────────
// const LeavePredictionsCard = ({ employees }) => {
//     const [expanded, setExpanded] = useState(false);
//     if (!employees) return null;
//     const shown = expanded ? employees : employees.slice(0, 3);
//     const barColor = (l) => l === "High" ? T.purple.accent : l === "Medium" ? "#A78BFA" : "#DDD6FE";

//     return (
//         <CardShell color={T.purple} icon={TrendingUp} label="Leave Predictions · Next 2 Weeks">
//             {shown.map((e, i) => (
//                 <div key={i} style={{
//                     background: "#fff", borderRadius: 8, padding: "8px 10px",
//                     marginBottom: 6, border: `1px solid ${T.purple.border}`,
//                 }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
//                         <div>
//                             <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{e.employee?.name}</span>
//                             <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{e.employee?.designation}</span>
//                         </div>
//                         <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//                             <span style={{ fontSize: 10, color: "#9CA3AF" }}>{e.remainingDays}d left</span>
//                             <Badge status={e.likelihood} />
//                         </div>
//                     </div>
//                     <ScoreBar score={e.score} color={barColor(e.likelihood)} />
//                     {e.reasons?.length > 0 && (
//                         <TagRow tags={e.reasons} bg={T.purple.light} text={T.purple.text} border={T.purple.border} />
//                     )}
//                 </div>
//             ))}
//             <ExpandBtn expanded={expanded} setExpanded={setExpanded} total={employees.length} shown={3} color={T.purple.accent} />
//         </CardShell>
//     );
// };

// // ── Attrition Predictions  ← NEW ─────────────────────────────────────────────
// const AttritionCard = ({ employees }) => {
//     const [expanded, setExpanded] = useState(false);
//     if (!employees) return null;
//     const shown = expanded ? employees : employees.slice(0, 3);
//     const riskColor = (r) => r === "High" ? "#EF4444" : r === "Medium" ? "#F59E0B" : "#10B981";

//     return (
//         <CardShell color={T.pink} icon={AlertTriangle} label="Attrition Risk Predictions">
//             <div style={{ marginBottom: 8, background: T.pink.light, borderRadius: 8, padding: "6px 10px", fontSize: 11, color: T.pink.text }}>
//                 Based on burnout score, tenure, leave patterns and rejected requests.
//             </div>
//             {shown.map((e, i) => (
//                 <div key={i} style={{
//                     background: "#fff", borderRadius: 8, padding: "8px 10px",
//                     marginBottom: 6, border: `1px solid ${T.pink.border}`,
//                 }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
//                         <div>
//                             <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{e.employee?.name}</span>
//                             <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{e.employee?.designation}</span>
//                         </div>
//                         <Badge status={e.risk} />
//                     </div>
//                     <div style={{ display: "flex", gap: 8, marginBottom: 4 }}>
//                         <ScoreBar score={e.score} color={riskColor(e.risk)} label="Attrition risk" />
//                     </div>
//                     <div style={{ fontSize: 11, color: "#6B7280" }}>
//                         Burnout: <strong style={{ color: riskColor(e.risk === "High" ? "High" : "Medium") }}>{e.burnoutScore}/100</strong>
//                     </div>
//                     {e.reasons?.length > 0 && (
//                         <TagRow tags={e.reasons} bg={T.pink.light} text={T.pink.text} border={T.pink.border} />
//                     )}
//                 </div>
//             ))}
//             <ExpandBtn expanded={expanded} setExpanded={setExpanded} total={employees.length} shown={3} color={T.pink.accent} />
//         </CardShell>
//     );
// };

// // ── Performance Insights  ← NEW ──────────────────────────────────────────────
// const PerformanceInsightsCard = ({ employees }) => {
//     const [expanded, setExpanded] = useState(false);
//     if (!employees) return null;
//     const shown = expanded ? employees : employees.slice(0, 4);
//     const pctColor = (p) => p >= 80 ? "#16A34A" : p >= 70 ? "#D97706" : "#DC2626";

//     return (
//         <CardShell color={T.teal} icon={BarChart2} label="Performance Insights">
//             <div style={{ marginBottom: 10 }}>
//                 {shown.map((e, i) => (
//                     <div key={i} style={{
//                         background: "#fff", borderRadius: 8, padding: "8px 10px",
//                         marginBottom: 6, border: `1px solid ${T.teal.border}`,
//                     }}>
//                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
//                             <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{e.employee?.name}</span>
//                             <Badge status={e.performanceRisk} />
//                         </div>
//                         {/* mini attendance bar */}
//                         <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
//                             <div style={{ flex: 1, height: 4, background: "#E5E7EB", borderRadius: 4, overflow: "hidden" }}>
//                                 <div style={{ width: `${e.attendancePct}%`, height: "100%", background: pctColor(e.attendancePct), borderRadius: 4 }} />
//                             </div>
//                             <span style={{ fontSize: 12, fontWeight: 700, color: pctColor(e.attendancePct), minWidth: 36 }}>
//                                 {e.attendancePct}%
//                             </span>
//                         </div>
//                         <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#6B7280" }}>
//                             <span>Absent: <strong style={{ color: "#374151" }}>{e.absentCount}</strong></span>
//                             <span>Late: <strong style={{ color: "#374151" }}>{e.lateCount}</strong></span>
//                         </div>
//                         {e.flags?.length > 0 && (
//                             <TagRow tags={e.flags} bg={T.teal.light} text={T.teal.text} border={T.teal.border} />
//                         )}
//                     </div>
//                 ))}
//             </div>
//             <ExpandBtn expanded={expanded} setExpanded={setExpanded} total={employees.length} shown={4} color={T.teal.accent} />
//         </CardShell>
//     );
// };

// // ── Monthly Summary  ← NEW ───────────────────────────────────────────────────
// const MonthlySummaryCard = ({ data }) => {
//     if (!data) return null;
//     const { attendance, leaves, payslip, balance, suggestions } = data;
//     const pctColor = attendance?.pct >= 70 ? T.green.accent : T.red.accent;

//     return (
//         <CardShell color={T.blue} icon={Award} label={`Monthly Summary`}>
//             {/* Attendance mini row */}
//             {attendance && (
//                 <div style={{ marginBottom: 8 }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
//                         <span style={{ color: "#6B7280" }}>Attendance</span>
//                         <span style={{ fontWeight: 700, color: pctColor }}>{attendance.pct}%</span>
//                     </div>
//                     <div style={{ height: 5, background: "#DBEAFE", borderRadius: 4, overflow: "hidden" }}>
//                         <div style={{ width: `${attendance.pct}%`, height: "100%", background: pctColor, borderRadius: 4 }} />
//                     </div>
//                     <div style={{ display: "flex", gap: 10, fontSize: 11, color: "#6B7280", marginTop: 4 }}>
//                         <span>Present: <strong style={{ color: "#111827" }}>{attendance.present}</strong></span>
//                         <span>Late: <strong style={{ color: "#111827" }}>{attendance.late}</strong></span>
//                         <span>Absent: <strong style={{ color: "#111827" }}>{attendance.absent}</strong></span>
//                     </div>
//                 </div>
//             )}

//             {/* Quick stats */}
//             <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
//                 {balance && (
//                     <div style={{ flex: 1, background: T.purple.light, borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
//                         <p style={{ fontSize: 18, fontWeight: 800, color: T.purple.accent, margin: 0 }}>{balance.remaining}</p>
//                         <p style={{ fontSize: 10, color: T.purple.text, margin: 0 }}>Leave days left</p>
//                     </div>
//                 )}
//                 {leaves != null && (
//                     <div style={{ flex: 1, background: T.amber.light, borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
//                         <p style={{ fontSize: 18, fontWeight: 800, color: T.amber.accent, margin: 0 }}>{leaves}</p>
//                         <p style={{ fontSize: 10, color: T.amber.text, margin: 0 }}>Leave requests</p>
//                     </div>
//                 )}
//                 {payslip && (
//                     <div style={{ flex: 1, background: T.green.light, borderRadius: 8, padding: "6px 8px", textAlign: "center" }}>
//                         <p style={{ fontSize: 13, fontWeight: 800, color: T.green.accent, margin: 0 }}>
//                             ₹{Number(payslip.net).toLocaleString("en-IN")}
//                         </p>
//                         <p style={{ fontSize: 10, color: T.green.text, margin: 0 }}>Net pay</p>
//                     </div>
//                 )}
//             </div>

//             {/* AI suggestions */}
//             {suggestions?.length > 0 && (
//                 <div>
//                     <p style={{ fontSize: 10, fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 5px" }}>
//                         AI Suggestions
//                     </p>
//                     {suggestions.map((s, i) => (
//                         <div key={i} style={{
//                             fontSize: 12, color: "#374151", padding: "4px 8px",
//                             background: "#fff", borderRadius: 6, marginBottom: 4,
//                             border: "1px solid #E5E7EB", lineHeight: 1.4,
//                         }}>{s}</div>
//                     ))}
//                 </div>
//             )}
//         </CardShell>
//     );
// };

// // ── Policy Search  ← NEW ─────────────────────────────────────────────────────
// const PolicySearchCard = ({ results, query }) => {
//     if (!results) return null;
//     return (
//         <CardShell color={T.green} icon={Search} label={`Policy: "${query}"`}>
//             <div style={{
//                 fontSize: 13, color: "#374151", lineHeight: 1.6,
//                 background: "#fff", borderRadius: 8, padding: "8px 10px",
//                 border: `1px solid ${T.green.border}`,
//                 whiteSpace: "pre-wrap",
//             }}>
//                 {results}
//             </div>
//         </CardShell>
//     );
// };

// // ── Candidate Ranking  ← NEW ─────────────────────────────────────────────────
// const CandidateRankingCard = ({ candidates, job }) => {
//     const [expanded, setExpanded] = useState(false);
//     if (!candidates) return null;
//     const shown = expanded ? candidates : candidates.slice(0, 4);

//     return (
//         <CardShell color={T.pink} icon={Star} label={`Candidates · ${job}`}>
//             {shown.map((c, i) => (
//                 <div key={i} style={{
//                     background: "#fff", borderRadius: 8, padding: "8px 10px",
//                     marginBottom: 6, border: `1px solid ${T.pink.border}`,
//                     display: "flex", alignItems: "center", gap: 10,
//                 }}>
//                     {/* rank circle */}
//                     <div style={{
//                         width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
//                         background: i === 0 ? "#FEF3C7" : i === 1 ? "#F3F4F6" : "#FFF",
//                         border: `2px solid ${i === 0 ? "#F59E0B" : i === 1 ? "#9CA3AF" : "#E5E7EB"}`,
//                         display: "flex", alignItems: "center", justifyContent: "center",
//                         fontSize: 12, fontWeight: 800,
//                         color: i === 0 ? "#D97706" : i === 1 ? "#6B7280" : "#9CA3AF",
//                     }}>#{c.rank}</div>
//                     <div style={{ flex: 1, minWidth: 0 }}>
//                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
//                             <span style={{ fontWeight: 700, fontSize: 13, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                                 {c.name}
//                             </span>
//                             <Badge status={c.verdict} />
//                         </div>
//                         <ScoreBar score={c.score}
//                             color={c.score >= 70 ? "#16A34A" : c.score >= 45 ? "#D97706" : "#DC2626"} />
//                         <span style={{ fontSize: 10, color: "#9CA3AF" }}>{c.email}</span>
//                     </div>
//                 </div>
//             ))}
//             <ExpandBtn expanded={expanded} setExpanded={setExpanded} total={candidates.length} shown={4} color={T.pink.accent} />
//         </CardShell>
//     );
// };

// // ── Resume Screening  ← NEW ──────────────────────────────────────────────────
// const ResumeScreeningCard = ({ data }) => {
//     if (!data) return null;
//     const { candidate, job, score, matched, missing, verdict } = data;
//     const scoreColor = score >= 70 ? "#16A34A" : score >= 45 ? "#D97706" : "#DC2626";

//     return (
//         <CardShell color={T.pink} icon={UserCheck} label={`Resume Screen · ${job}`}>
//             <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
//                 <div style={{
//                     width: 52, height: 52, borderRadius: "50%", background: T.pink.light,
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                     fontSize: 20, fontWeight: 800, color: scoreColor, flexShrink: 0,
//                     border: `2px solid ${scoreColor}`,
//                 }}>
//                     {score}
//                 </div>
//                 <div>
//                     <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: "#111827" }}>{candidate}</p>
//                     <Badge status={verdict} />
//                 </div>
//             </div>
//             <ScoreBar score={score} color={scoreColor} label="Match score" />
//             {matched?.length > 0 && (
//                 <div style={{ marginTop: 8 }}>
//                     <p style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", margin: "0 0 4px", textTransform: "uppercase" }}>Matched Skills</p>
//                     <TagRow tags={matched} bg={T.green.light} text={T.green.text} border={T.green.border} />
//                 </div>
//             )}
//             {missing?.length > 0 && (
//                 <div style={{ marginTop: 6 }}>
//                     <p style={{ fontSize: 10, fontWeight: 700, color: "#6B7280", margin: "0 0 4px", textTransform: "uppercase" }}>Missing Skills</p>
//                     <TagRow tags={missing} bg={T.red.light} text={T.red.text} border={T.red.border} />
//                 </div>
//             )}
//         </CardShell>
//     );
// };

// // ── Generated JD  ← NEW ──────────────────────────────────────────────────────
// const GeneratedJDCard = ({ role, department, jd }) => {
//     const [copied, setCopied] = useState(false);
//     if (!jd) return null;

//     const copy = () => {
//         navigator.clipboard.writeText(jd);
//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//     };

//     return (
//         <CardShell color={T.slate} icon={FileText} label={`JD · ${role} (${department})`}
//             rightEl={
//                 <button onClick={copy} style={{
//                     fontSize: 10, color: T.slate.accent, background: T.slate.bg,
//                     border: `1px solid ${T.slate.border}`, borderRadius: 6,
//                     padding: "2px 8px", cursor: "pointer",
//                 }}>
//                     {copied ? "✓ Copied" : "Copy"}
//                 </button>
//             }>
//             <div style={{
//                 fontSize: 12, color: "#374151", lineHeight: 1.65,
//                 background: "#fff", borderRadius: 8, padding: "10px 12px",
//                 border: `1px solid ${T.slate.border}`, maxHeight: 220,
//                 overflowY: "auto", whiteSpace: "pre-wrap",
//             }}>
//                 {jd}
//             </div>
//         </CardShell>
//     );
// };

// // ── Open Positions  ← NEW ────────────────────────────────────────────────────
// const OpenPositionsCard = ({ jobs }) => {
//     if (!jobs) return null;
//     return (
//         <CardShell color={T.sky} icon={Briefcase} label="Open Positions">
//             {!jobs.length
//                 ? <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>No open positions currently.</p>
//                 : jobs.map(j => (
//                     <div key={j.id} style={{
//                         display: "flex", justifyContent: "space-between", alignItems: "center",
//                         padding: "6px 0", borderBottom: `1px solid ${T.sky.light}`, fontSize: 13,
//                     }}>
//                         <div>
//                             <span style={{ fontWeight: 600, color: "#111827" }}>{j.title}</span>
//                             <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{j.department}</span>
//                         </div>
//                         <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
//                             {j.location && <span style={{ fontSize: 10, color: "#9CA3AF" }}>{j.location}</span>}
//                             <Badge status={j.status || "Open"} />
//                         </div>
//                     </div>
//                 ))
//             }
//         </CardShell>
//     );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // DATA CARD ROUTER
// // ─────────────────────────────────────────────────────────────────────────────
// const DataCard = ({ data, onAction }) => {
//     if (!data) return null;
//     switch (data.type) {
//         case "leave_balance": return <LeaveBalanceCard balance={data.balance} />;
//         case "leave_list": return <LeaveListCard leaves={data.leaves} onAction={onAction} />;
//         case "payslip": return <PayslipCard payslip={data.payslip} />;
//         case "attendance": return <AttendanceCard summary={data.summary} />;
//         case "holidays": return <HolidayCard holidays={data.holidays} />;
//         case "team_leave_list": return <TeamLeaveCard leaves={data.leaves} onAction={onAction} />;
//         case "profile": return <ProfileCard profile={data.profile} />;
//         case "on_leave_tomorrow": return <OnLeaveTomorrowCard leaves={data.leaves} date={data.date} />;
//         case "late_employees": return <LateEmployeesCard employees={data.employees} days={data.days} />;
//         case "burnout_report": return <BurnoutReportCard employees={data.employees} summary={data.summary} />;
//         case "leave_predictions": return <LeavePredictionsCard employees={data.employees} />;
//         case "attrition_predictions": return <AttritionCard employees={data.employees} />;
//         case "performance_insights": return <PerformanceInsightsCard employees={data.employees} />;
//         case "monthly_summary": return <MonthlySummaryCard data={data} />;
//         case "policy_results": return <PolicySearchCard results={data.results} query={data.query} />;
//         case "candidate_ranking": return <CandidateRankingCard candidates={data.candidates} job={data.job} />;
//         case "resume_screening": return <ResumeScreeningCard data={data} />;
//         case "generated_jd": return <GeneratedJDCard role={data.role} department={data.department} jd={data.jd} />;
//         case "open_positions": return <OpenPositionsCard jobs={data.jobs} />;
//         default: return null;
//     }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // CHAT UI PRIMITIVES
// // ─────────────────────────────────────────────────────────────────────────────
// const Timestamp = ({ ts }) => (
//     <span style={{ fontSize: 10, opacity: 0.45, marginTop: 2, display: "block" }}>
//         {new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//     </span>
// );

// const Bubble = ({ msg, onAction, onRetry }) => {
//     const isUser = msg.role === "user";
//     return (
//         <div style={{ display: "flex", gap: 8, marginBottom: 14, flexDirection: isUser ? "row-reverse" : "row" }}>
//             {/* Avatar */}
//             <div style={{
//                 width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 background: isUser
//                     ? "linear-gradient(135deg, #3B82F6, #4F46E5)"
//                     : "linear-gradient(135deg, #7C3AED, #6D28D9)",
//                 marginTop: 2,
//             }}>
//                 {isUser
//                     ? <User size={13} color="#fff" />
//                     : <Bot size={13} color="#fff" />
//                 }
//             </div>

//             <div style={{ maxWidth: "83%" }}>
//                 <div style={{
//                     padding: "10px 13px", fontSize: 13, lineHeight: 1.55,
//                     whiteSpace: "pre-line", borderRadius: 16,
//                     ...(isUser
//                         ? {
//                             background: "linear-gradient(135deg, #3B82F6, #4F46E5)",
//                             color: "#fff",
//                             borderTopRightRadius: 4,
//                         }
//                         : {
//                             background: "#fff",
//                             color: "#1F2937",
//                             border: "1px solid #F0F0F0",
//                             boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
//                             borderTopLeftRadius: 4,
//                         }
//                     ),
//                 }}>
//                     {msg.content}
//                     {msg.isError && onRetry && (
//                         <button onClick={() => onRetry(msg.originalMsg)} style={{
//                             display: "flex", alignItems: "center", gap: 4, marginTop: 6,
//                             fontSize: 11, color: "#F87171", background: "none", border: "none", cursor: "pointer", padding: 0,
//                         }}>
//                             <RefreshCw size={11} /> Retry
//                         </button>
//                     )}
//                 </div>
//                 {!isUser && msg.data && <DataCard data={msg.data} onAction={onAction} />}
//                 <Timestamp ts={msg.ts} />
//             </div>
//         </div>
//     );
// };

// const Typing = () => (
//     <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
//         <div style={{
//             width: 28, height: 28, borderRadius: "50%",
//             background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
//             display: "flex", alignItems: "center", justifyContent: "center",
//         }}>
//             <Bot size={13} color="#fff" />
//         </div>
//         <div style={{
//             background: "#fff", border: "1px solid #F0F0F0",
//             borderRadius: 16, borderTopLeftRadius: 4,
//             padding: "10px 16px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
//         }}>
//             <div style={{ display: "flex", gap: 4, alignItems: "center", height: 16 }}>
//                 {[0, 150, 300].map(d => (
//                     <span key={d} style={{
//                         width: 6, height: 6, borderRadius: "50%", background: "#A78BFA",
//                         animation: "aiBounce 1s ease infinite",
//                         animationDelay: `${d}ms`,
//                     }} />
//                 ))}
//             </div>
//         </div>
//     </div>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // MAIN COMPONENT
// // ─────────────────────────────────────────────────────────────────────────────
// const AiChat = () => {
//     const [open, setOpen] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [unread, setUnread] = useState(0);
//     const [input, setInput] = useState("");
//     const [activeGroup, setActiveGroup] = useState(null);
//     const [messages, setMessages] = useState([{
//         id: 0, role: "assistant", ts: Date.now(), data: null,
//         content: "Hi! I'm your HR Assistant 👋\n\nAsk me about leaves, payslips, attendance, team health, burnout, attrition risk, recruitment, or any HR policy.",
//     }]);

//     const bottomRef = useRef(null);
//     const inputRef = useRef(null);

//     useEffect(() => {
//         bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [messages, loading]);

//     useEffect(() => {
//         if (open) {
//             setUnread(0);
//             setTimeout(() => inputRef.current?.focus(), 150);
//         }
//     }, [open]);

//     const push = (role, content, extra = {}) =>
//         setMessages(prev => [...prev, { id: Date.now() + Math.random(), role, content, ts: Date.now(), ...extra }]);

//     const handleSend = useCallback(async (text) => {
//         const msg = (text ?? input).trim();
//         if (!msg || loading) return;
//         setInput("");
//         setActiveGroup(null);
//         push("user", msg);

//         // Quick client-side answer
//         const quick = getQuickAnswer(msg);
//         if (quick) {
//             setTimeout(() => push("assistant", quick), 350);
//             return;
//         }

//         setLoading(true);
//         try {
//             const result = await sendMessage(msg);
//             push("assistant", result.reply || "Done!", { data: result.data });
//             if (!open) setUnread(n => n + 1);
//         } catch (err) {
//             push("assistant", err.message || "Something went wrong. Please try again.", {
//                 isError: true, originalMsg: msg,
//             });
//         } finally {
//             setLoading(false);
//         }
//     }, [input, loading, open]);

//     const handleKey = (e) => {
//         if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
//     };

//     const handleClear = async () => {
//         await clearServerHistory().catch(() => { });
//         setMessages([{
//             id: Date.now(), role: "assistant", ts: Date.now(), data: null,
//             content: "Conversation cleared. How can I help you?",
//         }]);
//     };

//     const showWelcome = messages.length === 1 && !loading;

//     return (
//         <>
//             {/* ── Global keyframe styles ── */}
//             <style>{`
//                 @keyframes aiSlideUp {
//                     from { opacity: 0; transform: translateY(16px) scale(0.97); }
//                     to   { opacity: 1; transform: translateY(0)     scale(1);    }
//                 }
//                 @keyframes aiBounce {
//                     0%,80%,100% { transform: translateY(0); }
//                     40%         { transform: translateY(-5px); }
//                 }
//                 .ai-scroll::-webkit-scrollbar { width: 3px; }
//                 .ai-scroll::-webkit-scrollbar-thumb { background: #DDD6FE; border-radius: 4px; }
//                 .ai-chip:hover { background: #EDE9FE !important; border-color: #C4B5FD !important; color: #5B21B6 !important; }
//             `}</style>

//             {/* ── Floating button ── */}
//             <button
//                 onClick={() => setOpen(o => !o)}
//                 aria-label="Open HR Assistant"
//                 style={{
//                     position: "fixed", bottom: 24, right: 24, zIndex: 9999,
//                     width: 56, height: 56, borderRadius: "50%", border: "none",
//                     background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
//                     color: "#fff", cursor: "pointer",
//                     boxShadow: "0 4px 20px rgba(109,40,217,0.45)",
//                     display: "flex", alignItems: "center", justifyContent: "center",
//                     transition: "transform 0.15s, box-shadow 0.15s",
//                 }}
//                 onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.08)"; e.currentTarget.style.boxShadow = "0 6px 28px rgba(109,40,217,0.55)"; }}
//                 onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(109,40,217,0.45)"; }}
//             >
//                 {open ? <X size={22} /> : <MessageCircle size={22} />}
//                 {!open && unread > 0 && (
//                     <span style={{
//                         position: "absolute", top: -4, right: -4,
//                         width: 20, height: 20, borderRadius: "50%",
//                         background: "#EF4444", color: "#fff", fontSize: 10,
//                         fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
//                         border: "2px solid #fff",
//                     }}>{unread}</span>
//                 )}
//             </button>

//             {/* ── Chat panel ── */}
//             {open && (
//                 <div style={{
//                     position: "fixed", bottom: 92, right: 24, zIndex: 9998,
//                     width: 390, maxWidth: "calc(100vw - 32px)",
//                     height: 620, maxHeight: "calc(100vh - 110px)",
//                     display: "flex", flexDirection: "column",
//                     borderRadius: 20, overflow: "hidden",
//                     boxShadow: "0 24px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(109,40,217,0.12)",
//                     border: "1px solid rgba(200,180,255,0.2)",
//                     background: "#F8F7FF",
//                     animation: "aiSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
//                 }}>

//                     {/* Header */}
//                     <div style={{
//                         display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
//                         background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
//                         flexShrink: 0,
//                     }}>
//                         <div style={{
//                             width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,0.18)",
//                             display: "flex", alignItems: "center", justifyContent: "center",
//                         }}>
//                             <Bot size={18} color="#fff" />
//                         </div>
//                         <div style={{ flex: 1, minWidth: 0 }}>
//                             <p style={{ fontWeight: 700, fontSize: 14, color: "#fff", margin: 0 }}>HR Assistant</p>
//                             <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
//                                 <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
//                                 Online · AI Powered
//                             </p>
//                         </div>
//                         <button onClick={handleClear} title="Clear conversation" style={{
//                             background: "none", border: "none", color: "rgba(255,255,255,0.65)",
//                             cursor: "pointer", padding: 6, borderRadius: 8, display: "flex",
//                             transition: "color 0.15s",
//                         }}
//                             onMouseEnter={e => e.currentTarget.style.color = "#fff"}
//                             onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
//                         >
//                             <Trash2 size={15} />
//                         </button>
//                     </div>

//                     {/* Messages area */}
//                     <div className="ai-scroll" style={{ flex: 1, overflowY: "auto", padding: "14px 14px 0" }}>
//                         {messages.map(m => (
//                             <Bubble key={m.id} msg={m} onAction={handleSend} onRetry={handleSend} />
//                         ))}
//                         {loading && <Typing />}
//                         <div ref={bottomRef} style={{ height: 8 }} />
//                     </div>

//                     {/* Welcome chips */}
//                     {showWelcome && (
//                         <div className="ai-scroll" style={{
//                             flexShrink: 0, padding: "8px 14px",
//                             borderTop: "1px solid rgba(200,180,255,0.2)",
//                             maxHeight: 200, overflowY: "auto",
//                         }}>
//                             {/* Group tabs */}
//                             <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
//                                 {SUGGESTION_GROUPS.map(g => {
//                                     const Icon = g.icon;
//                                     const active = activeGroup === g.label;
//                                     return (
//                                         <button key={g.label}
//                                             onClick={() => setActiveGroup(active ? null : g.label)}
//                                             style={{
//                                                 display: "flex", alignItems: "center", gap: 4,
//                                                 fontSize: 10, padding: "3px 8px", borderRadius: 20,
//                                                 border: `1px solid ${active ? g.color : "#DDD6FE"}`,
//                                                 background: active ? g.color : "#fff",
//                                                 color: active ? "#fff" : "#6B7280",
//                                                 cursor: "pointer", fontWeight: 600,
//                                                 transition: "all 0.15s",
//                                             }}>
//                                             <Icon size={10} />
//                                             {g.label}
//                                         </button>
//                                     );
//                                 })}
//                             </div>
//                             {/* Chip items */}
//                             <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
//                                 {(activeGroup
//                                     ? SUGGESTION_GROUPS.find(g => g.label === activeGroup)?.items || []
//                                     : SUGGESTION_GROUPS.flatMap(g => g.items).slice(0, 8)
//                                 ).map(s => (
//                                     <button key={s} className="ai-chip"
//                                         onClick={() => handleSend(s)}
//                                         style={{
//                                             fontSize: 11, padding: "5px 11px", borderRadius: 20,
//                                             background: "#fff", border: "1px solid #DDD6FE",
//                                             color: "#5B21B6", cursor: "pointer",
//                                             fontWeight: 500, transition: "all 0.15s",
//                                         }}>
//                                         {s}
//                                     </button>
//                                 ))}
//                             </div>
//                         </div>
//                     )}

//                     {/* Input */}
//                     <div style={{
//                         padding: "10px 12px 12px", flexShrink: 0,
//                         background: "#fff",
//                         borderTop: "1px solid rgba(200,180,255,0.25)",
//                     }}>
//                         <div style={{
//                             display: "flex", alignItems: "flex-end", gap: 8,
//                             background: "#F5F3FF", borderRadius: 14,
//                             padding: "8px 10px 8px 12px",
//                             border: "1px solid #DDD6FE",
//                         }}>
//                             <textarea
//                                 ref={inputRef}
//                                 rows={1}
//                                 value={input}
//                                 maxLength={500}
//                                 onChange={e => setInput(e.target.value)}
//                                 onKeyDown={handleKey}
//                                 placeholder="Ask about leaves, burnout, recruitment..."
//                                 style={{
//                                     flex: 1, background: "transparent", border: "none", outline: "none",
//                                     fontSize: 13, color: "#1F2937", resize: "none",
//                                     lineHeight: 1.5, maxHeight: 80, minHeight: 20,
//                                     fontFamily: "inherit",
//                                 }}
//                             />
//                             <button
//                                 onClick={() => handleSend()}
//                                 disabled={!input.trim() || loading}
//                                 style={{
//                                     width: 32, height: 32, borderRadius: 10, flexShrink: 0, border: "none",
//                                     background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
//                                     display: "flex", alignItems: "center", justifyContent: "center",
//                                     cursor: input.trim() && !loading ? "pointer" : "not-allowed",
//                                     opacity: input.trim() && !loading ? 1 : 0.4,
//                                     transition: "opacity 0.15s, transform 0.1s",
//                                 }}
//                                 onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = "scale(1.08)"; }}
//                                 onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
//                             >
//                                 {loading ? <Loader2 size={14} color="#fff" style={{ animation: "spin 1s linear infinite" }} /> : <Send size={14} color="#fff" />}
//                             </button>
//                         </div>
//                         <p style={{ fontSize: 10, color: "#A78BFA", textAlign: "center", margin: "5px 0 0" }}>
//                             Enter to send · Shift+Enter for new line
//                         </p>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default AiChat;

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    MessageCircle, X, Send, Trash2, Loader2, Bot, User,
    RefreshCw, TrendingUp, Clock, Activity, ChevronDown,
    ChevronUp, Briefcase, Search, Zap, Star, AlertTriangle,
    BarChart2, UserCheck, FileText, Calendar, Shield, Award,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG & API
// ─────────────────────────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL;

const getToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    "";

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
        const handler = () => setVp({ width: window.innerWidth, height: window.innerHeight });
        window.addEventListener("resize", handler);
        return () => window.removeEventListener("resize", handler);
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
// SUGGESTION GROUPS
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
        label: "Apply & Manage",
        icon: Calendar,
        color: "#0EA5E9",
        items: [
            "Apply casual leave tomorrow",
            "Show my pending leaves",
            "Upcoming public holidays",
            "Monthly summary",
        ],
    },
    {
        label: "HR Policies",
        icon: Shield,
        color: "#10B981",
        items: [
            "Search policy for WFH",
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
            "Screen candidate 5 for job 2",
        ],
    },
];

// ─────────────────────────────────────────────────────────────────────────────
// QUICK Q&A
// ─────────────────────────────────────────────────────────────────────────────
const QUICK_QA = {
    "notice period": "Notice period is 30 days for employees. For managers, it's 30–90 days based on grade.",
    "what is the notice period": "Notice period is 30 days for employees. For managers, 30–90 days based on grade.",
    "wfh policy": "WFH is allowed but must be pre-approved by your manager via official channel before the working day.",
    "can i work from home": "Yes! WFH must be pre-approved by your manager through the official channel.",
    "half day": "Half-day leaves are not supported. Minimum leave unit is 1 full working day.",
    "can i take half day": "Half-day leaves are not supported. The minimum is 1 full working day.",
    "salary date": "Salary is credited on the last working day of every month to your registered bank account.",
    "when is salary": "Salary is credited on the last working day of every month.",
    "probation": "Probation is 3 months for new employees. Leave is limited during this period.",
    "carry over": "Only Paid leave carries over — max 10 days. Sick and Casual leaves lapse at year end.",
    "leave carry": "Only Paid leave carries over to the next year — maximum 10 days.",
    "overtime": "Overtime is not tracked or calculated through this system.",
    "medical certificate": "A medical certificate is required for 3 or more consecutive sick leaves.",
    "attendance minimum": "Minimum 70% attendance per month is required. Below 70% triggers an HR review.",
    "late arrival": "You're marked Late if check-in is after 9:15 AM. Early departure is before 5:45 PM.",
    "working hours": "Standard hours: 9:00 AM – 6:00 PM, Monday to Friday.",
};

const getQuickAnswer = (msg) => {
    const lower = msg.toLowerCase().trim();
    for (const [key, val] of Object.entries(QUICK_QA)) {
        if (lower.includes(key)) return val;
    }
    return null;
};

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
};

const STATUS_COLORS = {
    Pending: { bg: "#FFF3CD", text: "#856404", border: "#FFE69C" },
    Approved: { bg: "#D1E7DD", text: "#0F5132", border: "#A3CFBB" },
    Rejected: { bg: "#F8D7DA", text: "#842029", border: "#F5C2C7" },
    Cancelled: { bg: "#E2E3E5", text: "#41464B", border: "#C4C8CB" },
    Present: { bg: "#D1E7DD", text: "#0F5132", border: "#A3CFBB" },
    Absent: { bg: "#F8D7DA", text: "#842029", border: "#F5C2C7" },
    Late: { bg: "#FFF3CD", text: "#856404", border: "#FFE69C" },
    High: { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" },
    Medium: { bg: "#FEF3C7", text: "#92400E", border: "#FDE68A" },
    Low: { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" },
    Strong: { bg: "#D1E7DD", text: "#0F5132", border: "#A3CFBB" },
    Moderate: { bg: "#FFF3CD", text: "#856404", border: "#FFE69C" },
    Weak: { bg: "#F8D7DA", text: "#842029", border: "#F5C2C7" },
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
            letterSpacing: "0.02em", whiteSpace: "nowrap",
        }}>
            {status}
        </span>
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
                }}>
                    {label}
                </span>
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
                width: `${score}%`, height: "100%", background: color,
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

const Row = ({ label, value, dimLabel, mono, rightColor }) => (
    <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "4px 0", borderBottom: "1px solid rgba(0,0,0,0.04)", fontSize: 12,
    }}>
        <span style={{ color: dimLabel ? "#9CA3AF" : "#374151" }}>{label}</span>
        <span style={{ fontWeight: 600, color: rightColor || "#111827", fontFamily: mono ? "monospace" : "inherit" }}>
            {value}
        </span>
    </div>
);

const TagRow = ({ tags, bg, text, border }) => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
        {tags.map((t, i) => (
            <span key={i} style={{
                fontSize: 10, background: bg, color: text, border: `1px solid ${border}`,
                borderRadius: 12, padding: "1px 7px",
            }}>{t}</span>
        ))}
    </div>
);

const ExpandBtn = ({ expanded, setExpanded, total, shown, color }) => (
    total > shown && (
        <button onClick={() => setExpanded(v => !v)} style={{
            display: "flex", alignItems: "center", gap: 4, fontSize: 11,
            color, background: "none", border: "none", cursor: "pointer",
            padding: "4px 0 0", marginTop: 2,
        }}>
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {expanded ? "Show less" : `Show ${total - shown} more`}
        </button>
    )
);

// ─────────────────────────────────────────────────────────────────────────────
// DATA CARDS
// ─────────────────────────────────────────────────────────────────────────────

const LeaveBalanceCard = ({ balance }) => {
    if (!balance) return null;
    const tiles = [
        { label: "Sick", val: balance.sickRemaining ?? "—" },
        { label: "Casual", val: balance.casualRemaining ?? "—" },
        { label: "Paid", val: balance.paidRemaining ?? "—" },
        { label: "Total", val: balance.remaining ?? "—", hi: true },
    ];
    return (
        <CardShell color={T.purple} icon={Calendar} label={`Leave Balance ${new Date().getFullYear()}`}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {tiles.map(t => (
                    <div key={t.label} style={{
                        background: t.hi ? T.purple.accent : "#fff",
                        borderRadius: 8, padding: "6px 10px",
                        border: `1px solid ${t.hi ? T.purple.accent : T.purple.border}`,
                    }}>
                        <p style={{ fontSize: 10, color: t.hi ? "#DDD6FE" : "#9CA3AF", margin: 0 }}>{t.label}</p>
                        <p style={{ fontSize: 22, fontWeight: 800, color: t.hi ? "#fff" : "#111827", margin: 0, lineHeight: 1.1 }}>{t.val}</p>
                        <p style={{ fontSize: 10, color: t.hi ? "#C4B5FD" : "#9CA3AF", margin: 0 }}>days left</p>
                    </div>
                ))}
            </div>
        </CardShell>
    );
};

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
                    <p style={{ color: "#9CA3AF", fontSize: 11, margin: 0, fontStyle: "italic" }}>{l.reason}</p>
                    {l.status === "Pending" && (
                        <button onClick={() => onAction(`cancel leave ${l.id}`)} style={{
                            marginTop: 6, fontSize: 11, color: "#DC2626",
                            background: "none", border: "1px solid #FECACA",
                            borderRadius: 6, padding: "2px 10px", cursor: "pointer",
                        }}>
                            Cancel
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

const PayslipCard = ({ payslip }) => {
    if (!payslip) return null;
    const MN = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const rows = [
        { label: "Basic", val: payslip.basic },
        { label: "HRA", val: payslip.hra },
        { label: "Transport", val: payslip.transport },
        { label: "Medical", val: payslip.medical },
        { label: "Bonus", val: payslip.bonus },
        { label: "PF", val: payslip.pfDeduction && `-${payslip.pfDeduction}`, red: true },
        { label: "TDS", val: payslip.tds && `-${payslip.tds}`, red: true },
    ].filter(r => r.val != null && r.val !== false);

    return (
        <CardShell color={T.green} icon={FileText} label={`Payslip — ${MN[payslip.month]} ${payslip.year}`}>
            {rows.map(r => (
                <Row key={r.label} label={r.label}
                    value={`₹${Number(r.val).toLocaleString("en-IN")}`}
                    rightColor={r.red ? "#DC2626" : "#111827"} />
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 800, padding: "7px 0 0", color: T.green.accent }}>
                <span>Net Pay</span>
                <span>₹{Number(payslip.netSalary).toLocaleString("en-IN")}</span>
            </div>
        </CardShell>
    );
};

const AttendanceCard = ({ summary }) => {
    if (!summary) return null;
    const { present, absent, late, wfh, total, pct, days } = summary;
    const bars = [
        { label: "Present", val: present, color: "#16A34A" },
        { label: "Absent", val: absent, color: "#DC2626" },
        { label: "Late", val: late, color: "#D97706" },
        { label: "WFH", val: wfh, color: "#2563EB" },
    ];
    return (
        <CardShell color={T.blue} icon={Activity}
            label={`Attendance · Last ${days} days`}
            rightEl={
                <span style={{
                    fontSize: 14, fontWeight: 800,
                    color: pct >= 70 ? "#16A34A" : "#DC2626",
                }}>{pct}%</span>
            }>
            <div style={{ display: "flex", height: 6, borderRadius: 4, overflow: "hidden", marginBottom: 10, background: "#DBEAFE" }}>
                {bars.map(b => (
                    <div key={b.label} style={{ width: `${total > 0 ? (b.val / total) * 100 : 0}%`, background: b.color }} />
                ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5 }}>
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

const HolidayCard = ({ holidays }) => {
    if (!holidays?.length) return null;
    return (
        <CardShell color={T.orange} icon={Calendar} label="Upcoming Holidays">
            {holidays.slice(0, 6).map(h => (
                <Row key={h.date} label={h.name} value={h.date} rightColor={T.orange.accent} />
            ))}
        </CardShell>
    );
};

const ProfileCard = ({ profile }) => {
    if (!profile) return null;
    const initials = profile.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
    return (
        <CardShell color={T.slate} icon={User} label="Employee Profile">
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <div style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: T.purple.light, display: "flex", alignItems: "center",
                    justifyContent: "center", fontWeight: 800, fontSize: 16, color: T.purple.accent,
                    flexShrink: 0,
                }}>
                    {initials}
                </div>
                <div>
                    <p style={{ fontWeight: 700, fontSize: 14, margin: 0, color: "#111827" }}>{profile.name}</p>
                    <p style={{ fontSize: 11, color: "#6B7280", margin: 0 }}>{profile.designation} · {profile.department}</p>
                    {profile.role && (
                        <span style={{ fontSize: 10, background: T.purple.light, color: T.purple.accent, borderRadius: 10, padding: "1px 7px", marginTop: 3, display: "inline-block" }}>
                            {profile.role}
                        </span>
                    )}
                </div>
            </div>
            {[["Employee ID", profile.employeeCode], ["Email", profile.email], ["Joined", profile.joiningDate]]
                .filter(r => r[1])
                .map(([l, v]) => <Row key={l} label={l} value={v} dimLabel />)}
        </CardShell>
    );
};

const TeamLeaveCard = ({ leaves, onAction }) => {
    if (!leaves?.length) return null;
    return (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {leaves.map(l => (
                <div key={l.id} style={{
                    background: "#fff", borderRadius: 10, padding: "9px 12px",
                    border: "1px solid #E5E7EB",
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>
                            {l.employee?.name || "Employee"}
                        </span>
                        <Badge status={l.status} />
                    </div>
                    <p style={{ color: "#6B7280", fontSize: 12, margin: "2px 0" }}>
                        {l.leaveType} · {l.startDate} → {l.endDate} ({l.daysRequested}d)
                    </p>
                    <p style={{ color: "#9CA3AF", fontSize: 11, margin: "0 0 6px", fontStyle: "italic" }}>{l.reason}</p>
                    {l.status === "Pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => onAction(`approve leave ${l.id}`)} style={{
                                fontSize: 11, color: "#16A34A", background: "#F0FDF4",
                                border: "1px solid #BBF7D0", borderRadius: 6, padding: "2px 10px", cursor: "pointer",
                            }}>✓ Approve</button>
                            <button onClick={() => onAction(`reject leave ${l.id}`)} style={{
                                fontSize: 11, color: "#DC2626", background: "#FFF1F2",
                                border: "1px solid #FECACA", borderRadius: 6, padding: "2px 10px", cursor: "pointer",
                            }}>✗ Reject</button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

const OnLeaveTomorrowCard = ({ leaves, date }) => {
    if (!leaves) return null;
    const dateStr = date ? new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }) : "";
    return (
        <CardShell color={T.sky} icon={Clock} label={`On Leave Tomorrow · ${dateStr}`}>
            {!leaves.length
                ? <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>✓ Everyone is available tomorrow!</p>
                : leaves.map(l => (
                    <div key={l.id} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "5px 0", borderBottom: `1px solid ${T.sky.light}`, fontSize: 13,
                    }}>
                        <div>
                            <span style={{ fontWeight: 600, color: "#111827" }}>{l.employee?.name || "—"}</span>
                            <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{l.employee?.designation}</span>
                        </div>
                        <Badge status={l.leaveType || "Leave"} />
                    </div>
                ))
            }
        </CardShell>
    );
};

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
                            <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{e.employee?.designation}</span>
                        </div>
                        <span style={{
                            background: T.amber.light, color: T.amber.text, border: `1px solid ${T.amber.border}`,
                            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
                        }}>{e.count}x late</span>
                    </div>
                ))
            }
        </CardShell>
    );
};

const BurnoutReportCard = ({ employees, summary }) => {
    const [expanded, setExpanded] = useState(false);
    if (!employees) return null;
    const shown = expanded ? employees : employees.slice(0, 3);
    const riskColor = (r) => r === "High" ? "#EF4444" : r === "Medium" ? "#F59E0B" : "#10B981";
    return (
        <CardShell color={T.red} icon={Activity} label="Team Burnout Report">
            <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                <StatPill val={summary.highRisk} label="High Risk" bg={T.red.light} text={T.red.text} />
                <StatPill val={summary.mediumRisk} label="Medium Risk" bg={T.amber.light} text={T.amber.text} />
                <StatPill val={summary.total} label="Total" bg={T.green.light} text={T.green.text} />
            </div>
            {shown.map((e, i) => (
                <div key={i} style={{
                    background: "#fff", borderRadius: 8, padding: "8px 10px",
                    marginBottom: 6, border: `1px solid ${T.red.border}`,
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div>
                            <span style={{ fontWeight: 700, fontSize: 13, color: "#111827" }}>{e.employee?.name}</span>
                            <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{e.employee?.designation}</span>
                        </div>
                        <Badge status={e.risk} />
                    </div>
                    <ScoreBar score={e.score} color={riskColor(e.risk)} label="Burnout score" />
                    {e.flags?.length > 0 && (
                        <TagRow tags={e.flags} bg={T.red.light} text={T.red.text} border={T.red.border} />
                    )}
                </div>
            ))}
            <ExpandBtn expanded={expanded} setExpanded={setExpanded} total={employees.length} shown={3} color={T.red.accent} />
        </CardShell>
    );
};

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
                            <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{e.employee?.designation}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
                            <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{e.employee?.designation}</span>
                        </div>
                        <Badge status={e.risk} />
                    </div>
                    <ScoreBar score={e.score} color={riskColor(e.risk)} label="Attrition risk" />
                    <div style={{ fontSize: 11, color: "#6B7280", marginTop: 4 }}>
                        Burnout: <strong style={{ color: riskColor(e.risk === "High" ? "High" : "Medium") }}>{e.burnoutScore}/100</strong>
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

const PerformanceInsightsCard = ({ employees }) => {
    const [expanded, setExpanded] = useState(false);
    if (!employees) return null;
    const shown = expanded ? employees : employees.slice(0, 4);
    const pctColor = (p) => p >= 80 ? "#16A34A" : p >= 70 ? "#D97706" : "#DC2626";
    return (
        <CardShell color={T.teal} icon={BarChart2} label="Performance Insights">
            <div style={{ marginBottom: 10 }}>
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
            </div>
            <ExpandBtn expanded={expanded} setExpanded={setExpanded} total={employees.length} shown={4} color={T.teal.accent} />
        </CardShell>
    );
};

const MonthlySummaryCard = ({ data }) => {
    if (!data) return null;
    const { attendance, leaves, payslip, balance, suggestions } = data;
    const pctColor = attendance?.pct >= 70 ? T.green.accent : T.red.accent;
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
                            ₹{Number(payslip.net).toLocaleString("en-IN")}
                        </p>
                        <p style={{ fontSize: 10, color: T.green.text, margin: 0 }}>Net pay</p>
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
                        background: i === 0 ? "#FEF3C7" : i === 1 ? "#F3F4F6" : "#FFF",
                        border: `2px solid ${i === 0 ? "#F59E0B" : i === 1 ? "#9CA3AF" : "#E5E7EB"}`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 800,
                        color: i === 0 ? "#D97706" : i === 1 ? "#6B7280" : "#9CA3AF",
                    }}>#{c.rank}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                            <span style={{ fontWeight: 700, fontSize: 13, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {c.name}
                            </span>
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

// ─────────────────────────────────────────────────────────────────────────────
// DATA CARD ROUTER
// ─────────────────────────────────────────────────────────────────────────────
const DataCard = ({ data, onAction }) => {
    if (!data) return null;
    switch (data.type) {
        case "leave_balance": return <LeaveBalanceCard balance={data.balance} />;
        case "leave_list": return <LeaveListCard leaves={data.leaves} onAction={onAction} />;
        case "payslip": return <PayslipCard payslip={data.payslip} />;
        case "attendance": return <AttendanceCard summary={data.summary} />;
        case "holidays": return <HolidayCard holidays={data.holidays} />;
        case "team_leave_list": return <TeamLeaveCard leaves={data.leaves} onAction={onAction} />;
        case "profile": return <ProfileCard profile={data.profile} />;
        case "on_leave_tomorrow": return <OnLeaveTomorrowCard leaves={data.leaves} date={data.date} />;
        case "late_employees": return <LateEmployeesCard employees={data.employees} days={data.days} />;
        case "burnout_report": return <BurnoutReportCard employees={data.employees} summary={data.summary} />;
        case "leave_predictions": return <LeavePredictionsCard employees={data.employees} />;
        case "attrition_predictions": return <AttritionCard employees={data.employees} />;
        case "performance_insights": return <PerformanceInsightsCard employees={data.employees} />;
        case "monthly_summary": return <MonthlySummaryCard data={data} />;
        case "policy_results": return <PolicySearchCard results={data.results} query={data.query} />;
        case "candidate_ranking": return <CandidateRankingCard candidates={data.candidates} job={data.job} />;
        case "resume_screening": return <ResumeScreeningCard data={data} />;
        case "generated_jd": return <GeneratedJDCard role={data.role} department={data.department} jd={data.jd} />;
        case "open_positions": return <OpenPositionsCard jobs={data.jobs} />;
        default: return null;
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAT UI PRIMITIVES
// ─────────────────────────────────────────────────────────────────────────────
const Timestamp = ({ ts }) => (
    <span style={{ fontSize: 10, opacity: 0.45, marginTop: 2, display: "block" }}>
        {new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </span>
);

const Bubble = ({ msg, onAction, onRetry, isMobile }) => {
    const isUser = msg.role === "user";
    const avatarSize = isMobile ? 24 : 28;
    const fontSize = isMobile ? 12 : 13;

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
                    fontSize, lineHeight: 1.55,
                    whiteSpace: "pre-line", borderRadius: 16,
                    wordBreak: "break-word",
                    ...(isUser
                        ? {
                            background: "linear-gradient(135deg, #3B82F6, #4F46E5)",
                            color: "#fff",
                            borderTopRightRadius: 4,
                        }
                        : {
                            background: "#fff",
                            color: "#1F2937",
                            border: "1px solid #F0F0F0",
                            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                            borderTopLeftRadius: 4,
                        }
                    ),
                }}>
                    {msg.content}
                    {msg.isError && onRetry && (
                        <button onClick={() => onRetry(msg.originalMsg)} style={{
                            display: "flex", alignItems: "center", gap: 4, marginTop: 6,
                            fontSize: 11, color: "#F87171", background: "none", border: "none", cursor: "pointer", padding: 0,
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
                        animation: "aiBounce 1s ease infinite",
                        animationDelay: `${d}ms`,
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
        content: "Hi! I'm your HR Assistant 👋\n\nAsk me about leaves, payslips, attendance, team health, burnout, attrition risk, recruitment, or any HR policy.",
    }]);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    // ── Responsive panel dimensions ──────────────────────────────────────────
    const getPanelStyle = () => {
        const safeBottom = 16;
        const safeRight = 16;
        const btnAreaHeight = vp.isMobile ? 70 : 88;

        if (vp.isMobile) {
            // Full-width on mobile, anchored bottom with safe spacing above FAB
            return {
                position: "fixed",
                bottom: btnAreaHeight,
                right: 0,
                left: 0,
                zIndex: 9998,
                width: "100%",
                maxWidth: "100%",
                height: `calc(100vh - ${btnAreaHeight}px - env(safe-area-inset-top, 0px))`,
                maxHeight: `calc(100vh - ${btnAreaHeight}px)`,
                borderRadius: "20px 20px 0 0",
            };
        }

        if (vp.isSmall) {
            return {
                position: "fixed",
                bottom: btnAreaHeight,
                right: safeRight,
                left: safeRight,
                zIndex: 9998,
                width: `calc(100% - ${safeRight * 2}px)`,
                maxWidth: "100%",
                height: `calc(100vh - ${btnAreaHeight}px - 16px)`,
                maxHeight: `calc(100vh - ${btnAreaHeight}px - 16px)`,
                borderRadius: 20,
            };
        }

        if (vp.isTablet) {
            const w = Math.min(400, vp.width - 48);
            const h = Math.min(600, vp.height - btnAreaHeight - 24);
            return {
                position: "fixed",
                bottom: btnAreaHeight,
                right: safeRight,
                zIndex: 9998,
                width: w,
                maxWidth: `calc(100vw - ${safeRight * 2}px)`,
                height: h,
                maxHeight: `calc(100vh - ${btnAreaHeight + 24}px)`,
                borderRadius: 20,
            };
        }

        // Large / desktop
        const w = Math.min(420, vp.width * 0.35);
        const h = Math.min(660, vp.height - btnAreaHeight - 32);
        return {
            position: "fixed",
            bottom: btnAreaHeight,
            right: 24,
            zIndex: 9998,
            width: w,
            maxWidth: `calc(100vw - 48px)`,
            height: h,
            maxHeight: `calc(100vh - ${btnAreaHeight + 32}px)`,
            borderRadius: 20,
        };
    };

    const getFabStyle = () => {
        if (vp.isMobile) {
            return { position: "fixed", bottom: 16, right: 16, zIndex: 9999 };
        }
        return { position: "fixed", bottom: 24, right: 24, zIndex: 9999 };
    };

    const fabSize = vp.isMobile ? 48 : 56;

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading]);

    useEffect(() => {
        if (open) {
            setUnread(0);
            setTimeout(() => inputRef.current?.focus(), 150);
        }
    }, [open]);

    // Lock body scroll on mobile when open
    useEffect(() => {
        if (vp.isMobile && open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
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
        if (quick) {
            setTimeout(() => push("assistant", quick), 350);
            return;
        }

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
    const chipFontSize = vp.isMobile ? 10 : 11;
    const chipPadding = vp.isMobile ? "4px 9px" : "5px 11px";

    return (
        <>
            {/* ── Global styles ── */}
            <style>{`
                @keyframes aiSlideUp {
                    from { opacity: 0; transform: translateY(16px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes aiBounce {
                    0%,80%,100% { transform: translateY(0); }
                    40% { transform: translateY(-5px); }
                }
                @keyframes spin { to { transform: rotate(360deg); } }
                .ai-scroll::-webkit-scrollbar { width: 3px; }
                .ai-scroll::-webkit-scrollbar-thumb { background: #DDD6FE; border-radius: 4px; }
                .ai-chip:hover { background: #EDE9FE !important; border-color: #C4B5FD !important; color: #5B21B6 !important; }
                .ai-panel-overlay {
                    position: fixed; inset: 0; z-index: 9997;
                    background: rgba(0,0,0,0.2);
                    backdrop-filter: blur(2px);
                }
            `}</style>

            {/* Mobile overlay backdrop */}
            {open && vp.isMobile && (
                <div className="ai-panel-overlay" onClick={() => setOpen(false)} />
            )}

            {/* ── Floating button ── */}
            <button
                onClick={() => setOpen(o => !o)}
                aria-label="Open HR Assistant"
                style={{
                    ...getFabStyle(),
                    width: fabSize, height: fabSize, borderRadius: "50%", border: "none",
                    background: "linear-gradient(135deg, #7C3AED, #6D28D9)",
                    color: "#fff", cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(109,40,217,0.45)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    transition: "transform 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={e => {
                    e.currentTarget.style.transform = "scale(1.08)";
                    e.currentTarget.style.boxShadow = "0 6px 28px rgba(109,40,217,0.55)";
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(109,40,217,0.45)";
                }}
            >
                {open ? <X size={vp.isMobile ? 18 : 22} /> : <MessageCircle size={vp.isMobile ? 18 : 22} />}
                {!open && unread > 0 && (
                    <span style={{
                        position: "absolute", top: -4, right: -4,
                        width: 18, height: 18, borderRadius: "50%",
                        background: "#EF4444", color: "#fff", fontSize: 10,
                        fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center",
                        border: "2px solid #fff",
                    }}>{unread}</span>
                )}
            </button>

            {/* ── Chat panel ── */}
            {open && (
                <div style={{
                    ...getPanelStyle(),
                    display: "flex", flexDirection: "column",
                    overflow: "hidden",
                    boxShadow: "0 24px 60px rgba(0,0,0,0.18), 0 8px 20px rgba(109,40,217,0.12)",
                    border: "1px solid rgba(200,180,255,0.2)",
                    background: "#F8F7FF",
                    animation: "aiSlideUp 0.22s cubic-bezier(0.34,1.56,0.64,1)",
                }}>

                    {/* Header */}
                    <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: vp.isMobile ? "10px 12px" : "12px 14px",
                        background: "linear-gradient(135deg, #7C3AED, #5B21B6)",
                        flexShrink: 0,
                    }}>
                        <div style={{
                            width: vp.isMobile ? 32 : 36, height: vp.isMobile ? 32 : 36,
                            borderRadius: "50%", background: "rgba(255,255,255,0.18)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            <Bot size={vp.isMobile ? 15 : 18} color="#fff" />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontWeight: 700, fontSize: vp.isMobile ? 13 : 14, color: "#fff", margin: 0 }}>
                                HR Assistant
                            </p>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", margin: 0, display: "flex", alignItems: "center", gap: 4 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ADE80", display: "inline-block", flexShrink: 0 }} />
                                Online · AI Powered
                            </p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <button onClick={handleClear} title="Clear conversation" style={{
                                background: "none", border: "none", color: "rgba(255,255,255,0.65)",
                                cursor: "pointer", padding: 6, borderRadius: 8, display: "flex",
                                transition: "color 0.15s",
                            }}
                                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
                            >
                                <Trash2 size={15} />
                            </button>
                            {/* Close button visible on all sizes */}
                            <button onClick={() => setOpen(false)} title="Close" style={{
                                background: "none", border: "none", color: "rgba(255,255,255,0.65)",
                                cursor: "pointer", padding: 6, borderRadius: 8, display: "flex",
                                transition: "color 0.15s",
                            }}
                                onMouseEnter={e => e.currentTarget.style.color = "#fff"}
                                onMouseLeave={e => e.currentTarget.style.color = "rgba(255,255,255,0.65)"}
                            >
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Messages area */}
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

                    {/* Welcome chips */}
                    {showWelcome && (
                        <div className="ai-scroll" style={{
                            flexShrink: 0,
                            padding: vp.isMobile ? "6px 10px" : "8px 14px",
                            borderTop: "1px solid rgba(200,180,255,0.2)",
                            maxHeight: vp.isMobile ? 160 : 200,
                            overflowY: "auto",
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
                                                transition: "all 0.15s",
                                                whiteSpace: "nowrap",
                                            }}>
                                            <Icon size={9} />
                                            {g.label}
                                        </button>
                                    );
                                })}
                            </div>
                            {/* Chip items */}
                            <div style={{ display: "flex", flexWrap: "wrap", gap: vp.isMobile ? 5 : 6 }}>
                                {(activeGroup
                                    ? SUGGESTION_GROUPS.find(g => g.label === activeGroup)?.items || []
                                    : SUGGESTION_GROUPS.flatMap(g => g.items).slice(0, vp.isMobile ? 6 : 8)
                                ).map(s => (
                                    <button key={s} className="ai-chip"
                                        onClick={() => handleSend(s)}
                                        style={{
                                            fontSize: chipFontSize,
                                            padding: chipPadding,
                                            borderRadius: 20,
                                            background: "#fff", border: "1px solid #DDD6FE",
                                            color: "#5B21B6", cursor: "pointer",
                                            fontWeight: 500, transition: "all 0.15s",
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
                        flexShrink: 0,
                        background: "#fff",
                        borderTop: "1px solid rgba(200,180,255,0.25)",
                        // Safe area inset for iPhone home bar
                        paddingBottom: `max(${vp.isMobile ? "10px" : "12px"}, env(safe-area-inset-bottom, 0px))`,
                    }}>
                        <div style={{
                            display: "flex", alignItems: "flex-end", gap: 8,
                            background: "#F5F3FF", borderRadius: 14,
                            padding: vp.isMobile ? "7px 9px 7px 11px" : "8px 10px 8px 12px",
                            border: "1px solid #DDD6FE",
                        }}>
                            <textarea
                                ref={inputRef}
                                rows={1}
                                value={input}
                                maxLength={500}
                                onChange={e => {
                                    setInput(e.target.value);
                                    // Auto-resize
                                    e.target.style.height = "auto";
                                    e.target.style.height = Math.min(e.target.scrollHeight, vp.isMobile ? 60 : 80) + "px";
                                }}
                                onKeyDown={handleKey}
                                placeholder={vp.isMobile ? "Ask HR anything…" : "Ask about leaves, burnout, recruitment..."}
                                style={{
                                    flex: 1, background: "transparent", border: "none", outline: "none",
                                    fontSize: vp.isMobile ? 13 : 13, color: "#1F2937", resize: "none",
                                    lineHeight: 1.5,
                                    maxHeight: vp.isMobile ? 60 : 80,
                                    minHeight: 20,
                                    fontFamily: "inherit",
                                    WebkitTapHighlightColor: "transparent",
                                }}
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || loading}
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