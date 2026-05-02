// // src/ai/AiChat.jsx
// import React, { useState, useRef, useEffect, useCallback } from "react";
// import {
//     MessageCircle, X, Send, Trash2, Loader2, Bot, User,
//     RefreshCw, Calendar, DollarSign, Clock, Users, CheckCircle, XCircle,
// } from "lucide-react";
// import { useAuth } from "../context/AuthContext";

// const API_BASE = import.meta.env.VITE_API_URL;

// const getToken = () =>
//     localStorage.getItem("accessToken") ||
//     sessionStorage.getItem("accessToken") ||
//     "";

// const sendMessage = async (message) => {
//     const res = await fetch(`${API_BASE}/ai/chat`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
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

// // ── Suggestion groups ──────────────────────────────────────────────────────
// const SUGGESTION_GROUPS = [
//     {
//         label: "Leave",
//         items: ["How many leaves do I have?", "Show my pending leaves", "Apply casual leave tomorrow"],
//     },
//     {
//         label: "Payroll & Attendance",
//         items: ["Show my latest payslip", "Attendance last 30 days", "Upcoming holidays"],
//     },
//     {
//         label: "Manager",
//         items: ["Team pending leaves", "Approve leave"],
//     },
// ];

// // ── Status badge ───────────────────────────────────────────────────────────
// const STATUS_COLORS = {
//     Pending: { bg: "#FFF3CD", text: "#856404", border: "#FFE69C" },
//     Approved: { bg: "#D1E7DD", text: "#0F5132", border: "#A3CFBB" },
//     Rejected: { bg: "#F8D7DA", text: "#842029", border: "#F5C2C7" },
//     Cancelled: { bg: "#E2E3E5", text: "#41464B", border: "#C4C8CB" },
//     Present: { bg: "#D1E7DD", text: "#0F5132", border: "#A3CFBB" },
//     Absent: { bg: "#F8D7DA", text: "#842029", border: "#F5C2C7" },
//     Late: { bg: "#FFF3CD", text: "#856404", border: "#FFE69C" },
// };

// const Badge = ({ status }) => {
//     const s = STATUS_COLORS[status] || STATUS_COLORS.Cancelled;
//     return (
//         <span style={{
//             background: s.bg, color: s.text, border: `1px solid ${s.border}`,
//             fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
//         }}>
//             {status}
//         </span>
//     );
// };

// // ── Rich data card renderers ───────────────────────────────────────────────
// const LeaveBalanceCard = ({ balance }) => {
//     if (!balance) return null;
//     const items = [
//         { label: "Sick", val: balance.sickRemaining ?? "—" },
//         { label: "Casual", val: balance.casualRemaining ?? "—" },
//         { label: "Paid", val: balance.paidRemaining ?? "—" },
//         { label: "Total", val: balance.remaining ?? "—", highlight: true },
//     ];
//     return (
//         <div style={{ marginTop: 8, background: "#F8F0FF", borderRadius: 10, padding: "10px 12px", border: "1px solid #E9D5FF" }}>
//             <p style={{ fontSize: 11, fontWeight: 600, color: "#7C3AED", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
//                 Leave Balance {new Date().getFullYear()}
//             </p>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
//                 {items.map(i => (
//                     <div key={i.label} style={{
//                         background: i.highlight ? "#7C3AED" : "#fff",
//                         borderRadius: 8, padding: "6px 10px",
//                         border: "1px solid " + (i.highlight ? "#7C3AED" : "#E9D5FF"),
//                     }}>
//                         <p style={{ fontSize: 11, color: i.highlight ? "#EDE9FE" : "#6B7280", margin: 0 }}>{i.label}</p>
//                         <p style={{ fontSize: 20, fontWeight: 700, color: i.highlight ? "#fff" : "#111827", margin: 0 }}>{i.val}</p>
//                         <p style={{ fontSize: 10, color: i.highlight ? "#DDD6FE" : "#9CA3AF", margin: 0 }}>days left</p>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// const LeaveListCard = ({ leaves, onAction }) => {
//     if (!leaves?.length) return null;
//     return (
//         <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
//             {leaves.map(l => (
//                 <div key={l.id} style={{ background: "#fff", borderRadius: 10, padding: "8px 12px", border: "1px solid #E5E7EB", fontSize: 13 }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
//                         <span style={{ fontWeight: 600, color: "#111827" }}>{l.leaveType || "Leave"}</span>
//                         <Badge status={l.status} />
//                     </div>
//                     <p style={{ color: "#6B7280", fontSize: 12, margin: "2px 0" }}>
//                         {l.startDate} → {l.endDate} · {l.daysRequested} day(s)
//                     </p>
//                     <p style={{ color: "#9CA3AF", fontSize: 12, margin: 0, fontStyle: "italic" }}>{l.reason}</p>
//                     {l.status === "Pending" && (
//                         <button
//                             onClick={() => onAction(`cancel leave ${l.id}`)}
//                             style={{ marginTop: 6, fontSize: 11, color: "#DC2626", background: "none", border: "1px solid #FECACA", borderRadius: 6, padding: "2px 10px", cursor: "pointer" }}>
//                             Cancel
//                         </button>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// };

// const PayslipCard = ({ payslip }) => {
//     if (!payslip) return null;
//     const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
//     const rows = [
//         { label: "Basic", val: payslip.basic },
//         { label: "HRA", val: payslip.hra },
//         { label: "Transport", val: payslip.transport },
//         { label: "Medical", val: payslip.medical },
//         { label: "Bonus", val: payslip.bonus },
//         { label: "PF Deduction", val: payslip.pfDeduction && `-${payslip.pfDeduction}`, color: "#DC2626" },
//         { label: "TDS", val: payslip.tds && `-${payslip.tds}`, color: "#DC2626" },
//     ].filter(r => r.val !== undefined && r.val !== null);

