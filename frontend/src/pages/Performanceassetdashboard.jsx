import { useState, useEffect, useCallback } from "react";
import api from "./api"; // your existing axios instance

// ─── API LAYER ───────────────────────────────────────────────────────────────

const performanceApi = {
    // KPI
    listKpis: (p) => api.get("/performance/kpis", { params: p }),
    createKpi: (d) => api.post("/performance/kpis", d),
    updateKpi: (id, d) => api.patch(`/performance/kpis/${id}`, d),
    deleteKpi: (id) => api.delete(`/performance/kpis/${id}`),

    // Review Cycles
    listCycles: (p) => api.get("/performance/cycles", { params: p }),
    createCycle: (d) => api.post("/performance/cycles", d),
    updateCycle: (id, d) => api.patch(`/performance/cycles/${id}`, d),

    // Reviews
    listReviews: (p) => api.get("/performance/reviews", { params: p }),
    initiateReview: (d) => api.post("/performance/reviews", d),
    getReview: (id) => api.get(`/performance/reviews/${id}`),
    acknowledgeReview: (id) => api.patch(`/performance/reviews/${id}/acknowledge`),

    // Self Appraisal
    submitSelfAppraisal: (reviewId, d) => api.post(`/performance/reviews/${reviewId}/self-appraisal`, d),
    getSelfAppraisal: (reviewId) => api.get(`/performance/reviews/${reviewId}/self-appraisal`),

    // Manager Feedback
    submitManagerFeedback: (reviewId, d) => api.post(`/performance/reviews/${reviewId}/manager-feedback`, d),

    // Peer Review
    submitPeerReview: (d) => api.post("/performance/peer-reviews", d),
    listPeerReviews: (p) => api.get("/performance/peer-reviews", { params: p }),

    // Goals
    listGoals: (p) => api.get("/performance/goals", { params: p }),
    createGoal: (d) => api.post("/performance/goals", d),
    updateGoal: (id, d) => api.patch(`/performance/goals/${id}`, d),
    deleteGoal: (id) => api.delete(`/performance/goals/${id}`),

    // Promotions
    listPromotions: (p) => api.get("/performance/promotions", { params: p }),
    recommendPromotion: (d) => api.post("/performance/promotions", d),
    updatePromotionStatus: (id, d) => api.patch(`/performance/promotions/${id}/status`, d),
};

const assetApi = {
    listAssets: (p) => api.get("/assets", { params: p }),
    createAsset: (d) => api.post("/assets", d),
    updateAsset: (id, d) => api.patch(`/assets/${id}`, d),
    deleteAsset: (id) => api.delete(`/assets/${id}`),

    listAssignments: (p) => api.get("/assets/assignments", { params: p }),
    assignAsset: (d) => api.post("/assets/assignments", d),
    returnAsset: (assignmentId, d) => api.patch(`/assets/assignments/${assignmentId}/return`, d),
    getMyAssets: () => api.get("/assets/mine"),

    listDamageReports: (p) => api.get("/assets/damage-reports", { params: p }),
    fileDamageReport: (d) => api.post("/assets/damage-reports", d),
    updateDamageReport: (id, d) => api.patch(`/assets/damage-reports/${id}`, d),
};

// ─── SHARED COMPONENTS ───────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
    const map = {
        active: ["#e8f5e9", "#2e7d32"], draft: ["#f5f5f5", "#616161"],
        achieved: ["#e3f2fd", "#1565c0"], missed: ["#fce4ec", "#c62828"],
        completed: ["#e3f2fd", "#1565c0"], pending: ["#fff8e1", "#f57f17"],
        approved: ["#e8f5e9", "#2e7d32"], rejected: ["#fce4ec", "#c62828"],
        available: ["#e8f5e9", "#2e7d32"], assigned: ["#e3f2fd", "#1565c0"],
        under_repair: ["#fff8e1", "#f57f17"], returned: ["#f5f5f5", "#616161"],
        reported: ["#fff8e1", "#f57f17"], resolved: ["#e8f5e9", "#2e7d32"],
        recommended: ["#e3f2fd", "#1565c0"], on_hold: ["#fff8e1", "#f57f17"],
        self_submitted: ["#f3e5f5", "#6a1b9a"], manager_submitted: ["#e8f0fe", "#1a56db"],
        acknowledged: ["#e8f5e9", "#2e7d32"],
    };
    const [bg, color] = map[status] || ["#f5f5f5", "#616161"];
    return (
        <span style={{
            background: bg, color, fontSize: 11, fontWeight: 600,
            padding: "3px 10px", borderRadius: 20, letterSpacing: "0.03em",
            textTransform: "uppercase", whiteSpace: "nowrap",
        }}>
            {status?.replace(/_/g, " ")}
        </span>
    );
};

const Modal = ({ title, onClose, children }) => (
    <div style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
        <div style={{
            background: "var(--color-background-primary)", borderRadius: 16,
            padding: "28px 32px", width: 520, maxWidth: "92vw", maxHeight: "88vh",
            overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
        }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "var(--color-text-primary)" }}>{title}</h3>
                <button onClick={onClose} style={{
                    border: "none", background: "none", fontSize: 22, cursor: "pointer",
                    color: "var(--color-text-secondary)", lineHeight: 1,
                }}>×</button>
            </div>
            {children}
        </div>
    </div>
);

const Field = ({ label, children }) => (
    <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--color-text-secondary)", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
        {children}
    </div>
);

