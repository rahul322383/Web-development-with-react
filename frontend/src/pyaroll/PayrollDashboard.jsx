import { useState, useEffect, useCallback } from "react";
import {
  getMyPayrollHistory,
  getYTDSummary,
  getSalaryBreakdown,
  downloadPayslip,
  processPayroll,
  lockPayroll,
  getMonthlySummary,
} from '../api/payrollApi';


const fmt = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);

const monthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/* ------------------------------------------------------------------ */
/*  TINY PRESENTATIONAL COMPONENTS                                   */
/* ------------------------------------------------------------------ */
const StatusBadge = ({ status }) => {
  const colors = {
    Locked: { bg: "#D1FAE5", color: "#065F46" },
    Processed: { bg: "#DBEAFE", color: "#1E40AF" },
    Pending: { bg: "#FEF3C7", color: "#92400E" },
  };
  const c = colors[status] || colors.Pending;
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        padding: "2px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.03em",
      }}
    >
      {status}
    </span>
  );
};

const Spinner = () => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem",
    }}
  >
    <div
      style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        border: "2.5px solid #E5E7EB",
        borderTopColor: "#1E3A5F",
        animation: "spin 0.7s linear infinite",
      }}
    />
  </div>
);

const Toast = ({ msg, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const bg =
    type === "success" ? "#D1FAE5" : type === "error" ? "#FEE2E2" : "#DBEAFE";
  const color =
    type === "success" ? "#065F46" : type === "error" ? "#991B1B" : "#1E40AF";

  return (
    <div
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        background: bg,
        color,
        padding: "12px 20px",
        borderRadius: 10,
        boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
        fontSize: 13,
        fontWeight: 500,
        maxWidth: 340,
        animation: "fadeIn 0.2s ease",
      }}
    >
      {msg}
    </div>
  );
};

const Modal = ({ title, onClose, children }) => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 1000,
      background: "rgba(0,0,0,0.45)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 16,
    }}
  >
    <div
      style={{
        background: "#fff",
        borderRadius: 14,
        width: "100%",
        maxWidth: 680,
        maxHeight: "90vh",
        overflowY: "auto",
        boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
        animation: "slideUp 0.22s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 24px",
          borderBottom: "1px solid #F0F4F8",
        }}
      >
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#1E3A5F",
            margin: 0,
          }}
        >
          {title}
        </h2>
        <button
          onClick={onClose}
          style={{
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: 20,
            color: "#9CA3AF",
            lineHeight: 1,
            padding: 4,
          }}
        >
          ×
        </button>
      </div>
      <div style={{ padding: 24 }}>{children}</div>
    </div>
  </div>
);

const StatCard = ({ label, value, sub, accent }) => (
  <div
    style={{
      background: "#fff",
      borderRadius: 12,
      border: "1px solid #E8EDF2",
      padding: "18px 20px",
      flex: 1,
      minWidth: 140,
    }}
  >
    <div
      style={{
        fontSize: 11,
        color: "#6B7280",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: 6,
      }}
    >
      {label}
    </div>
    <div
      style={{
        fontSize: 22,
        fontWeight: 700,
        color: accent || "#1E3A5F",
        lineHeight: 1.2,
      }}
    >
      {value}
    </div>
    {sub && (
      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}>{sub}</div>
    )}
  </div>
);

const BreakdownRow = ({ label, value, isTotal, isDeduction }) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "7px 0",
      borderTop: isTotal ? "1.5px solid #E5E7EB" : "none",
      fontWeight: isTotal ? 700 : 400,
      fontSize: isTotal ? 13 : 12,
      color: isDeduction ? "#DC2626" : isTotal ? "#1E3A5F" : "#374151",
    }}
  >
    <span>{label}</span>
    <span>{fmt(value)}</span>
  </div>
);