//     return (
//         <div style={{ marginTop: 8, background: "#F0FDF4", borderRadius: 10, padding: "10px 12px", border: "1px solid #BBF7D0" }}>
//             <p style={{ fontSize: 11, fontWeight: 600, color: "#166534", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
//                 Payslip — {monthNames[payslip.month]} {payslip.year}
//             </p>
//             {rows.map(r => (
//                 <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0", borderBottom: "1px solid #DCFCE7" }}>
//                     <span style={{ color: "#374151" }}>{r.label}</span>
//                     <span style={{ fontWeight: 500, color: r.color || "#111827" }}>
//                         ₹{Number(r.val).toLocaleString('en-IN')}
//                     </span>
//                 </div>
//             ))}
//             <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, padding: "6px 0 0", color: "#166534" }}>
//                 <span>Net Pay</span>
//                 <span>₹{Number(payslip.netSalary).toLocaleString('en-IN')}</span>
//             </div>
//         </div>
//     );
// };

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
//         <div style={{ marginTop: 8, background: "#EFF6FF", borderRadius: 10, padding: "10px 12px", border: "1px solid #BFDBFE" }}>
//             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
//                 <p style={{ fontSize: 11, fontWeight: 600, color: "#1E40AF", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
//                     Attendance · Last {days} days
//                 </p>
//                 <span style={{ fontSize: 14, fontWeight: 700, color: pct >= 70 ? "#16A34A" : "#DC2626" }}>{pct}%</span>
//             </div>
//             {/* Progress bar */}
//             <div style={{ display: "flex", height: 6, borderRadius: 4, overflow: "hidden", marginBottom: 10, background: "#DBEAFE" }}>
//                 {bars.map(b => (
//                     <div key={b.label} style={{ width: `${total > 0 ? (b.val / total) * 100 : 0}%`, background: b.color }} />
//                 ))}
//             </div>
//             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
//                 {bars.map(b => (
//                     <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
//                         <span style={{ width: 8, height: 8, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
//                         <span style={{ color: "#374151" }}>{b.label}</span>
//                         <span style={{ fontWeight: 600, color: "#111827", marginLeft: "auto" }}>{b.val}</span>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// const HolidayCard = ({ holidays }) => {
//     if (!holidays?.length) return null;
//     return (
//         <div style={{ marginTop: 8, background: "#FFF7ED", borderRadius: 10, padding: "10px 12px", border: "1px solid #FED7AA" }}>
//             <p style={{ fontSize: 11, fontWeight: 600, color: "#9A3412", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
//                 Upcoming Holidays
//             </p>
//             {holidays.slice(0, 6).map(h => (
//                 <div key={h.date} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid #FEE2C0" }}>
//                     <span style={{ color: "#374151" }}>{h.name}</span>
//                     <span style={{ color: "#9A3412", fontWeight: 500 }}>{h.date}</span>
//                 </div>
//             ))}
//         </div>
//     );
// };

// const TeamLeaveCard = ({ leaves, onAction }) => {
//     if (!leaves?.length) return null;
//     return (
//         <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
//             {leaves.map(l => (
//                 <div key={l.id} style={{ background: "#fff", borderRadius: 10, padding: "8px 12px", border: "1px solid #E5E7EB", fontSize: 13 }}>
//                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
//                         <span style={{ fontWeight: 600, color: "#111827" }}>{l.employee?.name || "Employee"}</span>
//                         <Badge status={l.status} />
//                     </div>
//                     <p style={{ color: "#6B7280", fontSize: 12, margin: "2px 0" }}>
//                         {l.leaveType} · {l.startDate} → {l.endDate} ({l.daysRequested}d)
//                     </p>
//                     <p style={{ color: "#9CA3AF", fontSize: 12, margin: "0 0 6px", fontStyle: "italic" }}>{l.reason}</p>
//                     {l.status === "Pending" && (
//                         <div style={{ display: "flex", gap: 6 }}>
//                             <button onClick={() => onAction(`approve leave ${l.id}`)}
//                                 style={{ fontSize: 11, color: "#16A34A", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 6, padding: "2px 10px", cursor: "pointer" }}>
//                                 ✓ Approve
//                             </button>
//                             <button onClick={() => onAction(`reject leave ${l.id}`)}
//                                 style={{ fontSize: 11, color: "#DC2626", background: "#FFF1F2", border: "1px solid #FECACA", borderRadius: 6, padding: "2px 10px", cursor: "pointer" }}>
//                                 ✗ Reject
//                             </button>
//                         </div>
//                     )}
//                 </div>
//             ))}
//         </div>
//     );
// };

// const ProfileCard = ({ profile }) => {
//     if (!profile) return null;
//     const initials = profile.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
//     return (
//         <div style={{ marginTop: 8, background: "#fff", borderRadius: 10, padding: "12px", border: "1px solid #E5E7EB" }}>
//             <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
//                 <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#7C3AED" }}>
//                     {initials}
//                 </div>
//                 <div>
//                     <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: "#111827" }}>{profile.name}</p>
//                     <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>{profile.designation} · {profile.department}</p>
//                 </div>
//             </div>
//             {[
//                 ["Employee ID", profile.employeeCode],
//                 ["Email", profile.email],
//                 ["Joined", profile.joiningDate],
//             ].filter(r => r[1]).map(([l, v]) => (
//                 <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderBottom: "1px solid #F3F4F6" }}>
//                     <span style={{ color: "#9CA3AF" }}>{l}</span>
//                     <span style={{ color: "#374151" }}>{v}</span>
//                 </div>
//             ))}
//         </div>
//     );
// };