const Input = (props) => (
    <input style={{
        width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--color-border-secondary)",
        fontSize: 14, background: "var(--color-background-primary)", color: "var(--color-text-primary)",
        boxSizing: "border-box", outline: "none",
    }} {...props} />
);

const Select = ({ children, ...props }) => (
    <select style={{
        width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--color-border-secondary)",
        fontSize: 14, background: "var(--color-background-primary)", color: "var(--color-text-primary)",
        boxSizing: "border-box", outline: "none",
    }} {...props}>{children}</select>
);

const Textarea = (props) => (
    <textarea style={{
        width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid var(--color-border-secondary)",
        fontSize: 14, background: "var(--color-background-primary)", color: "var(--color-text-primary)",
        boxSizing: "border-box", resize: "vertical", minHeight: 80, outline: "none", fontFamily: "inherit",
    }} {...props} />
);

const Btn = ({
    children,
    variant = "primary",
    onClick,
    style = {},
    disabled
}) => {
    const styles = {
        primary: {
            background: "#1a56db",
            color: "#fff",
            border: "none",
        },
        secondary: {
            background: "transparent",
            color: "var(--color-text-primary)",
            border: "1px solid var(--color-border-secondary)",
        },
        danger: {
            background: "#dc2626",
            color: "#fff",
            border: "none",
        },
        success: {
            background: "#16a34a",
            color: "#fff",
            border: "none",
        },
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            style={{
                padding: "9px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: disabled ? "not-allowed" : "pointer",
                opacity: disabled ? 0.6 : 1,
                ...styles[variant],
                ...style,
            }}
        >
            {children}
        </button>
    );
};

const Card = ({ children, style = {} }) => (
    <div style={{
        background: "var(--color-background-primary)", border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 12, padding: "18px 20px", ...style,
    }}>{children}</div>
);

const EmptyState = ({ icon, message }) => (
    <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--color-text-secondary)" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{icon}</div>
        <p style={{ margin: 0, fontSize: 14 }}>{message}</p>
    </div>
);

const toast = (msg, type = "success") => {
    const el = document.createElement("div");
    el.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:500;color:#fff;background:${type === "success" ? "#16a34a" : "#dc2626"};box-shadow:0 4px 12px rgba(0,0,0,0.2);transition:opacity 0.3s;`;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => { el.style.opacity = 0; setTimeout(() => el.remove(), 300); }, 2800);
};

// ─── KPI SECTION ─────────────────────────────────────────────────────────────

