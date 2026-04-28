// src/pages/CompanyPage.jsx
import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {useAuth} from "../context/AuthContext"; // your auth hook
import {
    fetchCompany,
    fetchCompanyStats,
    createCompany,
    updateCompany,
    uploadCompanyLogo,
    deleteCompanyLogo,
    updateCompanySettings,
    deactivateCompany,
    listCompanies,
} from "../api/companyApi";

const CompanyPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isAdmin } = useAuth();
    const [darkMode, setDarkMode] = useState(
        localStorage.getItem("theme") === "dark" ||
        (!localStorage.getItem("theme") && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );

    // Apply dark class to <html>
    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [darkMode]);

    // Company state
    const [company, setCompany] = useState(null);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Admin list
    const [companies, setCompanies] = useState([]);
    const [listMeta, setListMeta] = useState({});
    const [listLoading, setListLoading] = useState(false);

    // Form states
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        website: "",
        industry: "",
        size: "",
        addressLine1: "",
        addressLine2: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        timezone: "Asia/Kolkata",
        currency: "INR",
        workingHoursPerDay: 8,
        workingDaysPerWeek: 5,
        annualLeaveQuota: 21,
        fiscalYearStart: 4,
        subscriptionPlan: "free",
    });
    const [settingsForm, setSettingsForm] = useState({
        workingHoursPerDay: 8,
        workingDaysPerWeek: 5,
        annualLeaveQuota: 21,
        timezone: "Asia/Kolkata",
        currency: "INR",
        subscriptionPlan: "free",
    });
    const [logoFile, setLogoFile] = useState(null);
    const [activeTab, setActiveTab] = useState("details");

    // Load company data
    const loadCompany = useCallback(async () => {
        if (!id) return;
        setLoading(true);
        setError(null);
        try {
            const comp = await fetchCompany(id);
            setCompany(comp);
            setFormData({
                name: comp.name || "",
                email: comp.email || "",
                phone: comp.phone || "",
                website: comp.website || "",
                industry: comp.industry || "",
                size: comp.size || "",
                addressLine1: comp.addressLine1 || "",
                addressLine2: comp.addressLine2 || "",
                city: comp.city || "",
                state: comp.state || "",
                country: comp.country || "",
                postalCode: comp.postalCode || "",
                timezone: comp.timezone || "Asia/Kolkata",
                currency: comp.currency || "INR",
                workingHoursPerDay: comp.workingHoursPerDay || 8,
                workingDaysPerWeek: comp.workingDaysPerWeek || 5,
                annualLeaveQuota: comp.annualLeaveQuota || 21,
                fiscalYearStart: comp.fiscalYearStart || 4,
                subscriptionPlan: comp.subscriptionPlan || "free",
            });
            setSettingsForm({
                workingHoursPerDay: comp.workingHoursPerDay || 8,
                workingDaysPerWeek: comp.workingDaysPerWeek || 5,
                annualLeaveQuota: comp.annualLeaveQuota || 21,
                timezone: comp.timezone || "Asia/Kolkata",
                currency: comp.currency || "INR",
                subscriptionPlan: comp.subscriptionPlan || "free",
            });
            const st = await fetchCompanyStats(id);
            setStats(st.stats);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load company");
        } finally {
            setLoading(false);
        }
    }, [id]);

    const loadCompanyList = useCallback(async () => {
        setListLoading(true);
        try {
            const res = await listCompanies({ page: 1, limit: 50 });
            setCompanies(res.companies);
            setListMeta({ total: res.total, page: res.page, limit: res.limit });
        } catch (err) {
            setError("Failed to load companies");
        } finally {
            setListLoading(false);
        }
    }, []);

    useEffect(() => {
        if (id) loadCompany();
        else if (isAdmin) loadCompanyList();
    }, [id, isAdmin, loadCompany, loadCompanyList]);

    // Handlers
    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const newCompany = await createCompany(formData);
            setSuccess("Company created");
            navigate(`/company/${newCompany._id}`);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const updated = await updateCompany(id, formData);
            setCompany(updated);
            setSuccess("Company updated");
            const st = await fetchCompanyStats(id);
            setStats(st.stats);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateSettings = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const updatedSettings = await updateCompanySettings(id, settingsForm);
            setCompany((prev) => ({ ...prev, ...updatedSettings }));
            setSuccess("Settings updated");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to update settings");
        } finally {
            setLoading(false);
        }
    };

    const handleLogoUpload = async () => {
        if (!logoFile) return;
        setLoading(true);
        setError(null);
        try {
            const result = await uploadCompanyLogo(id, logoFile);
            setCompany((prev) => ({ ...prev, logoUrl: result.logoUrl }));
            setSuccess("Logo uploaded");
            setLogoFile(null);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to upload logo");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLogo = async () => {
        setLoading(true);
        setError(null);
        try {
            await deleteCompanyLogo(id);
            setCompany((prev) => ({ ...prev, logoUrl: null }));
            setSuccess("Logo removed");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete logo");
        } finally {
            setLoading(false);
        }
    };

    const handleDeactivate = async () => {
        if (!window.confirm("Deactivate company?")) return;
        setLoading(true);
        setError(null);
        try {
            await deactivateCompany(id);
            setSuccess("Company deactivated");
            navigate("/companies");
        } catch (err) {
            setError(err.response?.data?.message || "Failed to deactivate");
        } finally {
            setLoading(false);
        }
    };

    // Clear messages after a few seconds
    useEffect(() => {
        if (error) setTimeout(() => setError(null), 5000);
        if (success) setTimeout(() => setSuccess(null), 3000);
    }, [error, success]);

    // ----- RENDER -----
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8 transition-colors">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-2xl md:text-3xl font-bold">
                    {id ? "Company Dashboard" : isAdmin ? "Company Management" : "Access Denied"}
                </h1>
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    {darkMode ? "☀️ Light" : "🌙 Dark"}
                </button>
            </header>

            {/* Alerts */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg">
                    {success}
                </div>
            )}

            {!id && !isAdmin && <p className="text-center text-gray-500">You do not have permission to view this page.</p>}

            {/* ADMIN LIST */}
            {isAdmin && !id && (
                <section className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">All Companies</h2>
                    {listLoading ? (
                        <p>Loading...</p>
                    ) : companies.length === 0 ? (
                        <p>No companies found.</p>
                    ) : (
                        <ul className="space-y-2">
                            {companies.map((c) => (
                                <li
                                    key={c._id}
                                    className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                                >
                                    <span className="font-medium">{c.name}</span>
                                    <button
                                        onClick={() => navigate(`/company/${c._id}`)}
                                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm"
                                    >
                                        View
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                    <button
                        onClick={() => setActiveTab("create")}
                        className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                    >
                        Create New Company
                    </button>
                </section>
            )}

            {/* COMPANY SPECIFIC SECTIONS */}
            {id && (
                <>
                    {/* Tabs */}
                    <nav className="flex flex-wrap gap-2 mb-6">
                        {["details", "edit", "settings", "logo", "stats"].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-4 py-2 rounded-md font-medium capitalize ${activeTab === tab
                                        ? "bg-indigo-600 text-white"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600"
                                    }`}
                            >
                                {tab}
                            </button>
                        ))}
                    </nav>

                    {loading && <div className="text-center py-8 text-gray-500">Loading...</div>}

                    {/* Details Tab */}
                    {activeTab === "details" && company && (
                        <section>
                            <h2 className="text-2xl font-bold mb-4">{company.name}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                                {[
                                    ["Email", company.email],
                                    ["Phone", company.phone],
                                    ["Website", company.website],
                                    ["Industry", company.industry],
                                    ["Size", company.size],
                                    ["Timezone", company.timezone],
                                    ["Currency", company.currency],
                                    ["Working Hours", `${company.workingHoursPerDay}h/day, ${company.workingDaysPerWeek}d/wk`],
                                    ["Annual Leave", `${company.annualLeaveQuota} days`],
                                    ["Fiscal Year Start", `April ${company.fiscalYearStart}`],
                                    ["Plan", company.subscriptionPlan],
                                ].map(([label, value]) => (
                                    <div key={label} className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                                        <p className="font-medium">{value || "-"}</p>
                                    </div>
                                ))}
                            </div>
                            {company.addressLine1 && (
                                <p className="mb-4">
                                    <span className="font-semibold">Address: </span>
                                    {[
                                        company.addressLine1,
                                        company.addressLine2,
                                        company.city,
                                        company.state,
                                        company.country,
                                        company.postalCode,
                                    ]
                                        .filter(Boolean)
                                        .join(", ")}
                                </p>
                            )}
                            {company.logoUrl && (
                                <img
                                    src={company.logoUrl}
                                    alt="Company Logo"
                                    className="w-40 h-40 object-contain rounded-lg border dark:border-gray-600 mb-4"
                                />
                            )}
                            {isAdmin && (
                                <button
                                    onClick={handleDeactivate}
                                    className="mt-4 px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                                >
                                    Deactivate Company
                                </button>
                            )}
                        </section>
                    )}

                    {/* Edit Tab */}
                    {activeTab === "edit" && company && (
                        <section>
                            <h3 className="text-xl font-semibold mb-4">Edit Company</h3>
                            <form onSubmit={handleUpdate} className="space-y-4 max-w-lg">
                                {[
                                    { label: "Name", key: "name", type: "text", required: true },
                                    { label: "Email", key: "email", type: "email", required: true },
                                    { label: "Phone", key: "phone", type: "text" },
                                    { label: "Website", key: "website", type: "url" },
                                    { label: "Industry", key: "industry", type: "text" },
                                    { label: "Address Line 1", key: "addressLine1", type: "text" },
                                    { label: "Address Line 2", key: "addressLine2", type: "text" },
                                    { label: "City", key: "city", type: "text" },
                                    { label: "State", key: "state", type: "text" },
                                    { label: "Country", key: "country", type: "text" },
                                    { label: "Postal Code", key: "postalCode", type: "text" },
                                    { label: "Timezone", key: "timezone", type: "text" },
                                    { label: "Currency", key: "currency", type: "text" },
                                    { label: "Working Hours/Day", key: "workingHoursPerDay", type: "number" },
                                    { label: "Working Days/Week", key: "workingDaysPerWeek", type: "number" },
                                    { label: "Annual Leave Quota", key: "annualLeaveQuota", type: "number" },
                                    { label: "Fiscal Year Start (month)", key: "fiscalYearStart", type: "number" },
                                ].map(({ label, key, type, required }) => (
                                    <div key={key}>
                                        <label className="block text-sm font-medium mb-1">{label}</label>
                                        <input
                                            type={type}
                                            value={formData[key]}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    [key]: type === "number" ? Number(e.target.value) : e.target.value,
                                                })
                                            }
                                            required={required}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Size</label>
                                    <select
                                        value={formData.size}
                                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    >
                                        <option value="">Select</option>
                                        {["1-10", "11-50", "50-100", "100-200", "200-500", "500+"].map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subscription Plan</label>
                                    <select
                                        value={formData.subscriptionPlan}
                                        onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    >
                                        <option value="free">Free</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md disabled:opacity-50"
                                >
                                    {loading ? "Updating..." : "Update Company"}
                                </button>
                            </form>
                        </section>
                    )}

                    {/* Settings Tab */}
                    {activeTab === "settings" && company && (
                        <section>
                            <h3 className="text-xl font-semibold mb-4">Company Settings</h3>
                            <form onSubmit={handleUpdateSettings} className="space-y-4 max-w-lg">
                                {[
                                    { label: "Working Hours/Day", key: "workingHoursPerDay", type: "number" },
                                    { label: "Working Days/Week", key: "workingDaysPerWeek", type: "number" },
                                    { label: "Annual Leave Quota", key: "annualLeaveQuota", type: "number" },
                                    { label: "Timezone", key: "timezone", type: "text" },
                                    { label: "Currency", key: "currency", type: "text" },
                                ].map(({ label, key, type }) => (
                                    <div key={key}>
                                        <label className="block text-sm font-medium mb-1">{label}</label>
                                        <input
                                            type={type}
                                            value={settingsForm[key]}
                                            onChange={(e) =>
                                                setSettingsForm({
                                                    ...settingsForm,
                                                    [key]: type === "number" ? Number(e.target.value) : e.target.value,
                                                })
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                        />
                                    </div>
                                ))}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Subscription Plan</label>
                                    <select
                                        value={settingsForm.subscriptionPlan}
                                        onChange={(e) => setSettingsForm({ ...settingsForm, subscriptionPlan: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                    >
                                        <option value="free">Free</option>
                                        <option value="premium">Premium</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md disabled:opacity-50"
                                >
                                    {loading ? "Saving..." : "Save Settings"}
                                </button>
                            </form>
                        </section>
                    )}

                    {/* Logo Tab */}
                    {activeTab === "logo" && company && (
                        <section>
                            <h3 className="text-xl font-semibold mb-4">Company Logo</h3>
                            {company.logoUrl ? (
                                <div className="flex items-center gap-4 mb-4">
                                    <img src={company.logoUrl} alt="Logo" className="w-32 h-32 object-contain border rounded" />
                                    <button
                                        onClick={handleDeleteLogo}
                                        disabled={loading}
                                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
                                    >
                                        Remove Logo
                                    </button>
                                </div>
                            ) : (
                                <p className="text-gray-500 mb-4">No logo set.</p>
                            )}
                            <div className="flex items-center gap-4">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setLogoFile(e.target.files[0])}
                                    className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 dark:file:bg-indigo-900 file:text-indigo-700 dark:file:text-indigo-200 hover:file:bg-indigo-100"
                                />
                                <button
                                    onClick={handleLogoUpload}
                                    disabled={!logoFile || loading}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md disabled:opacity-50"
                                >
                                    Upload Logo
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Stats Tab */}
                    {activeTab === "stats" && stats && (
                        <section>
                            <h3 className="text-xl font-semibold mb-4">Company Statistics</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {[
                                    ["Total Employees", stats.totalEmployees],
                                    ["Active Employees", stats.activeEmployees],
                                    ["Total Payroll", stats.totalPayroll],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="bg-gray-50 dark:bg-gray-800 p-5 rounded-lg text-center border border-gray-200 dark:border-gray-700"
                                    >
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                                        <p className="text-3xl font-bold mt-2">{value ?? "N/A"}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}

            {/* CREATE COMPANY FORM (Admin) */}
            {activeTab === "create" && isAdmin && !id && (
                <section className="max-w-lg">
                    <h2 className="text-2xl font-bold mb-4">Create New Company</h2>
                    <form onSubmit={handleCreate} className="space-y-4">
                        {[
                            { label: "Name", key: "name", type: "text", required: true },
                            { label: "Email", key: "email", type: "email", required: true },
                            { label: "Phone", key: "phone", type: "text" },
                            { label: "Website", key: "website", type: "url" },
                            { label: "Industry", key: "industry", type: "text" },
                            { label: "Address Line 1", key: "addressLine1", type: "text" },
                            { label: "Address Line 2", key: "addressLine2", type: "text" },
                            { label: "City", key: "city", type: "text" },
                            { label: "State", key: "state", type: "text" },
                            { label: "Country", key: "country", type: "text" },
                            { label: "Postal Code", key: "postalCode", type: "text" },
                            { label: "Timezone", key: "timezone", type: "text" },
                            { label: "Currency", key: "currency", type: "text" },
                            { label: "Working Hours/Day", key: "workingHoursPerDay", type: "number" },
                            { label: "Working Days/Week", key: "workingDaysPerWeek", type: "number" },
                            { label: "Annual Leave Quota", key: "annualLeaveQuota", type: "number" },
                            { label: "Fiscal Year Start (month)", key: "fiscalYearStart", type: "number" },
                        ].map(({ label, key, type, required }) => (
                            <div key={key}>
                                <label className="block text-sm font-medium mb-1">{label}</label>
                                <input
                                    type={type}
                                    value={formData[key]}
                                    onChange={(e) =>
                                        setFormData({ ...formData, [key]: type === "number" ? Number(e.target.value) : e.target.value })
                                    }
                                    required={required}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                                />
                            </div>
                        ))}
                        <div>
                            <label className="block text-sm font-medium mb-1">Size</label>
                            <select
                                value={formData.size}
                                onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                            >
                                <option value="">Select</option>
                                {["1-10", "11-50", "50-100", "100-200", "200-500", "500+"].map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Subscription Plan</label>
                            <select
                                value={formData.subscriptionPlan}
                                onChange={(e) => setFormData({ ...formData, subscriptionPlan: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                            >
                                <option value="free">Free</option>
                                <option value="premium">Premium</option>
                            </select>
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Company"}
                        </button>
                    </form>
                </section>
            )}
        </div>
    );
};

export default CompanyPage;