// // ── Render data card by type ───────────────────────────────────────────────
// const DataCard = ({ data, onAction }) => {
//     if (!data) return null;
//     switch (data.type) {
//         case "leave_balance": return <LeaveBalanceCard balance={data.balance} />;
//         case "leave_list": return <LeaveListCard leaves={data.leaves} onAction={onAction} />;
//         case "leave_applied": return null; // text is enough
//         case "leave_cancelled": return null;
//         case "leave_approved": return null;
//         case "leave_rejected": return null;
//         case "payslip": return <PayslipCard payslip={data.payslip} />;
//         case "attendance": return <AttendanceCard summary={data.summary} />;
//         case "holidays": return <HolidayCard holidays={data.holidays} />;
//         case "team_leave_list": return <TeamLeaveCard leaves={data.leaves} onAction={onAction} />;
//         case "profile": return <ProfileCard profile={data.profile} />;
//         default: return null;
//     }
// };

// // ── Timestamp ──────────────────────────────────────────────────────────────
// const Timestamp = ({ ts }) => (
//     <span style={{ fontSize: 10, opacity: 0.5, marginTop: 2, display: "block" }}>
//         {new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//     </span>
// );

// // ── Bubble ─────────────────────────────────────────────────────────────────
// const Bubble = ({ msg, onAction, onRetry }) => {
//     const isUser = msg.role === "user";
//     return (
//         <div className={`flex gap-2 mb-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
//             <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white mt-0.5
//         ${isUser ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-violet-500 to-purple-700"}`}>
//                 {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
//             </div>
//             <div style={{ maxWidth: "82%" }}>
//                 <div className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line rounded-2xl
//           ${isUser
//                         ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-sm"
//                         : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 shadow-sm rounded-tl-sm"
//                     }`}>
//                     {msg.content}
//                     {msg.isError && onRetry && (
//                         <button onClick={() => onRetry(msg.originalMsg)}
//                             className="flex items-center gap-1 mt-2 text-xs text-red-400 hover:text-red-600 transition">
//                             <RefreshCw className="w-3 h-3" /> Retry
//                         </button>
//                     )}
//                 </div>
//                 {!isUser && msg.data && <DataCard data={msg.data} onAction={onAction} />}
//                 <Timestamp ts={msg.ts} />
//             </div>
//         </div>
//     );
// };

// // ── Typing indicator ───────────────────────────────────────────────────────
// const Typing = () => (
//     <div className="flex gap-2 mb-3">
//         <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
//             <Bot className="w-3.5 h-3.5 text-white" />
//         </div>
//         <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
//             <div className="flex gap-1 items-center h-4">
//                 {[0, 150, 300].map(d => (
//                     <span key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
//                 ))}
//             </div>
//         </div>
//     </div>
// );

// // ── Main ───────────────────────────────────────────────────────────────────
// const AiChat = () => {
//     const [open, setOpen] = useState(false);
//     const [loading, setLoading] = useState(false);
//     const [unread, setUnread] = useState(0);
//     const [input, setInput] = useState("");
//     const [messages, setMessages] = useState([{
//         id: 0,
//         role: "assistant",
//         ts: Date.now(),
//         content: "Hi! I'm your HR Assistant 👋\n\nI can help you with:\n• Leave balance & applications\n• Payslip & salary details\n• Attendance summary\n• Public holidays\n• Your profile\n• Team leaves (managers)\n\nWhat can I do for you?",
//         data: null,
//     }]);

//     const bottomRef = useRef(null);
//     const inputRef = useRef(null);

//     useEffect(() => {
//         bottomRef.current?.scrollIntoView({ behavior: "smooth" });
//     }, [messages, loading]);

//     useEffect(() => {
//         if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 120); }
//     }, [open]);

//     const push = (role, content, extra = {}) =>
//         setMessages(prev => [...prev, { id: Date.now() + Math.random(), role, content, ts: Date.now(), ...extra }]);

//     const handleSend = useCallback(async (text) => {
//         const msg = (text ?? input).trim();
//         if (!msg || loading) return;
//         setInput("");
//         push("user", msg);
//         setLoading(true);
//         try {
//             const result = await sendMessage(msg);
//             push("assistant", result.reply || "Done!", { data: result.data });
//             if (!open) setUnread(n => n + 1);
//         } catch (err) {
//             push("assistant", err.message || "Something went wrong. Please try again.", {
//                 isError: true,
//                 originalMsg: msg,
//             });
//         } finally {
//             setLoading(false);
//         }
//     }, [input, loading, open]);

//     const handleKey = e => {
//         if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
//     };

//     const handleClear = async () => {
//         await clearServerHistory().catch(() => { });
//         setMessages([{ id: Date.now(), role: "assistant", ts: Date.now(), content: "Conversation cleared. How can I help you?", data: null }]);
//     };

//     const showChips = messages.length === 1 && !loading;

//     return (
//         <>
//             {/* Floating button */}
//             <button onClick={() => setOpen(o => !o)} aria-label="Open HR Assistant"
//                 className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
//           bg-gradient-to-br from-violet-600 to-purple-700 text-white
//           shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
//           transition-all duration-200 flex items-center justify-center">
//                 {open ? <X className="w-6 h-6" /> : (
//                     <>
//                         <MessageCircle className="w-6 h-6" />
//                         {unread > 0 && (
//                             <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
//                                 {unread}
//                             </span>
//                         )}
//                     </>
//                 )}
//             </button>

//             {/* Chat panel */}
//             {open && (
//                 <div className="fixed bottom-24 right-6 z-50 w-[370px] sm:w-[410px] h-[580px]
//           flex flex-col rounded-2xl overflow-hidden shadow-2xl
//           border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
//                     style={{ animation: "aiSlideUp 0.2s ease" }}>