const KpiSection = () => {
    const [kpis, setKpis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: "", type: "KPI", targetValue: "", unit: "", status: "draft", quarter: "", year: new Date().getFullYear(), description: "" });

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const res = await performanceApi.listKpis();
            setKpis(res.data?.data?.kpis || []);
        } catch { toast("Failed to load KPIs", "error"); }
        finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async () => {
        try {
            await performanceApi.createKpi({ ...form, targetValue: Number(form.targetValue), year: Number(form.year) });
            toast("KPI created!"); setShowForm(false);
            setForm({ title: "", type: "KPI", targetValue: "", unit: "", status: "draft", quarter: "", year: new Date().getFullYear(), description: "" });
            load();
        } catch { toast("Failed to create KPI", "error"); }
    };

    const handleDelete = async (id) => {
        if (!confirm("Delete this KPI?")) return;
        try { await performanceApi.deleteKpi(id); toast("Deleted"); load(); }
        catch { toast("Failed to delete", "error"); }
    };

    const updateStatus = async (id, status) => {
        try { await performanceApi.updateKpi(id, { status }); load(); }
        catch { toast("Failed to update", "error"); }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>KPI / OKR Tracking</h3>
                <Btn onClick={() => setShowForm(true)}>+ Add KPI</Btn>
            </div>

            {loading ? <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Loading…</p> :
                kpis.length === 0 ? <EmptyState icon="🎯" message="No KPIs yet. Add your first one." /> :
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
                        {kpis.map(k => (
                            <Card key={k.id}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                                    <div>
                                        <span style={{ fontSize: 10, fontWeight: 700, color: "#1a56db", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k.type}</span>
                                        <p style={{ margin: "4px 0 0", fontWeight: 600, fontSize: 14, color: "var(--color-text-primary)" }}>{k.title}</p>
                                    </div>
                                    <StatusBadge status={k.status} />
                                </div>
                                <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                                    {k.targetValue && <div><p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)" }}>Target</p><p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{k.targetValue}{k.unit ? ` ${k.unit}` : ""}</p></div>}
                                    {k.actualValue !== undefined && <div><p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)" }}>Actual</p><p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{k.actualValue}{k.unit ? ` ${k.unit}` : ""}</p></div>}
                                    {k.quarter && <div><p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)" }}>Period</p><p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{k.quarter}</p></div>}
                                </div>
                                {k.targetValue > 0 && (
                                    <div style={{ marginBottom: 12 }}>
                                        <div style={{ height: 6, background: "var(--color-background-secondary)", borderRadius: 3, overflow: "hidden" }}>
                                            <div style={{ height: "100%", width: `${Math.min(100, ((k.actualValue || 0) / k.targetValue) * 100).toFixed(0)}%`, background: "#1a56db", borderRadius: 3, transition: "width 0.4s" }} />
                                        </div>
                                        <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--color-text-secondary)" }}>{Math.min(100, ((k.actualValue || 0) / k.targetValue) * 100).toFixed(0)}% achieved</p>
                                    </div>
                                )}
                                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                    {k.status === "draft" && <Btn variant="secondary" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => updateStatus(k.id, "active")}>Activate</Btn>}
                                    {k.status === "active" && <Btn variant="success" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => updateStatus(k.id, "achieved")}>Mark Achieved</Btn>}
                                    <Btn variant="danger" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => handleDelete(k.id)}>Delete</Btn>
                                </div>
                            </Card>
                        ))}
                    </div>
            }

            {showForm && (
                <Modal title="Create KPI / OKR" onClose={() => setShowForm(false)}>
                    <Field label="Title"><Input placeholder="e.g. Increase MRR by 20%" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Type"><Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="KPI">KPI</option><option value="OKR">OKR</option></Select></Field>
                        <Field label="Status"><Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="active">Active</option></Select></Field>
                        <Field label="Target Value"><Input type="number" placeholder="100" value={form.targetValue} onChange={e => setForm({ ...form, targetValue: e.target.value })} /></Field>
                        <Field label="Unit"><Input placeholder="%, $, count" value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></Field>
                        <Field label="Quarter"><Input placeholder="Q1-2025" value={form.quarter} onChange={e => setForm({ ...form, quarter: e.target.value })} /></Field>
                        <Field label="Year"><Input type="number" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} /></Field>
                    </div>
                    <Field label="Description"><Textarea placeholder="Describe this KPI…" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                        <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
                        <Btn onClick={handleCreate} disabled={!form.title}>Create KPI</Btn>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// ─── REVIEW CYCLES ───────────────────────────────────────────────────────────

const ReviewCyclesSection = () => {
    const [cycles, setCycles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: "", type: "annual", startDate: "", endDate: "", selfReviewDeadline: "", managerReviewDeadline: "", isSelfReviewEnabled: true, isManagerReviewEnabled: true, isPeerReviewEnabled: false });

    const load = useCallback(async () => {
        try { setLoading(true); const r = await performanceApi.listCycles(); setCycles(r.data?.data?.cycles || []); }
        catch { toast("Failed to load cycles", "error"); } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async () => {
        try { await performanceApi.createCycle(form); toast("Review cycle created!"); setShowForm(false); load(); }
        catch { toast("Failed to create cycle", "error"); }
    };

    const updateStatus = async (id, status) => {
        try { await performanceApi.updateCycle(id, { status }); load(); }
        catch { toast("Failed to update", "error"); }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Performance Review Cycles</h3>
                <Btn onClick={() => setShowForm(true)}>+ New Cycle</Btn>
            </div>

            {loading ? <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Loading…</p> :
                cycles.length === 0 ? <EmptyState icon="📋" message="No review cycles yet." /> :
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {cycles.map(c => (
                            <Card key={c.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{c.name}</p>
                                    <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-text-secondary)" }}>
                                        {c.type} · {c.startDate} → {c.endDate}
                                        {c.isPeerReviewEnabled ? " · 360° enabled" : ""}
                                    </p>
                                </div>
                                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                    <StatusBadge status={c.status} />
                                    {c.status === "draft" && <Btn variant="secondary" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => updateStatus(c.id, "active")}>Activate</Btn>}
                                    {c.status === "active" && <Btn variant="secondary" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => updateStatus(c.id, "closed")}>Close</Btn>}
                                </div>
                            </Card>
                        ))}
                    </div>
            }

            {showForm && (
                <Modal title="Create Review Cycle" onClose={() => setShowForm(false)}>
                    <Field label="Cycle Name"><Input placeholder="e.g. Q1 2025 Review" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Type"><Select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="quarterly">Quarterly</option><option value="half_yearly">Half Yearly</option><option value="annual">Annual</option><option value="probation">Probation</option><option value="custom">Custom</option></Select></Field>
                        <div />
                        <Field label="Start Date"><Input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} /></Field>
                        <Field label="End Date"><Input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} /></Field>
                        <Field label="Self Review Deadline"><Input type="date" value={form.selfReviewDeadline} onChange={e => setForm({ ...form, selfReviewDeadline: e.target.value })} /></Field>
                        <Field label="Manager Deadline"><Input type="date" value={form.managerReviewDeadline} onChange={e => setForm({ ...form, managerReviewDeadline: e.target.value })} /></Field>
                    </div>
                    <div style={{ display: "flex", gap: 20, margin: "8px 0 16px" }}>
                        {[["isSelfReviewEnabled", "Self Review"], ["isManagerReviewEnabled", "Manager Review"], ["isPeerReviewEnabled", "360° Peer Review"]].map(([key, label]) => (
                            <label key={key} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                                <input type="checkbox" checked={form[key]} onChange={e => setForm({ ...form, [key]: e.target.checked })} />
                                {label}
                            </label>
                        ))}
                    </div>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
                        <Btn onClick={handleCreate} disabled={!form.name || !form.startDate || !form.endDate}>Create</Btn>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// ─── REVIEWS (Self + Manager + 360°) ─────────────────────────────────────────

const ReviewsSection = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [selfForm, setSelfForm] = useState({ selfRating: "", achievements: "", challenges: "", goalsForNextPeriod: "", isDraft: false });
    const [mgrForm, setMgrForm] = useState({ rating: "", performanceSummary: "", strengths: "", areasOfImprovement: "", promotionRecommended: false, isDraft: false });
    const [activeTab, setActiveTab] = useState("self");

    const load = useCallback(async () => {
        try { setLoading(true); const r = await performanceApi.listReviews(); setReviews(r.data?.data?.reviews || []); }
        catch { toast("Failed to load reviews", "error"); } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const submitSelf = async () => {
        try {
            await performanceApi.submitSelfAppraisal(selected.id, { ...selfForm, selfRating: Number(selfForm.selfRating) });
            toast("Self appraisal submitted!"); setSelected(null); load();
        } catch { toast("Failed", "error"); }
    };

    const submitMgr = async () => {
        try {
            await performanceApi.submitManagerFeedback(selected.id, { ...mgrForm, rating: Number(mgrForm.rating) });
            toast("Manager feedback submitted!"); setSelected(null); load();
        } catch { toast("Failed", "error"); }
    };

    const acknowledge = async (id) => {
        try { await performanceApi.acknowledgeReview(id); toast("Review acknowledged!"); load(); }
        catch { toast("Failed", "error"); }
    };

    return (
        <div>
            <div style={{ marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Performance Reviews</h3>
            </div>
            {loading ? <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Loading…</p> :
                reviews.length === 0 ? <EmptyState icon="📝" message="No reviews in the current cycle." /> :
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {reviews.map(r => (
                            <Card key={r.id}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                                            {r.employee?.firstName} {r.employee?.lastName}
                                        </p>
                                        <p style={{ margin: "3px 0 0", fontSize: 12, color: "var(--color-text-secondary)" }}>
                                            {r.cycle?.name} · Self: <StatusBadge status={r.selfReviewStatus} /> · Manager: <StatusBadge status={r.managerReviewStatus} />
                                        </p>
                                    </div>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        {r.overallRating && <span style={{ fontWeight: 700, fontSize: 16, color: "#1a56db" }}>★ {r.overallRating}</span>}
                                        <StatusBadge status={r.status} />
                                        <Btn variant="secondary" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => { setSelected(r); setActiveTab("self"); }}>Open</Btn>
                                        {r.status === "manager_submitted" && <Btn variant="success" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => acknowledge(r.id)}>Acknowledge</Btn>}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
            }

            {selected && (
                <Modal title={`Review — ${selected.employee?.firstName} ${selected.employee?.lastName}`} onClose={() => setSelected(null)}>
                    <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--color-border-tertiary)", marginBottom: 20 }}>
                        {["self", "manager"].map(tab => (
                            <button key={tab} onClick={() => setActiveTab(tab)} style={{
                                padding: "9px 18px", border: "none", background: "none", cursor: "pointer",
                                fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
                                color: activeTab === tab ? "#1a56db" : "var(--color-text-secondary)",
                                borderBottom: activeTab === tab ? "2px solid #1a56db" : "2px solid transparent",
                            }}>{tab === "self" ? "Self Appraisal" : "Manager Feedback"}</button>
                        ))}
                    </div>

                    {activeTab === "self" && (
                        <>
                            <Field label="Self Rating (1–5)"><Input type="number" min={1} max={5} step={0.5} value={selfForm.selfRating} onChange={e => setSelfForm({ ...selfForm, selfRating: e.target.value })} /></Field>
                            <Field label="Achievements"><Textarea value={selfForm.achievements} onChange={e => setSelfForm({ ...selfForm, achievements: e.target.value })} /></Field>
                            <Field label="Challenges"><Textarea value={selfForm.challenges} onChange={e => setSelfForm({ ...selfForm, challenges: e.target.value })} /></Field>
                            <Field label="Goals for Next Period"><Textarea value={selfForm.goalsForNextPeriod} onChange={e => setSelfForm({ ...selfForm, goalsForNextPeriod: e.target.value })} /></Field>
                            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                                <Btn variant="secondary" onClick={() => performanceApi.submitSelfAppraisal(selected.id, { ...selfForm, isDraft: true }).then(() => { toast("Saved as draft"); setSelected(null); load(); })}>Save Draft</Btn>
                                <Btn onClick={submitSelf}>Submit Appraisal</Btn>
                            </div>
                        </>
                    )}

                    {activeTab === "manager" && (
                        <>
                            <Field label="Overall Rating (1–5)"><Input type="number" min={1} max={5} step={0.5} value={mgrForm.rating} onChange={e => setMgrForm({ ...mgrForm, rating: e.target.value })} /></Field>
                            <Field label="Performance Summary"><Textarea value={mgrForm.performanceSummary} onChange={e => setMgrForm({ ...mgrForm, performanceSummary: e.target.value })} /></Field>
                            <Field label="Strengths"><Textarea value={mgrForm.strengths} onChange={e => setMgrForm({ ...mgrForm, strengths: e.target.value })} /></Field>
                            <Field label="Areas of Improvement"><Textarea value={mgrForm.areasOfImprovement} onChange={e => setMgrForm({ ...mgrForm, areasOfImprovement: e.target.value })} /></Field>
                            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, marginBottom: 16, cursor: "pointer" }}>
                                <input type="checkbox" checked={mgrForm.promotionRecommended} onChange={e => setMgrForm({ ...mgrForm, promotionRecommended: e.target.checked })} />
                                Recommend for promotion
                            </label>
                            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                                <Btn variant="secondary" onClick={() => setSelected(null)}>Cancel</Btn>
                                <Btn onClick={submitMgr}>Submit Feedback</Btn>
                            </div>
                        </>
                    )}
                </Modal>
            )}
        </div>
    );
};

// ─── GOALS SECTION ───────────────────────────────────────────────────────────

const GoalsSection = () => {
    const [goals, setGoals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: "", description: "", category: "individual", priority: "medium", status: "draft", dueDate: "" });

    const load = useCallback(async () => {
        try { setLoading(true); const r = await performanceApi.listGoals(); setGoals(r.data?.data?.goals || []); }
        catch { toast("Failed to load goals", "error"); } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async () => {
        try { await performanceApi.createGoal(form); toast("Goal created!"); setShowForm(false); load(); }
        catch { toast("Failed", "error"); }
    };

    const updateProgress = async (id, progressPercent) => {
        try { await performanceApi.updateGoal(id, { progressPercent: Number(progressPercent) }); load(); }
        catch { toast("Failed", "error"); }
    };

    const deleteGoal = async (id) => {
        if (!confirm("Delete this goal?")) return;
        try { await performanceApi.deleteGoal(id); toast("Deleted"); load(); }
        catch { toast("Failed", "error"); }
    };

    const priorityColors = { low: "#16a34a", medium: "#d97706", high: "#dc2626", critical: "#7c3aed" };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Goal Management</h3>
                <Btn onClick={() => setShowForm(true)}>+ Add Goal</Btn>
            </div>

            {loading ? <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Loading…</p> :
                goals.length === 0 ? <EmptyState icon="🚀" message="No goals set yet." /> :
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 14 }}>
                        {goals.map(g => (
                            <Card key={g.id}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                                    <span style={{ fontSize: 11, fontWeight: 700, color: priorityColors[g.priority] || "#666", textTransform: "uppercase", letterSpacing: "0.05em" }}>{g.priority} priority</span>
                                    <StatusBadge status={g.status} />
                                </div>
                                <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 14 }}>{g.title}</p>
                                <p style={{ margin: "0 0 12px", fontSize: 12, color: "var(--color-text-secondary)" }}>{g.category} · Due {g.dueDate || "—"}</p>
                                <div style={{ marginBottom: 10 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                                        <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Progress</span>
                                        <span style={{ fontSize: 12, fontWeight: 600 }}>{g.progressPercent || 0}%</span>
                                    </div>
                                    <input type="range" min={0} max={100} step={5} value={g.progressPercent || 0}
                                        onChange={e => updateProgress(g.id, e.target.value)}
                                        style={{ width: "100%", accentColor: "#1a56db" }} />
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                    {g.progressPercent >= 100 && g.status !== "completed" &&
                                        <Btn variant="success" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => performanceApi.updateGoal(g.id, { status: "completed" }).then(load)}>Mark Complete</Btn>}
                                    <Btn variant="danger" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => deleteGoal(g.id)}>Delete</Btn>
                                </div>
                            </Card>
                        ))}
                    </div>
            }

            {showForm && (
                <Modal title="Add Goal" onClose={() => setShowForm(false)}>
                    <Field label="Title"><Input placeholder="What do you want to achieve?" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Category"><Select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}><option value="individual">Individual</option><option value="team">Team</option><option value="company">Company</option><option value="learning">Learning</option></Select></Field>
                        <Field label="Priority"><Select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></Select></Field>
                        <Field label="Due Date"><Input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} /></Field>
                        <Field label="Status"><Select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}><option value="draft">Draft</option><option value="active">Active</option></Select></Field>
                    </div>
                    <Field label="Description"><Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></Field>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
                        <Btn onClick={handleCreate} disabled={!form.title}>Create Goal</Btn>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// ─── PROMOTIONS SECTION ───────────────────────────────────────────────────────

const PromotionsSection = () => {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ employeeId: "", proposedDesignation: "", currentDesignation: "", justification: "", effectiveDate: "" });

    const load = useCallback(async () => {
        try { setLoading(true); const r = await performanceApi.listPromotions(); setPromotions(r.data?.data?.promotions || []); }
        catch { toast("Failed to load promotions", "error"); } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const handleCreate = async () => {
        try { await performanceApi.recommendPromotion({ ...form, employeeId: Number(form.employeeId) }); toast("Promotion recommended!"); setShowForm(false); load(); }
        catch { toast("Failed", "error"); }
    };

    const updateStatus = async (id, status) => {
        try { await performanceApi.updatePromotionStatus(id, { status }); toast(`Promotion ${status}`); load(); }
        catch { toast("Failed", "error"); }
    };

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Promotion Tracking</h3>
                <Btn onClick={() => setShowForm(true)}>+ Recommend Promotion</Btn>
            </div>

            {loading ? <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Loading…</p> :
                promotions.length === 0 ? <EmptyState icon="🏆" message="No promotion records yet." /> :
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {promotions.map(p => (
                            <Card key={p.id}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{p.employee?.firstName} {p.employee?.lastName}</p>
                                        <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-text-secondary)" }}>
                                            {p.currentDesignation} → <strong>{p.proposedDesignation}</strong>
                                            {p.effectiveDate ? ` · Effective ${p.effectiveDate}` : ""}
                                        </p>
                                        {p.justification && <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-text-secondary)" }}>{p.justification}</p>}
                                    </div>
                                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                        <StatusBadge status={p.status} />
                                        {p.status === "recommended" && (
                                            <>
                                                <Btn variant="success" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => updateStatus(p.id, "approved")}>Approve</Btn>
                                                <Btn variant="danger" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => updateStatus(p.id, "rejected")}>Reject</Btn>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
            }

            {showForm && (
                <Modal title="Recommend Promotion" onClose={() => setShowForm(false)}>
                    <Field label="Employee ID"><Input type="number" placeholder="Employee ID" value={form.employeeId} onChange={e => setForm({ ...form, employeeId: e.target.value })} /></Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Current Designation"><Input placeholder="Software Engineer" value={form.currentDesignation} onChange={e => setForm({ ...form, currentDesignation: e.target.value })} /></Field>
                        <Field label="Proposed Designation"><Input placeholder="Senior Engineer" value={form.proposedDesignation} onChange={e => setForm({ ...form, proposedDesignation: e.target.value })} /></Field>
                        <Field label="Effective Date"><Input type="date" value={form.effectiveDate} onChange={e => setForm({ ...form, effectiveDate: e.target.value })} /></Field>
                    </div>
                    <Field label="Justification"><Textarea placeholder="Why does this employee deserve a promotion?" value={form.justification} onChange={e => setForm({ ...form, justification: e.target.value })} /></Field>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <Btn variant="secondary" onClick={() => setShowForm(false)}>Cancel</Btn>
                        <Btn onClick={handleCreate} disabled={!form.employeeId || !form.proposedDesignation}>Submit</Btn>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// ─── ASSETS SECTION ───────────────────────────────────────────────────────────

const AssetsSection = () => {
    const [assets, setAssets] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [damages, setDamages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState("inventory");
    const [showAssetForm, setShowAssetForm] = useState(false);
    const [showAssignForm, setShowAssignForm] = useState(false);
    const [showDamageForm, setShowDamageForm] = useState(false);
    const [assetForm, setAssetForm] = useState({ name: "", type: "laptop", brand: "", model: "", serialNumber: "", purchaseDate: "", purchasePrice: "", condition: "good" });
    const [assignForm, setAssignForm] = useState({ assetId: "", employeeId: "", expectedReturnDate: "", assignmentNotes: "" });
    const [damageForm, setDamageForm] = useState({ assignmentId: "", severity: "minor", description: "", incidentDate: "" });
    const [returnModal, setReturnModal] = useState(null);
    const [returnForm, setReturnForm] = useState({ conditionAtReturn: "good", returnNotes: "" });

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [a, asgn, d] = await Promise.all([assetApi.listAssets(), assetApi.listAssignments(), assetApi.listDamageReports()]);
            setAssets(a.data?.data?.assets || []);
            setAssignments(asgn.data?.data?.assignments || []);
            setDamages(d.data?.data?.reports || []);
        } catch { toast("Failed to load assets", "error"); } finally { setLoading(false); }
    }, []);

    useEffect(() => { load(); }, [load]);

    const createAsset = async () => {
        try { await assetApi.createAsset({ ...assetForm, purchasePrice: Number(assetForm.purchasePrice) || undefined }); toast("Asset created!"); setShowAssetForm(false); load(); }
        catch { toast("Failed to create asset", "error"); }
    };

    const assignAsset = async () => {
        try { await assetApi.assignAsset({ ...assignForm, assetId: Number(assignForm.assetId), employeeId: Number(assignForm.employeeId) }); toast("Asset assigned!"); setShowAssignForm(false); load(); }
        catch { toast("Failed to assign", "error"); }
    };

    const returnAsset = async () => {
        try { await assetApi.returnAsset(returnModal, returnForm); toast("Asset returned!"); setReturnModal(null); load(); }
        catch { toast("Failed to return", "error"); }
    };

    const fileDamage = async () => {
        try { await assetApi.fileDamageReport({ ...damageForm, assignmentId: Number(damageForm.assignmentId) }); toast("Damage report filed!"); setShowDamageForm(false); load(); }
        catch { toast("Failed", "error"); }
    };

    const typeIcon = { laptop: "💻", mobile: "📱", sim: "📡", tablet: "📲", monitor: "🖥️", keyboard: "⌨️", mouse: "🖱️", headset: "🎧", other: "📦" };

    const tabs = [
        { key: "inventory", label: "Inventory" },
        { key: "assignments", label: "Assignments" },
        { key: "damage", label: "Damage Reports" },
    ];

    return (
        <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Asset Management</h3>
                <div style={{ display: "flex", gap: 8 }}>
                    {tab === "inventory" && <Btn onClick={() => setShowAssetForm(true)}>+ Add Asset</Btn>}
                    {tab === "assignments" && <Btn onClick={() => setShowAssignForm(true)}>+ Assign Asset</Btn>}
                    {tab === "damage" && <Btn onClick={() => setShowDamageForm(true)}>+ File Report</Btn>}
                </div>
            </div>

            <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--color-border-tertiary)", marginBottom: 20 }}>
                {tabs.map(t => (
                    <button key={t.key} onClick={() => setTab(t.key)} style={{
                        padding: "9px 18px", border: "none", background: "none", cursor: "pointer",
                        fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
                        color: tab === t.key ? "#1a56db" : "var(--color-text-secondary)",
                        borderBottom: tab === t.key ? "2px solid #1a56db" : "2px solid transparent",
                    }}>{t.label}</button>
                ))}
            </div>

            {loading ? <p style={{ color: "var(--color-text-secondary)", fontSize: 14 }}>Loading…</p> : (
                <>
                    {tab === "inventory" && (
                        assets.length === 0 ? <EmptyState icon="💼" message="No assets in inventory." /> :
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 14 }}>
                                {assets.map(a => (
                                    <Card key={a.id}>
                                        <div style={{ fontSize: 28, marginBottom: 8 }}>{typeIcon[a.type] || "📦"}</div>
                                        <p style={{ margin: "0 0 2px", fontWeight: 600, fontSize: 14 }}>{a.name}</p>
                                        <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--color-text-secondary)" }}>{a.assetCode} · {a.brand} {a.model}</p>
                                        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                                            <StatusBadge status={a.status} />
                                            <span style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{a.condition}</span>
                                        </div>
                                        {a.serialNumber && <p style={{ margin: 0, fontSize: 11, color: "var(--color-text-secondary)" }}>S/N: {a.serialNumber}</p>}
                                    </Card>
                                ))}
                            </div>
                    )}

                    {tab === "assignments" && (
                        assignments.length === 0 ? <EmptyState icon="🔗" message="No assignments yet." /> :
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {assignments.map(a => (
                                    <Card key={a.id}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>
                                                    {a.asset?.name} <span style={{ fontSize: 12, color: "var(--color-text-secondary)", fontWeight: 400 }}>({a.asset?.assetCode})</span>
                                                </p>
                                                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-text-secondary)" }}>
                                                    → {a.employee?.firstName} {a.employee?.lastName} · Assigned {a.assignedAt?.slice(0, 10)}
                                                    {a.expectedReturnDate ? ` · Return by ${a.expectedReturnDate}` : ""}
                                                </p>
                                            </div>
                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                <StatusBadge status={a.status} />
                                                {a.status === "active" && (
                                                    <Btn variant="secondary" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => { setReturnModal(a.id); setReturnForm({ conditionAtReturn: "good", returnNotes: "" }); }}>Return</Btn>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                    )}

                    {tab === "damage" && (
                        damages.length === 0 ? <EmptyState icon="🔧" message="No damage reports." /> :
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                                {damages.map(d => (
                                    <Card key={d.id}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{d.asset?.name}</p>
                                                <p style={{ margin: "4px 0 0", fontSize: 12, color: "var(--color-text-secondary)" }}>
                                                    Severity: <strong>{d.severity}</strong> · Reported by {d.reporter?.firstName} {d.reporter?.lastName}
                                                    {d.incidentDate ? ` · ${d.incidentDate}` : ""}
                                                </p>
                                                <p style={{ margin: "4px 0 0", fontSize: 13 }}>{d.description}</p>
                                            </div>
                                            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                                                <StatusBadge status={d.status} />
                                                {d.status !== "resolved" && (
                                                    <Btn variant="success" style={{ fontSize: 12, padding: "5px 10px" }} onClick={() => assetApi.updateDamageReport(d.id, { status: "resolved" }).then(() => { toast("Marked resolved"); load(); })}>Resolve</Btn>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                    )}
                </>
            )}

            {showAssetForm && (
                <Modal title="Add New Asset" onClose={() => setShowAssetForm(false)}>
                    <Field label="Asset Name"><Input placeholder="e.g. Dell Latitude 5520" value={assetForm.name} onChange={e => setAssetForm({ ...assetForm, name: e.target.value })} /></Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Type"><Select value={assetForm.type} onChange={e => setAssetForm({ ...assetForm, type: e.target.value })}>{["laptop", "mobile", "sim", "tablet", "monitor", "keyboard", "mouse", "headset", "other"].map(t => <option key={t} value={t}>{t}</option>)}</Select></Field>
                        <Field label="Condition"><Select value={assetForm.condition} onChange={e => setAssetForm({ ...assetForm, condition: e.target.value })}>{["new", "good", "fair", "poor"].map(c => <option key={c} value={c}>{c}</option>)}</Select></Field>
                        <Field label="Brand"><Input placeholder="Dell, Apple, HP…" value={assetForm.brand} onChange={e => setAssetForm({ ...assetForm, brand: e.target.value })} /></Field>
                        <Field label="Model"><Input placeholder="Latitude 5520" value={assetForm.model} onChange={e => setAssetForm({ ...assetForm, model: e.target.value })} /></Field>
                        <Field label="Serial Number"><Input value={assetForm.serialNumber} onChange={e => setAssetForm({ ...assetForm, serialNumber: e.target.value })} /></Field>
                        <Field label="Purchase Price"><Input type="number" placeholder="0" value={assetForm.purchasePrice} onChange={e => setAssetForm({ ...assetForm, purchasePrice: e.target.value })} /></Field>
                        <Field label="Purchase Date"><Input type="date" value={assetForm.purchaseDate} onChange={e => setAssetForm({ ...assetForm, purchaseDate: e.target.value })} /></Field>
                    </div>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 4 }}>
                        <Btn variant="secondary" onClick={() => setShowAssetForm(false)}>Cancel</Btn>
                        <Btn onClick={createAsset} disabled={!assetForm.name}>Create Asset</Btn>
                    </div>
                </Modal>
            )}

            {showAssignForm && (
                <Modal title="Assign Asset to Employee" onClose={() => setShowAssignForm(false)}>
                    <Field label="Asset ID"><Input type="number" placeholder="Asset ID" value={assignForm.assetId} onChange={e => setAssignForm({ ...assignForm, assetId: e.target.value })} /></Field>
                    <Field label="Employee ID"><Input type="number" placeholder="Employee ID" value={assignForm.employeeId} onChange={e => setAssignForm({ ...assignForm, employeeId: e.target.value })} /></Field>
                    <Field label="Expected Return Date"><Input type="date" value={assignForm.expectedReturnDate} onChange={e => setAssignForm({ ...assignForm, expectedReturnDate: e.target.value })} /></Field>
                    <Field label="Notes"><Textarea value={assignForm.assignmentNotes} onChange={e => setAssignForm({ ...assignForm, assignmentNotes: e.target.value })} /></Field>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <Btn variant="secondary" onClick={() => setShowAssignForm(false)}>Cancel</Btn>
                        <Btn onClick={assignAsset} disabled={!assignForm.assetId || !assignForm.employeeId}>Assign</Btn>
                    </div>
                </Modal>
            )}

            {showDamageForm && (
                <Modal title="File Damage Report" onClose={() => setShowDamageForm(false)}>
                    <Field label="Assignment ID"><Input type="number" value={damageForm.assignmentId} onChange={e => setDamageForm({ ...damageForm, assignmentId: e.target.value })} /></Field>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Severity"><Select value={damageForm.severity} onChange={e => setDamageForm({ ...damageForm, severity: e.target.value })}>{["minor", "moderate", "severe", "total_loss"].map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</Select></Field>
                        <Field label="Incident Date"><Input type="date" value={damageForm.incidentDate} onChange={e => setDamageForm({ ...damageForm, incidentDate: e.target.value })} /></Field>
                    </div>
                    <Field label="Description"><Textarea placeholder="Describe the damage…" value={damageForm.description} onChange={e => setDamageForm({ ...damageForm, description: e.target.value })} /></Field>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <Btn variant="secondary" onClick={() => setShowDamageForm(false)}>Cancel</Btn>
                        <Btn onClick={fileDamage} disabled={!damageForm.assignmentId || !damageForm.description}>Submit Report</Btn>
                    </div>
                </Modal>
            )}

            {returnModal && (
                <Modal title="Return Asset" onClose={() => setReturnModal(null)}>
                    <Field label="Condition at Return"><Select value={returnForm.conditionAtReturn} onChange={e => setReturnForm({ ...returnForm, conditionAtReturn: e.target.value })}>{["new", "good", "fair", "poor"].map(c => <option key={c} value={c}>{c}</option>)}</Select></Field>
                    <Field label="Return Notes"><Textarea value={returnForm.returnNotes} onChange={e => setReturnForm({ ...returnForm, returnNotes: e.target.value })} /></Field>
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <Btn variant="secondary" onClick={() => setReturnModal(null)}>Cancel</Btn>
                        <Btn variant="success" onClick={returnAsset}>Confirm Return</Btn>
                    </div>
                </Modal>
            )}
        </div>
    );
};

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────

const NAV = [
    { key: "kpi", label: "KPI / OKR", icon: "🎯" },
    { key: "cycles", label: "Review Cycles", icon: "📋" },
    { key: "reviews", label: "Reviews", icon: "📝" },
    { key: "goals", label: "Goals", icon: "🚀" },
    { key: "promotions", label: "Promotions", icon: "🏆" },
    { key: "assets", label: "Assets", icon: "💼" },
];

export default function PerformanceAssetDashboard() {
    const [activeNav, setActiveNav] = useState("kpi");

    const renderSection = () => {
        switch (activeNav) {
            case "kpi": return <KpiSection />;
            case "cycles": return <ReviewCyclesSection />;
            case "reviews": return <ReviewsSection />;
            case "goals": return <GoalsSection />;
            case "promotions": return <PromotionsSection />;
            case "assets": return <AssetsSection />;
            default: return null;
        }
    };

    return (
        <div style={{ display: "flex", minHeight: "100vh", background: "var(--color-background-tertiary)", fontFamily: "var(--font-sans)" }}>
            {/* Sidebar */}
            <aside style={{
                width: 220, flexShrink: 0, background: "var(--color-background-primary)",
                borderRight: "0.5px solid var(--color-border-tertiary)", padding: "28px 0",
                position: "sticky", top: 0, height: "100vh", overflowY: "auto",
            }}>
                <div style={{ padding: "0 20px 24px", borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Performance</p>
                </div>
                <nav style={{ padding: "12px 0" }}>
                    {NAV.slice(0, 5).map(n => (
                        <button key={n.key} onClick={() => setActiveNav(n.key)} style={{
                            display: "flex", alignItems: "center", gap: 10, width: "100%",
                            padding: "10px 20px", border: "none", background: activeNav === n.key ? "var(--color-background-secondary)" : "transparent",
                            cursor: "pointer", fontSize: 13, fontWeight: activeNav === n.key ? 600 : 400,
                            color: activeNav === n.key ? "#1a56db" : "var(--color-text-primary)",
                            borderLeft: activeNav === n.key ? "3px solid #1a56db" : "3px solid transparent",
                            textAlign: "left",
                        }}>
                            <span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}
                        </button>
                    ))}
                </nav>
                <div style={{ padding: "12px 20px 6px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Assets</p>
                </div>
                <nav style={{ padding: "8px 0" }}>
                    {NAV.slice(5).map(n => (
                        <button key={n.key} onClick={() => setActiveNav(n.key)} style={{
                            display: "flex", alignItems: "center", gap: 10, width: "100%",
                            padding: "10px 20px", border: "none", background: activeNav === n.key ? "var(--color-background-secondary)" : "transparent",
                            cursor: "pointer", fontSize: 13, fontWeight: activeNav === n.key ? 600 : 400,
                            color: activeNav === n.key ? "#1a56db" : "var(--color-text-primary)",
                            borderLeft: activeNav === n.key ? "3px solid #1a56db" : "3px solid transparent",
                            textAlign: "left",
                        }}>
                            <span style={{ fontSize: 16 }}>{n.icon}</span>{n.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, padding: "32px 36px", overflowY: "auto" }}>
                {renderSection()}
            </main>
        </div>
    );
}