/* ------------------------------------------------------------------ */
/*  MAIN DASHBOARD COMPONENT                                         */
/* ------------------------------------------------------------------ */
export default function PayrollDashboard() {
  const [activeTab, setActiveTab] = useState("history");
  const [toast, setToast] = useState(null);

  // ---- state for each tab ----
  const [history, setHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [ytd, setYtd] = useState(null);
  const [ytdLoading, setYtdLoading] = useState(false);

  const [breakdown, setBreakdown] = useState(null);
  const [breakdownLoading, setBreakdownLoading] = useState(false);

  const [processMonth, setProcessMonth] = useState(new Date().getMonth() + 1);
  const [processYear, setProcessYear] = useState(new Date().getFullYear());
  const [processLoading, setProcessLoading] = useState(false);

  const [lockId, setLockId] = useState("");
  const [lockLoading, setLockLoading] = useState(false);

  const [summaryMonth, setSummaryMonth] = useState(new Date().getMonth() + 1);
  const [summaryYear, setSummaryYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [downloadingId, setDownloadingId] = useState(null);
  const [breakdownId, setBreakdownId] = useState("");

  const notify = (msg, type = "success") => setToast({ msg, type });

  // ---- data fetchers ----
  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const data = await getMyPayrollHistory(); // returns array
      setHistory(data);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const loadYTD = useCallback(async () => {
    setYtdLoading(true);
    try {
      const ytdData = await getYTDSummary(); // returns mapped object
      setYtd(ytdData);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setYtdLoading(false);
    }
  }, []);

  // Auto-fetch on tab change
  useEffect(() => {
    if (activeTab === "history") loadHistory();
    if (activeTab === "ytd") loadYTD();
  }, [activeTab, loadHistory, loadYTD]);

  // ---- actions ----
  const handleDownloadPayslip = async (id) => {
    setDownloadingId(id);
    try {
      const { blob, filename } = await downloadPayslip(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      notify("Payslip downloaded!");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleGetBreakdown = async () => {
    if (!breakdownId) return notify("Enter a payroll ID", "error");
    setBreakdownLoading(true);
    try {
      const payload = await getSalaryBreakdown(Number(breakdownId));
      setBreakdown(payload);
      notify("Breakdown loaded");
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setBreakdownLoading(false);
    }
  };

  const handleProcessPayroll = async () => {
    setProcessLoading(true);
    try {
      const result = await processPayroll({
        month: processMonth,
        year: processYear,
      });
      notify(
        `Payroll processed for ${result.processedCount || 0} employees!`
      );
      if (activeTab === "history") loadHistory();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setProcessLoading(false);
    }
  };

  const handleLockPayroll = async () => {
    if (!lockId) return notify("Enter a payroll ID", "error");
    setLockLoading(true);
    try {
      await lockPayroll({ payrollId: Number(lockId) });
      notify("Payroll locked successfully!");
      setLockId("");
      if (activeTab === "history") loadHistory();
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLockLoading(false);
    }
  };

  const handleGetSummary = async () => {
    setSummaryLoading(true);
    try {
      const data = await getMonthlySummary(summaryMonth, summaryYear);
      setSummary(data);
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setSummaryLoading(false);
    }
  };

  // ---- UI constants ----
  const tabs = [
    { id: "history", label: "My Payroll" },
    { id: "ytd", label: "YTD Summary" },
    { id: "breakdown", label: "Breakdown" },
    { id: "process", label: "Process" },
    { id: "monthly", label: "Monthly View" },
  ];

  const inputStyle = {
    border: "1px solid #D1D5DB",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    color: "#111827",
    outline: "none",
    background: "#FAFAFA",
    transition: "border 0.15s",
  };
  const btnPrimary = {
    background: "#1E3A5F",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "9px 20px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    letterSpacing: "0.02em",
    transition: "background 0.15s",
  };
  const btnSecondary = {
    background: "#fff",
    color: "#1E3A5F",
    border: "1.5px solid #1E3A5F",
    borderRadius: 8,
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.15s",
  };

  return (
    <div
      style={{
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: "#F7F9FC",
        minHeight: "100vh",
        padding: "0 0 40px",
      }}
    >
      {/* Font & keyframes */}
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeIn { from { opacity:0; transform: translateY(-8px); } to { opacity:1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
      `}</style>

      {toast && (
        <Toast
          msg={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Header */}
      <div
        style={{
          background: "#1E3A5F",
          padding: "20px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div
            style={{
              color: "#93C5FD",
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 3,
            }}
          >
            Human Resources
          </div>
          <h1
            style={{
              color: "#fff",
              fontSize: 20,
              fontWeight: 700,
              margin: 0,
            }}
          >
            Payroll Management
          </h1>
        </div>
        <div style={{ fontSize: 12, color: "#93C5FD" }}>
          {new Date().toLocaleDateString("en-IN", {
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          background: "#fff",
          borderBottom: "1px solid #E8EDF2",
          padding: "0 32px",
          display: "flex",
          gap: 0,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "14px 20px",
              fontSize: 13,
              fontWeight: 500,
              color: activeTab === tab.id ? "#1E3A5F" : "#6B7280",
              borderBottom:
                activeTab === tab.id
                  ? "2.5px solid #1E3A5F"
                  : "2.5px solid transparent",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 24px" }}>
        {/* ─── MY PAYROLL HISTORY ─── */}
        {activeTab === "history" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#111827",
                  margin: 0,
                }}
              >
                Payroll History
              </h2>
              <button onClick={loadHistory} style={btnSecondary}>
                Refresh
              </button>
            </div>
            {historyLoading ? (
              <Spinner />
            ) : !history ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#9CA3AF",
                  padding: "3rem",
                  fontSize: 14,
                }}
              >
                Click refresh to load your payroll history
              </div>
            ) : history.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#9CA3AF",
                  padding: "3rem",
                  fontSize: 14,
                }}
              >
                No payroll records found
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {history.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      border: "1px solid #E8EDF2",
                      padding: "16px 20px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                    }}
                  >
                    <div
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        background: "#EBF4FF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        fontSize: 12,
                        fontWeight: 700,
                        color: "#1E3A5F",
                      }}
                    >
                      {monthNames[(p.month || 1) - 1]}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          color: "#111827",
                        }}
                      >
                        {monthNames[(p.month || 1) - 1]} {p.year}
                      </div>
                      <div
                        style={{ fontSize: 12, color: "#6B7280", marginTop: 2 }}
                      >
                        Payroll ID: #{p.id}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: 16,
                          color: "#1E3A5F",
                        }}
                      >
                        {fmt(p.netSalary)}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <StatusBadge status={p.status} />
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button
                        onClick={() => {
                          setBreakdownId(String(p.id));
                          setActiveTab("breakdown");
                        }}
                        style={{ ...btnSecondary, padding: "6px 12px", fontSize: 12 }}
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleDownloadPayslip(p.id)}
                        disabled={downloadingId === p.id}
                        style={{
                          ...btnPrimary,
                          padding: "6px 12px",
                          fontSize: 12,
                          opacity: downloadingId === p.id ? 0.7 : 1,
                        }}
                      >
                        {downloadingId === p.id ? "…" : "PDF"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── YTD SUMMARY ─── */}
        {activeTab === "ytd" && (
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <h2
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: "#111827",
                  margin: 0,
                }}
              >
                Year-to-Date Summary
              </h2>
              <button onClick={loadYTD} style={btnSecondary}>
                Refresh
              </button>
            </div>
            {ytdLoading ? (
              <Spinner />
            ) : !ytd ? (
              <div
                style={{
                  textAlign: "center",
                  color: "#9CA3AF",
                  padding: "3rem",
                  fontSize: 14,
                }}
              >
                Click refresh to load YTD data
              </div>
            ) : (
              <div>
                <div
                  style={{
                    background: "#1E3A5F",
                    borderRadius: 12,
                    padding: "20px 24px",
                    marginBottom: 20,
                    color: "#fff",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#93C5FD",
                      marginBottom: 4,
                    }}
                  >
                    Year {ytd.year} · {ytd.monthsProcessed} months processed
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700 }}>
                    {fmt(ytd.totalNet)}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: "#93C5FD",
                      marginTop: 4,
                    }}
                  >
                    Total Take-Home
                  </div>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                    gap: 12,
                  }}
                >
                  <StatCard
                    label="Gross Earnings"
                    value={fmt(ytd.totalGross)}
                  />
                  <StatCard
                    label="Total TDS"
                    value={fmt(ytd.totalTDS)}
                    accent="#DC2626"
                  />
                  <StatCard
                    label="Total PF"
                    value={fmt(ytd.totalPF)}
                    accent="#D97706"
                  />
                  <StatCard
                    label="Total Bonus"
                    value={fmt(ytd.totalBonus)}
                    accent="#059669"
                  />
                  <StatCard
                    label="Overtime Pay"
                    value={fmt(ytd.totalOvertimePay)}
                    accent="#7C3AED"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── SALARY BREAKDOWN ─── */}
        {activeTab === "breakdown" && (
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 20,
              }}
            >
              Salary Breakdown
            </h2>
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #E8EDF2",
                padding: 20,
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#6B7280",
                      marginBottom: 6,
                    }}
                  >
                    Payroll ID
                  </label>
                  <input
                    type="number"
                    value={breakdownId}
                    onChange={(e) => setBreakdownId(e.target.value)}
                    placeholder="Enter payroll ID (e.g. 42)"
                    style={{ ...inputStyle, width: "100%" }}
                  />
                </div>
                <button
                  onClick={handleGetBreakdown}
                  disabled={breakdownLoading}
                  style={{
                    ...btnPrimary,
                    opacity: breakdownLoading ? 0.7 : 1,
                  }}
                >
                  {breakdownLoading ? "Loading…" : "Get Breakdown"}
                </button>
              </div>
            </div>
            {breakdown && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: 12,
                  border: "1px solid #E8EDF2",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    background: "#1E3A5F",
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ color: "#93C5FD", fontSize: 12 }}>
                      {breakdown.employee?.firstName}{" "}
                      {breakdown.employee?.lastName} ·{" "}
                      {breakdown.employee?.employeeCode}
                    </div>
                    <div
                      style={{
                        color: "#fff",
                        fontWeight: 600,
                        fontSize: 16,
                        marginTop: 2,
                      }}
                    >
                      {monthNames[(breakdown.month || 1) - 1]} {breakdown.year}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#93C5FD", fontSize: 12 }}>
                      Net Salary
                    </div>
                    <div
                      style={{
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 22,
                      }}
                    >
                      {fmt(breakdown.netSalary)}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    padding: 20,
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 24,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6B7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 12,
                      }}
                    >
                      Earnings
                    </div>
                    {breakdown.items && (
                      <>
                        <BreakdownRow
                          label="Basic Salary"
                          value={breakdown.items.baseSalary}
                        />
                        <BreakdownRow
                          label="HRA"
                          value={breakdown.items.hra}
                        />
                        <BreakdownRow
                          label="Special Allowance"
                          value={breakdown.items.specialAllowance}
                        />
                        {breakdown.items.bonus > 0 && (
                          <BreakdownRow
                            label="Bonus"
                            value={breakdown.items.bonus}
                          />
                        )}
                        {breakdown.items.overtimePay > 0 && (
                          <BreakdownRow
                            label="Overtime Pay"
                            value={breakdown.items.overtimePay}
                          />
                        )}
                        <BreakdownRow
                          label="Gross Earnings"
                          value={breakdown.items.grossEarnings}
                          isTotal
                        />
                      </>
                    )}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "#6B7280",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        marginBottom: 12,
                      }}
                    >
                      Deductions
                    </div>
                    {breakdown.items && (
                      <>
                        <BreakdownRow
                          label="PF (Employee 12%)"
                          value={breakdown.items.pfEmployee}
                          isDeduction
                        />
                        <BreakdownRow
                          label="Professional Tax"
                          value={breakdown.items.professionalTax}
                          isDeduction
                        />
                        <BreakdownRow
                          label="TDS"
                          value={breakdown.items.tds}
                          isDeduction
                        />
                        <BreakdownRow
                          label="Total Deductions"
                          value={
                            breakdown.items.totalDeductions ??
                            breakdown.items.pfEmployee +
                            breakdown.items.professionalTax +
                            breakdown.items.tds
                          }
                          isTotal
                          isDeduction
                        />
                      </>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    background: "#F0F4F8",
                    padding: "12px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#1E3A5F",
                    }}
                  >
                    Take-Home Salary
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: "#1E3A5F",
                    }}
                  >
                    {fmt(breakdown.netSalary)}
                  </div>
                </div>
                <div
                  style={{
                    padding: "10px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ fontSize: 12, color: "#6B7280" }}>
                    Monthly CTC: {fmt(breakdown.items?.ctcMonthly)}
                  </div>
                  <div style={{ fontSize: 12, color: "#6B7280" }}>
                    Annual CTC: {fmt(breakdown.items?.ctcAnnual)}
                  </div>
                </div>
                <div
                  style={{
                    padding: "0 20px 16px",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <button
                    onClick={() => handleDownloadPayslip(breakdown.id)}
                    style={btnPrimary}
                  >
                    Download Payslip PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ─── PROCESS & LOCK ─── */}
        {activeTab === "process" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#111827",
                margin: 0,
              }}
            >
              Admin Actions
            </h2>

            {/* Process Payroll */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #E8EDF2",
                padding: 20,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                Process Payroll
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  marginBottom: 16,
                }}
              >
                Generate payroll for all active employees for the selected
                period.
              </div>
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#6B7280",
                      marginBottom: 6,
                    }}
                  >
                    Month
                  </label>
                  <select
                    value={processMonth}
                    onChange={(e) => setProcessMonth(Number(e.target.value))}
                    style={inputStyle}
                  >
                    {monthNames.map((m, i) => (
                      <option key={i} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#6B7280",
                      marginBottom: 6,
                    }}
                  >
                    Year
                  </label>
                  <input
                    type="number"
                    value={processYear}
                    onChange={(e) => setProcessYear(Number(e.target.value))}
                    min={2020}
                    max={2099}
                    style={{ ...inputStyle, width: 90 }}
                  />
                </div>
                <button
                  onClick={handleProcessPayroll}
                  disabled={processLoading}
                  style={{
                    ...btnPrimary,
                    opacity: processLoading ? 0.7 : 1,
                  }}
                >
                  {processLoading ? "Processing…" : "Process Payroll"}
                </button>
              </div>
            </div>

            {/* Lock Payroll */}
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #E8EDF2",
                padding: 20,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 14,
                  color: "#111827",
                  marginBottom: 4,
                }}
              >
                Lock Payroll Record
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: "#6B7280",
                  marginBottom: 16,
                }}
              >
                Finalize and lock a specific payroll record. This action cannot
                be undone.
              </div>
              <div
                style={{ display: "flex", gap: 12, alignItems: "flex-end" }}
              >
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#6B7280",
                      marginBottom: 6,
                    }}
                  >
                    Payroll ID
                  </label>
                  <input
                    type="number"
                    value={lockId}
                    onChange={(e) => setLockId(e.target.value)}
                    placeholder="Enter payroll ID to lock"
                    style={{ ...inputStyle, width: "100%" }}
                  />
                </div>
                <button
                  onClick={handleLockPayroll}
                  disabled={lockLoading}
                  style={{
                    ...btnPrimary,
                    background: "#7C1E1E",
                    opacity: lockLoading ? 0.7 : 1,
                  }}
                >
                  {lockLoading ? "Locking…" : "Lock Payroll"}
                </button>
              </div>
              <div
                style={{
                  marginTop: 12,
                  background: "#FFF7ED",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 12,
                  color: "#92400E",
                }}
              >
                Warning: Locking a payroll record is permanent and cannot be
                reversed.
              </div>
            </div>
          </div>
        )}

        {/* ─── MONTHLY SUMMARY ─── */}
        {activeTab === "monthly" && (
          <div>
            <h2
              style={{
                fontSize: 16,
                fontWeight: 600,
                color: "#111827",
                marginBottom: 20,
              }}
            >
              Monthly Team Summary
            </h2>
            <div
              style={{
                background: "#fff",
                borderRadius: 12,
                border: "1px solid #E8EDF2",
                padding: 20,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  alignItems: "flex-end",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#6B7280",
                      marginBottom: 6,
                    }}
                  >
                    Month
                  </label>
                  <select
                    value={summaryMonth}
                    onChange={(e) => setSummaryMonth(Number(e.target.value))}
                    style={inputStyle}
                  >
                    {monthNames.map((m, i) => (
                      <option key={i} value={i + 1}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "#6B7280",
                      marginBottom: 6,
                    }}
                  >
                    Year
                  </label>
                  <input
                    type="number"
                    value={summaryYear}
                    onChange={(e) => setSummaryYear(Number(e.target.value))}
                    min={2020}
                    max={2099}
                    style={{ ...inputStyle, width: 90 }}
                  />
                </div>
                <button
                  onClick={handleGetSummary}
                  disabled={summaryLoading}
                  style={{
                    ...btnPrimary,
                    opacity: summaryLoading ? 0.7 : 1,
                  }}
                >
                  {summaryLoading ? "Loading…" : "Load Summary"}
                </button>
              </div>
            </div>

            {summaryLoading ? (
              <Spinner />
            ) : (
              summary && (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(150px, 1fr))",
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    <StatCard
                      label="Employees"
                      value={summary.count}
                      sub={`${monthNames[summary.month - 1]} ${summary.year}`}
                    />
                    <StatCard
                      label="Total Gross"
                      value={fmt(summary.totals?.totalGross)}
                    />
                    <StatCard
                      label="Total Net"
                      value={fmt(summary.totals?.totalNet)}
                      accent="#1E3A5F"
                    />
                    <StatCard
                      label="Total TDS"
                      value={fmt(summary.totals?.totalTDS)}
                      accent="#DC2626"
                    />
                    <StatCard
                      label="Total PF"
                      value={fmt(summary.totals?.totalPF)}
                      accent="#D97706"
                    />
                  </div>
                  <div
                    style={{
                      background: "#fff",
                      borderRadius: 12,
                      border: "1px solid #E8EDF2",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ overflowX: "auto" }}>
                      <table
                        style={{
                          width: "100%",
                          borderCollapse: "collapse",
                          fontSize: 13,
                        }}
                      >
                        <thead>
                          <tr style={{ background: "#F8FAFC" }}>
                            {[
                              "Employee",
                              "Code",
                              "Department",
                              "Gross",
                              "Net Salary",
                              "Status",
                            ].map((h) => (
                              <th
                                key={h}
                                style={{
                                  padding: "10px 16px",
                                  textAlign: "left",
                                  fontWeight: 600,
                                  fontSize: 11,
                                  color: "#6B7280",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                  borderBottom: "1px solid #E8EDF2",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {h}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {(summary.records || []).map((r, i) => (
                            <tr
                              key={r.id}
                              style={{
                                borderBottom: "1px solid #F3F4F6",
                                background:
                                  i % 2 === 0 ? "#fff" : "#FAFAFA",
                              }}
                            >
                              <td
                                style={{
                                  padding: "10px 16px",
                                  fontWeight: 500,
                                  color: "#111827",
                                }}
                              >
                                {r.employee?.firstName}{" "}
                                {r.employee?.lastName}
                              </td>
                              <td
                                style={{
                                  padding: "10px 16px",
                                  color: "#6B7280",
                                  fontFamily: "monospace",
                                  fontSize: 12,
                                }}
                              >
                                {r.employee?.employeeCode || "—"}
                              </td>
                              <td
                                style={{
                                  padding: "10px 16px",
                                  color: "#6B7280",
                                }}
                              >
                                {r.employee?.department || "—"}
                              </td>
                              <td
                                style={{
                                  padding: "10px 16px",
                                  color: "#374151",
                                }}
                              >
                                {fmt(r.items?.grossEarnings)}
                              </td>
                              <td
                                style={{
                                  padding: "10px 16px",
                                  fontWeight: 600,
                                  color: "#1E3A5F",
                                }}
                              >
                                {fmt(r.netSalary)}
                              </td>
                              <td style={{ padding: "10px 16px" }}>
                                <StatusBadge status={r.status} />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
}