//                     {/* Header */}
//                     <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0
//             bg-gradient-to-r from-violet-600 to-purple-700 text-white">
//                         <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
//                             <Bot className="w-5 h-5" />
//                         </div>
//                         <div className="flex-1 min-w-0">
//                             <p className="font-semibold text-sm">HR Assistant</p>
//                             <p className="text-xs text-purple-200 flex items-center gap-1">
//                                 <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
//                                 Online · Powered by AI
//                             </p>
//                         </div>
//                         <button onClick={handleClear} title="Clear conversation"
//                             className="p-1.5 rounded-lg hover:bg-white/20 transition">
//                             <Trash2 className="w-4 h-4" />
//                         </button>
//                     </div>

//                     {/* Messages */}
//                     <div className="flex-1 overflow-y-auto px-4 py-4">
//                         {messages.map(m => (
//                             <Bubble
//                                 key={m.id}
//                                 msg={m}
//                                 onAction={handleSend}
//                                 onRetry={handleSend}
//                             />
//                         ))}
//                         {loading && <Typing />}
//                         <div ref={bottomRef} />
//                     </div>

//                     {/* Suggestion chips — welcome screen only */}
//                     {showChips && (
//                         <div className="px-4 pb-2 flex-shrink-0">
//                             {SUGGESTION_GROUPS.map(group => (
//                                 <div key={group.label} className="mb-2">
//                                     <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
//                                         {group.label}
//                                     </p>
//                                     <div className="flex flex-wrap gap-1.5">
//                                         {group.items.map(s => (
//                                             <button key={s} onClick={() => handleSend(s)}
//                                                 className="text-xs px-3 py-1.5 rounded-full
//                           bg-white dark:bg-gray-700
//                           border border-gray-200 dark:border-gray-600
//                           text-gray-700 dark:text-gray-300
//                           hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700
//                           dark:hover:bg-violet-900/30 transition">
//                                                 {s}
//                                             </button>
//                                         ))}
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}

//                     {/* Input */}
//                     <div className="px-3 py-3 flex-shrink-0 bg-white dark:bg-gray-800
//             border-t border-gray-200 dark:border-gray-700">
//                         <div className="flex items-end gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2">
//                             <textarea ref={inputRef} rows={1} value={input} maxLength={500}
//                                 onChange={e => setInput(e.target.value)}
//                                 onKeyDown={handleKey}
//                                 placeholder="Ask about leaves, payslip, attendance..."
//                                 className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white
//                   placeholder-gray-400 resize-none outline-none leading-5 max-h-24"
//                                 style={{ minHeight: "20px" }}
//                             />
//                             <button onClick={() => handleSend()} disabled={!input.trim() || loading}
//                                 className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center
//                   bg-gradient-to-br from-violet-600 to-purple-700 text-white
//                   disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all">
//                                 {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
//                             </button>
//                         </div>
//                         <p className="text-[10px] text-gray-400 text-center mt-1.5">
//                             Enter to send · Shift+Enter for new line
//                         </p>
//                     </div>
//                 </div>
//             )}

        
//         </>
//     );
// };

// export default AiChat;

// src/ai/AiChat.jsx
import React, { useState, useRef, useEffect, useCallback } from "react";
import {
    MessageCircle, X, Send, Trash2, Loader2, Bot, User,
    RefreshCw, AlertTriangle, TrendingUp, Clock, Users,
    ChevronDown, ChevronUp, Activity,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

const getToken = () =>
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("accessToken") ||
    "";

const sendMessage = async (message) => {
    const res = await fetch(`${API_BASE}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
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

// ── Suggestion groups ──────────────────────────────────────────────────────
const SUGGESTION_GROUPS = [
    {
        label: "My Info",
        items: [
            "How many leaves do I have?",
            "Show my pending leaves",
            "Attendance last 30 days",
            "Show my latest payslip",
        ],
    },
    {
        label: "Apply & Manage",
        items: [
            "Apply casual leave tomorrow",
            "Upcoming public holidays",
            "What is the leave policy?",
            "When is salary credited?",
        ],
    },
    {
        label: "Manager Tools",
        items: [
            "Who is on leave tomorrow?",
            "Show late employees this week",
            "Team burnout report",
            "Predict who might take leave",
        ],
    },
];

// ── Quick Q&A (instant answers without API) ────────────────────────────────
const QUICK_QA = {
    "what is the notice period": "Notice period is 30 days for employees. For managers, it ranges from 30–90 days based on grade.",
    "notice period": "Notice period is 30 days for employees. For managers, it ranges from 30–90 days based on grade.",
    "can i work from home": "Yes! WFH must be pre-approved by your manager through the official channel before the working day.",
    "wfh policy": "Work From Home is allowed but requires prior manager approval via official channel.",
    "half day": "Half-day leaves are not supported. The minimum leave unit is 1 full working day.",
    "can i take half day": "Half-day leaves are not supported. Minimum leave is 1 full working day.",
    "salary date": "Salary is credited on the last working day of every month to your registered bank account.",
    "when is salary": "Salary is credited on the last working day of every month to your registered bank account.",
    "probation": "Probation period is 3 months for new employees. Leave is limited during this period.",
    "carry over": "Only Paid leave carries over to the next year — maximum 10 days. Sick and Casual leaves do not carry over.",
    "leave carry": "Only Paid leave carries over — maximum 10 days. Sick and Casual leaves lapse at year end.",
    "overtime": "Overtime is not tracked or calculated through this system.",
    "medical certificate": "A medical certificate is required if you take 3 or more consecutive sick leaves.",
    "attendance minimum": "You need a minimum of 70% attendance per month. Falling below triggers an HR review.",
    "late arrival": "You are marked Late if you check in after 9:15 AM. Early departure is before 5:45 PM.",
    "working hours": "Standard working hours are 9:00 AM – 6:00 PM, Monday to Friday.",
};

const getQuickAnswer = (msg) => {
    const lower = msg.toLowerCase().trim();
    for (const [key, val] of Object.entries(QUICK_QA)) {
        if (lower.includes(key)) return val;
    }
    return null;
};

// ── Status badge ───────────────────────────────────────────────────────────
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
};

const Badge = ({ status }) => {
    const s = STATUS_COLORS[status] || STATUS_COLORS.Cancelled;
    return (
        <span style={{
            background: s.bg, color: s.text, border: `1px solid ${s.border}`,
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
        }}>
            {status}
        </span>
    );
};

// ── Risk meter bar ─────────────────────────────────────────────────────────
const RiskBar = ({ score, risk }) => {
    const color = risk === 'High' ? '#EF4444' : risk === 'Medium' ? '#F59E0B' : '#10B981';
    return (
        <div style={{ marginTop: 4 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#6B7280', marginBottom: 2 }}>
                <span>Burnout Risk</span>
                <span style={{ fontWeight: 600, color }}>{score}/100</span>
            </div>
            <div style={{ height: 5, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
            </div>
        </div>
    );
};

// ── Leave Balance ──────────────────────────────────────────────────────────
const LeaveBalanceCard = ({ balance }) => {
    if (!balance) return null;
    const items = [
        { label: "Sick", val: balance.sickRemaining ?? "—" },
        { label: "Casual", val: balance.casualRemaining ?? "—" },
        { label: "Paid", val: balance.paidRemaining ?? "—" },
        { label: "Total", val: balance.remaining ?? "—", highlight: true },
    ];
    return (
        <div style={{ marginTop: 8, background: "#F8F0FF", borderRadius: 10, padding: "10px 12px", border: "1px solid #E9D5FF" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#7C3AED", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Leave Balance {new Date().getFullYear()}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {items.map(i => (
                    <div key={i.label} style={{
                        background: i.highlight ? "#7C3AED" : "#fff",
                        borderRadius: 8, padding: "6px 10px",
                        border: "1px solid " + (i.highlight ? "#7C3AED" : "#E9D5FF"),
                    }}>
                        <p style={{ fontSize: 11, color: i.highlight ? "#EDE9FE" : "#6B7280", margin: 0 }}>{i.label}</p>
                        <p style={{ fontSize: 20, fontWeight: 700, color: i.highlight ? "#fff" : "#111827", margin: 0 }}>{i.val}</p>
                        <p style={{ fontSize: 10, color: i.highlight ? "#DDD6FE" : "#9CA3AF", margin: 0 }}>days left</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Leave List ─────────────────────────────────────────────────────────────
const LeaveListCard = ({ leaves, onAction }) => {
    if (!leaves?.length) return null;
    return (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {leaves.map(l => (
                <div key={l.id} style={{ background: "#fff", borderRadius: 10, padding: "8px 12px", border: "1px solid #E5E7EB", fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: "#111827" }}>{l.leaveType || "Leave"}</span>
                        <Badge status={l.status} />
                    </div>
                    <p style={{ color: "#6B7280", fontSize: 12, margin: "2px 0" }}>
                        {l.startDate} → {l.endDate} · {l.daysRequested} day(s)
                    </p>
                    <p style={{ color: "#9CA3AF", fontSize: 12, margin: 0, fontStyle: "italic" }}>{l.reason}</p>
                    {l.status === "Pending" && (
                        <button
                            onClick={() => onAction(`cancel leave ${l.id}`)}
                            style={{ marginTop: 6, fontSize: 11, color: "#DC2626", background: "none", border: "1px solid #FECACA", borderRadius: 6, padding: "2px 10px", cursor: "pointer" }}>
                            Cancel
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
};

// ── Payslip ────────────────────────────────────────────────────────────────
const PayslipCard = ({ payslip }) => {
    if (!payslip) return null;
    const monthNames = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const rows = [
        { label: "Basic", val: payslip.basic },
        { label: "HRA", val: payslip.hra },
        { label: "Transport", val: payslip.transport },
        { label: "Medical", val: payslip.medical },
        { label: "Bonus", val: payslip.bonus },
        { label: "PF Deduction", val: payslip.pfDeduction && `-${payslip.pfDeduction}`, color: "#DC2626" },
        { label: "TDS", val: payslip.tds && `-${payslip.tds}`, color: "#DC2626" },
    ].filter(r => r.val !== undefined && r.val !== null);

    return (
        <div style={{ marginTop: 8, background: "#F0FDF4", borderRadius: 10, padding: "10px 12px", border: "1px solid #BBF7D0" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#166534", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Payslip — {monthNames[payslip.month]} {payslip.year}
            </p>
            {rows.map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "3px 0", borderBottom: "1px solid #DCFCE7" }}>
                    <span style={{ color: "#374151" }}>{r.label}</span>
                    <span style={{ fontWeight: 500, color: r.color || "#111827" }}>₹{Number(r.val).toLocaleString('en-IN')}</span>
                </div>
            ))}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, padding: "6px 0 0", color: "#166534" }}>
                <span>Net Pay</span>
                <span>₹{Number(payslip.netSalary).toLocaleString('en-IN')}</span>
            </div>
        </div>
    );
};

// ── Attendance ─────────────────────────────────────────────────────────────
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
        <div style={{ marginTop: 8, background: "#EFF6FF", borderRadius: 10, padding: "10px 12px", border: "1px solid #BFDBFE" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#1E40AF", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    Attendance · Last {days} days
                </p>
                <span style={{ fontSize: 14, fontWeight: 700, color: pct >= 70 ? "#16A34A" : "#DC2626" }}>{pct}%</span>
            </div>
            <div style={{ display: "flex", height: 6, borderRadius: 4, overflow: "hidden", marginBottom: 10, background: "#DBEAFE" }}>
                {bars.map(b => (
                    <div key={b.label} style={{ width: `${total > 0 ? (b.val / total) * 100 : 0}%`, background: b.color }} />
                ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                {bars.map(b => (
                    <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: b.color, flexShrink: 0 }} />
                        <span style={{ color: "#374151" }}>{b.label}</span>
                        <span style={{ fontWeight: 600, color: "#111827", marginLeft: "auto" }}>{b.val}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ── Holidays ───────────────────────────────────────────────────────────────
const HolidayCard = ({ holidays }) => {
    if (!holidays?.length) return null;
    return (
        <div style={{ marginTop: 8, background: "#FFF7ED", borderRadius: 10, padding: "10px 12px", border: "1px solid #FED7AA" }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: "#9A3412", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Upcoming Holidays
            </p>
            {holidays.slice(0, 6).map(h => (
                <div key={h.date} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid #FEE2C0" }}>
                    <span style={{ color: "#374151" }}>{h.name}</span>
                    <span style={{ color: "#9A3412", fontWeight: 500 }}>{h.date}</span>
                </div>
            ))}
        </div>
    );
};

// ── Team Leave List ────────────────────────────────────────────────────────
const TeamLeaveCard = ({ leaves, onAction }) => {
    if (!leaves?.length) return null;
    return (
        <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
            {leaves.map(l => (
                <div key={l.id} style={{ background: "#fff", borderRadius: 10, padding: "8px 12px", border: "1px solid #E5E7EB", fontSize: 13 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, color: "#111827" }}>{l.employee?.name || "Employee"}</span>
                        <Badge status={l.status} />
                    </div>
                    <p style={{ color: "#6B7280", fontSize: 12, margin: "2px 0" }}>
                        {l.leaveType} · {l.startDate} → {l.endDate} ({l.daysRequested}d)
                    </p>
                    <p style={{ color: "#9CA3AF", fontSize: 12, margin: "0 0 6px", fontStyle: "italic" }}>{l.reason}</p>
                    {l.status === "Pending" && (
                        <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => onAction(`approve leave ${l.id}`)}
                                style={{ fontSize: 11, color: "#16A34A", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 6, padding: "2px 10px", cursor: "pointer" }}>
                                ✓ Approve
                            </button>
                            <button onClick={() => onAction(`reject leave ${l.id}`)}
                                style={{ fontSize: 11, color: "#DC2626", background: "#FFF1F2", border: "1px solid #FECACA", borderRadius: 6, padding: "2px 10px", cursor: "pointer" }}>
                                ✗ Reject
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

// ── Profile ────────────────────────────────────────────────────────────────
const ProfileCard = ({ profile }) => {
    if (!profile) return null;
    const initials = profile.name?.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase() || "?";
    return (
        <div style={{ marginTop: 8, background: "#fff", borderRadius: 10, padding: "12px", border: "1px solid #E5E7EB" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, color: "#7C3AED" }}>
                    {initials}
                </div>
                <div>
                    <p style={{ fontWeight: 700, fontSize: 15, margin: 0, color: "#111827" }}>{profile.name}</p>
                    <p style={{ fontSize: 12, color: "#6B7280", margin: 0 }}>{profile.designation} · {profile.department}</p>
                </div>
            </div>
            {[
                ["Employee ID", profile.employeeCode],
                ["Email", profile.email],
                ["Joined", profile.joiningDate],
            ].filter(r => r[1]).map(([l, v]) => (
                <div key={l} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0", borderBottom: "1px solid #F3F4F6" }}>
                    <span style={{ color: "#9CA3AF" }}>{l}</span>
                    <span style={{ color: "#374151" }}>{v}</span>
                </div>
            ))}
        </div>
    );
};

// ── NEW: Who's On Leave Tomorrow ───────────────────────────────────────────
const OnLeaveTomorrowCard = ({ leaves, date }) => {
    if (!leaves) return null;
    return (
        <div style={{ marginTop: 8, background: "#F0F9FF", borderRadius: 10, padding: "10px 12px", border: "1px solid #BAE6FD" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Clock size={13} color="#0369A1" />
                <p style={{ fontSize: 11, fontWeight: 600, color: "#0369A1", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    On Leave Tomorrow · {date}
                </p>
            </div>
            {!leaves.length ? (
                <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>✓ Everyone is available tomorrow!</p>
            ) : leaves.map(l => (
                <div key={l.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #E0F2FE", fontSize: 13 }}>
                    <div>
                        <span style={{ fontWeight: 600, color: "#111827" }}>{l.employee?.name || "—"}</span>
                        <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{l.employee?.designation}</span>
                    </div>
                    <Badge status={l.leaveType || "Leave"} />
                </div>
            ))}
        </div>
    );
};

// ── NEW: Late Employees ────────────────────────────────────────────────────
const LateEmployeesCard = ({ employees, days }) => {
    if (!employees) return null;
    return (
        <div style={{ marginTop: 8, background: "#FFFBEB", borderRadius: 10, padding: "10px 12px", border: "1px solid #FDE68A" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Clock size={13} color="#B45309" />
                <p style={{ fontSize: 11, fontWeight: 600, color: "#B45309", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    Late Arrivals · Last {days} days
                </p>
            </div>
            {!employees.length ? (
                <p style={{ fontSize: 13, color: "#374151", margin: 0 }}>✓ No late arrivals recorded!</p>
            ) : employees.map((e, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #FEF3C7", fontSize: 13 }}>
                    <div>
                        <span style={{ fontWeight: 600, color: "#111827" }}>{e.employee?.name || "—"}</span>
                        <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{e.employee?.designation}</span>
                    </div>
                    <span style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FDE68A", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20 }}>
                        {e.count}x late
                    </span>
                </div>
            ))}
        </div>
    );
};

// ── NEW: Burnout Report ────────────────────────────────────────────────────
const BurnoutReportCard = ({ employees, summary }) => {
    const [expanded, setExpanded] = useState(false);
    if (!employees) return null;

    const shown = expanded ? employees : employees.slice(0, 3);

    return (
        <div style={{ marginTop: 8, background: "#FFF5F5", borderRadius: 10, padding: "10px 12px", border: "1px solid #FECACA" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                <Activity size={13} color="#DC2626" />
                <p style={{ fontSize: 11, fontWeight: 600, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    Team Burnout Report
                </p>
            </div>
            {/* Summary row */}
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                {[
                    { label: "High Risk", val: summary.highRisk, color: "#FEE2E2", text: "#991B1B" },
                    { label: "Medium Risk", val: summary.mediumRisk, color: "#FEF3C7", text: "#92400E" },
                    { label: "Total", val: summary.total, color: "#F0FDF4", text: "#065F46" },
                ].map(s => (
                    <div key={s.label} style={{ flex: 1, background: s.color, borderRadius: 8, padding: "5px 8px", textAlign: "center" }}>
                        <p style={{ fontSize: 18, fontWeight: 700, color: s.text, margin: 0 }}>{s.val}</p>
                        <p style={{ fontSize: 10, color: s.text, margin: 0, opacity: 0.8 }}>{s.label}</p>
                    </div>
                ))}
            </div>
            {/* Employee rows */}
            {shown.map((e, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", marginBottom: 6, border: "1px solid #FEE2E2" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div>
                            <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{e.employee?.name}</span>
                            <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{e.employee?.designation}</span>
                        </div>
                        <Badge status={e.risk} />
                    </div>
                    <RiskBar score={e.score} risk={e.risk} />
                    {e.flags.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
                            {e.flags.map((f, j) => (
                                <span key={j} style={{ fontSize: 10, background: "#FEF2F2", color: "#991B1B", border: "1px solid #FECACA", borderRadius: 12, padding: "1px 6px" }}>
                                    {f}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            {employees.length > 3 && (
                <button onClick={() => setExpanded(v => !v)}
                    style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#DC2626", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 2 }}>
                    {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {expanded ? "Show less" : `Show ${employees.length - 3} more`}
                </button>
            )}
        </div>
    );
};

// ── NEW: Leave Predictions ─────────────────────────────────────────────────
const LeavePredictionsCard = ({ employees }) => {
    const [expanded, setExpanded] = useState(false);
    if (!employees) return null;

    const shown = expanded ? employees : employees.slice(0, 3);

    return (
        <div style={{ marginTop: 8, background: "#F5F3FF", borderRadius: 10, padding: "10px 12px", border: "1px solid #DDD6FE" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                <TrendingUp size={13} color="#7C3AED" />
                <p style={{ fontSize: 11, fontWeight: 600, color: "#7C3AED", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                    Leave Predictions (Next 2 Weeks)
                </p>
            </div>
            {shown.map((e, i) => (
                <div key={i} style={{ background: "#fff", borderRadius: 8, padding: "8px 10px", marginBottom: 6, border: "1px solid #EDE9FE" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <div>
                            <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{e.employee?.name}</span>
                            <span style={{ fontSize: 11, color: "#6B7280", marginLeft: 6 }}>{e.employee?.designation}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 11, color: "#9CA3AF" }}>{e.remainingDays}d left</span>
                            <Badge status={e.likelihood} />
                        </div>
                    </div>
                    {/* Prediction bar */}
                    <div style={{ marginTop: 4 }}>
                        <div style={{ height: 5, background: '#E5E7EB', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                                width: `${e.score}%`, height: '100%', borderRadius: 4,
                                background: e.likelihood === 'High' ? '#7C3AED' : e.likelihood === 'Medium' ? '#A78BFA' : '#DDD6FE',
                            }} />
                        </div>
                    </div>
                    {e.reasons.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 5 }}>
                            {e.reasons.map((r, j) => (
                                <span key={j} style={{ fontSize: 10, background: "#EDE9FE", color: "#5B21B6", border: "1px solid #DDD6FE", borderRadius: 12, padding: "1px 6px" }}>
                                    {r}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            ))}
            {employees.length > 3 && (
                <button onClick={() => setExpanded(v => !v)}
                    style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "#7C3AED", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 2 }}>
                    {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    {expanded ? "Show less" : `Show ${employees.length - 3} more`}
                </button>
            )}
        </div>
    );
};

// ── Render data card by type ───────────────────────────────────────────────
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
        default: return null;
    }
};

// ── Timestamp ──────────────────────────────────────────────────────────────
const Timestamp = ({ ts }) => (
    <span style={{ fontSize: 10, opacity: 0.5, marginTop: 2, display: "block" }}>
        {new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
    </span>
);

// ── Bubble ─────────────────────────────────────────────────────────────────
const Bubble = ({ msg, onAction, onRetry }) => {
    const isUser = msg.role === "user";
    return (
        <div className={`flex gap-2 mb-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white mt-0.5
        ${isUser ? "bg-gradient-to-br from-blue-500 to-indigo-600" : "bg-gradient-to-br from-violet-500 to-purple-700"}`}>
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>
            <div style={{ maxWidth: "82%" }}>
                <div className={`px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line rounded-2xl
          ${isUser
                        ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-tr-sm"
                        : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600 shadow-sm rounded-tl-sm"
                    }`}>
                    {msg.content}
                    {msg.isError && onRetry && (
                        <button onClick={() => onRetry(msg.originalMsg)}
                            className="flex items-center gap-1 mt-2 text-xs text-red-400 hover:text-red-600 transition">
                            <RefreshCw className="w-3 h-3" /> Retry
                        </button>
                    )}
                </div>
                {!isUser && msg.data && <DataCard data={msg.data} onAction={onAction} />}
                <Timestamp ts={msg.ts} />
            </div>
        </div>
    );
};

// ── Typing indicator ───────────────────────────────────────────────────────
const Typing = () => (
    <div className="flex gap-2 mb-3">
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
            <div className="flex gap-1 items-center h-4">
                {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
            </div>
        </div>
    </div>
);

// ── Main ───────────────────────────────────────────────────────────────────
const AiChat = () => {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [unread, setUnread] = useState(0);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([{
        id: 0,
        role: "assistant",
        ts: Date.now(),
        content: "Hi! I'm your HR Assistant 👋\n\nI can help you with:\n• Leave balance & applications\n• Payslip & salary details\n• Attendance summary\n• Public holidays\n• Team leaves & approvals\n• 📊 Burnout detection\n• 🔮 Leave predictions\n\nWhat can I do for you?",
        data: null,
    }]);

    const bottomRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
    useEffect(() => { if (open) { setUnread(0); setTimeout(() => inputRef.current?.focus(), 120); } }, [open]);

    const push = (role, content, extra = {}) =>
        setMessages(prev => [...prev, { id: Date.now() + Math.random(), role, content, ts: Date.now(), ...extra }]);

    const handleSend = useCallback(async (text) => {
        const msg = (text ?? input).trim();
        if (!msg || loading) return;
        setInput("");
        push("user", msg);

        // Check quick Q&A first (no API call needed)
        const quickAnswer = getQuickAnswer(msg);
        if (quickAnswer) {
            setTimeout(() => {
                push("assistant", quickAnswer, { data: null });
                if (!open) setUnread(n => n + 1);
            }, 400);
            return;
        }

        setLoading(true);
        try {
            const result = await sendMessage(msg);
            push("assistant", result.reply || "Done!", { data: result.data });
            if (!open) setUnread(n => n + 1);
        } catch (err) {
            push("assistant", err.message || "Something went wrong. Please try again.", {
                isError: true,
                originalMsg: msg,
            });
        } finally {
            setLoading(false);
        }
    }, [input, loading, open]);

    const handleKey = e => {
        if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const handleClear = async () => {
        await clearServerHistory().catch(() => { });
        setMessages([{ id: Date.now(), role: "assistant", ts: Date.now(), content: "Conversation cleared. How can I help you?", data: null }]);
    };

    const showChips = messages.length === 1 && !loading;

    return (
        <>
            {/* Floating button */}
            <button onClick={() => setOpen(o => !o)} aria-label="Open HR Assistant"
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full
          bg-gradient-to-br from-violet-600 to-purple-700 text-white
          shadow-lg hover:shadow-xl hover:scale-105 active:scale-95
          transition-all duration-200 flex items-center justify-center">
                {open ? <X className="w-6 h-6" /> : (
                    <>
                        <MessageCircle className="w-6 h-6" />
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                                {unread}
                            </span>
                        )}
                    </>
                )}
            </button>

            {/* Chat panel */}
            {open && (
                <div className="fixed bottom-24 right-6 z-50 w-[370px] sm:w-[410px] h-[600px]
          flex flex-col rounded-2xl overflow-hidden shadow-2xl
          border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
                    style={{ animation: "aiSlideUp 0.2s ease" }}>

                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-3 flex-shrink-0
            bg-gradient-to-r from-violet-600 to-purple-700 text-white">
                        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">HR Assistant</p>
                            <p className="text-xs text-purple-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                                Online · Powered by AI
                            </p>
                        </div>
                        <button onClick={handleClear} title="Clear conversation"
                            className="p-1.5 rounded-lg hover:bg-white/20 transition">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-4 py-4">
                        {messages.map(m => (
                            <Bubble key={m.id} msg={m} onAction={handleSend} onRetry={handleSend} />
                        ))}
                        {loading && <Typing />}
                        <div ref={bottomRef} />
                    </div>

                    {/* Suggestion chips — welcome screen only */}
                    {showChips && (
                        <div className="px-4 pb-2 flex-shrink-0 max-h-[200px] overflow-y-auto">
                            {SUGGESTION_GROUPS.map(group => (
                                <div key={group.label} className="mb-2">
                                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                                        {group.label}
                                    </p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {group.items.map(s => (
                                            <button key={s} onClick={() => handleSend(s)}
                                                className="text-xs px-3 py-1.5 rounded-full
                          bg-white dark:bg-gray-700
                          border border-gray-200 dark:border-gray-600
                          text-gray-700 dark:text-gray-300
                          hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700
                          dark:hover:bg-violet-900/30 transition">
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="px-3 py-3 flex-shrink-0 bg-white dark:bg-gray-800
            border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-end gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl px-3 py-2">
                            <textarea ref={inputRef} rows={1} value={input} maxLength={500}
                                onChange={e => setInput(e.target.value)}
                                onKeyDown={handleKey}
                                placeholder="Ask about leaves, burnout, predictions..."
                                className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white
                  placeholder-gray-400 resize-none outline-none leading-5 max-h-24"
                                style={{ minHeight: "20px" }}
                            />
                            <button onClick={() => handleSend()} disabled={!input.trim() || loading}
                                className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center
                  bg-gradient-to-br from-violet-600 to-purple-700 text-white
                  disabled:opacity-40 hover:opacity-90 active:scale-95 transition-all">
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-400 text-center mt-1.5">
                            Enter to send · Shift+Enter for new line
                        </p>
                    </div>
                </div>
            )}
        </>
    );
};

export default AiChat;