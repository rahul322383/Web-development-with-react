// ReportsPage.jsx
import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
    useRef,
    memo,
    lazy,
    Suspense,
} from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    DollarSign,
    Calendar,
    Receipt,
    ChevronDown,
    BarChart3,
    TrendingUp,
    Loader2,
} from 'lucide-react';

/* ---------------------- Lazy-loaded reports ---------------------- */
const DashboardReport = lazy(() => import('../reports/DashboardReport'));
const EmployeesReport = lazy(() => import('../reports/EmployeesReport'));
const PayrollReport = lazy(() => import('../reports/PayrollReport'));
const LeaveReport = lazy(() => import('../reports/LeaveReport'));
const ExpenseReport = lazy(() => import('../reports/ExpenseReport'));

/* ---------------------- Constants ---------------------- */
const TABS = Object.freeze([
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        roles: ['Admin', 'Manager', 'HR', 'Finance'],
        description: 'Key metrics and overview',
    },
    {
        id: 'employees',
        label: 'Employees',
        icon: Users,
        roles: ['Admin', 'HR', 'Manager'],
        description: 'Workforce analytics',
    },
    {
        id: 'payroll',
        label: 'Payroll',
        icon: DollarSign,
        roles: ['Admin', 'Finance', 'HR'],
        description: 'Salary and compensation',
    },
    {
        id: 'leave',
        label: 'Leave',
        icon: Calendar,
        roles: ['Admin', 'HR', 'Manager'],
        description: 'Time-off requests',
    },
    {
        id: 'expenses',
        label: 'Expenses',
        icon: Receipt,
        roles: ['Admin', 'Finance', 'Manager'],
        description: 'Expense tracking',
    },
]);

// O(1) tab lookup map
const TAB_COMPONENTS = Object.freeze({
    dashboard: DashboardReport,
    employees: EmployeesReport,
    payroll: PayrollReport,
    leave: LeaveReport,
    expenses: ExpenseReport,
});

const SCROLL_THRESHOLD = 20;

/* ---------------------- Sub-components ---------------------- */
const ReportFallback = memo(() => (
    <div className="flex items-center justify-center py-24">
        <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading report…</p>
        </div>
    </div>
));
ReportFallback.displayName = 'ReportFallback';

const DesktopTab = memo(({ tab, isActive, onClick }) => {
    const Icon = tab.icon;
    const handleClick = useCallback(() => onClick(tab.id), [tab.id, onClick]);

    return (
        <button
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={handleClick}
            className={`
        group relative flex items-center gap-2 px-5 py-4 text-sm font-medium
        transition-colors duration-200
        ${isActive
                    ? 'text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}
      `}
        >
            <Icon
                className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''
                    }`}
            />
            <span>{tab.label}</span>
            {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
            )}
        </button>
    );
});
DesktopTab.displayName = 'DesktopTab';

const MobileTabItem = memo(({ tab, isActive, onSelect }) => {
    const Icon = tab.icon;
    const handleClick = useCallback(() => onSelect(tab.id), [tab.id, onSelect]);

    return (
        <button
            role="option"
            aria-selected={isActive}
            onClick={handleClick}
            className={`
        w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
        transition-colors duration-150
        ${isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'}
      `}
        >
            <div
                className={`p-1.5 rounded-lg ${isActive
                        ? 'bg-indigo-100 dark:bg-indigo-800/50'
                        : 'bg-gray-100 dark:bg-gray-700'
                    }`}
            >
                <Icon
                    className={`w-4 h-4 ${isActive
                            ? 'text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}
                />
            </div>
            <div className="flex-1">
                <span className="font-medium">{tab.label}</span>
                <p className="text-xs text-gray-500 dark:text-gray-400">{tab.description}</p>
            </div>
            {isActive && <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
        </button>
    );
});
MobileTabItem.displayName = 'MobileTabItem';

const PageHeader = memo(() => (
    <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                    Reports & Analytics
                </h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                    View and export detailed reports for your organization
                </p>
            </div>
        </div>
    </div>
));
PageHeader.displayName = 'PageHeader';

/* ---------------------- Hooks ---------------------- */
const useStickyHeader = (threshold = SCROLL_THRESHOLD) => {
    const [isSticky, setIsSticky] = useState(false);

    useEffect(() => {
        let ticking = false;
        let lastValue = false;

        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const next = window.scrollY > threshold;
                if (next !== lastValue) {
                    lastValue = next;
                    setIsSticky(next);
                }
                ticking = false;
            });
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [threshold]);

    return isSticky;
};

const useClickOutside = (ref, handler, enabled = true) => {
    useEffect(() => {
        if (!enabled) return;
        const onDown = (e) => {
            if (ref.current && !ref.current.contains(e.target)) handler(e);
        };
        document.addEventListener('mousedown', onDown);
        document.addEventListener('touchstart', onDown);
        return () => {
            document.removeEventListener('mousedown', onDown);
            document.removeEventListener('touchstart', onDown);
        };
    }, [ref, handler, enabled]);
};

/* ---------------------- Main Component ---------------------- */
const ReportsPage = () => {
    const { user, meta, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const isSticky = useStickyHeader();
    const mobileMenuRef = useRef(null);

    /* User roles - memoized */
    const userRoleSet = useMemo(() => {
        const roles = user?.roles?.length
            ? user.roles
            : [user?.primaryRole || meta?.role || 'Employee'];
        return new Set(roles);
    }, [user?.roles, user?.primaryRole, meta?.role]);

    /* Visible tabs - filtered once per role change */
    const visibleTabs = useMemo(
        () => TABS.filter((tab) => tab.roles.some((role) => userRoleSet.has(role))),
        [userRoleSet]
    );

    /* Auto-correct activeTab if user loses access */
    useEffect(() => {
        if (visibleTabs.length === 0) return;
        if (!visibleTabs.some((t) => t.id === activeTab)) {
            setActiveTab(visibleTabs[0].id);
        }
    }, [visibleTabs, activeTab]);

    /* Active tab data */
    const activeTabData = useMemo(
        () => visibleTabs.find((t) => t.id === activeTab),
        [visibleTabs, activeTab]
    );
    const ActiveIcon = activeTabData?.icon || BarChart3;

    /* Stable handlers */
    const handleTabChange = useCallback((id) => {
        setActiveTab(id);
    }, []);

    const handleMobileSelect = useCallback((id) => {
        setActiveTab(id);
        setShowMobileMenu(false);
    }, []);

    const toggleMobileMenu = useCallback(() => {
        setShowMobileMenu((p) => !p);
    }, []);

    const closeMobileMenu = useCallback(() => setShowMobileMenu(false), []);

    /* Click-outside + ESC for mobile menu */
    useClickOutside(mobileMenuRef, closeMobileMenu, showMobileMenu);

    useEffect(() => {
        if (!showMobileMenu) return;
        const onKey = (e) => e.key === 'Escape' && setShowMobileMenu(false);
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [showMobileMenu]);

    /* Resolve active component from map (O(1) lookup) */
    const ActiveReport = TAB_COMPONENTS[activeTab] || DashboardReport;

    /* Auth check (after hooks to keep order stable) */
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                <PageHeader />

                {/* Sticky Tab Bar */}
                <div
                    className={`transition-all duration-300 ${isSticky ? 'sticky top-16 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8' : ''
                        }`}
                >
                    <div
                        className={`bg-white dark:bg-gray-800/95 backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm ${isSticky ? 'rounded-t-none border-t-0' : ''
                            }`}
                    >
                        {/* Desktop Tabs */}
                        <div className="hidden md:block">
                            <nav className="flex items-center px-2" role="tablist" aria-label="Reports">
                                {visibleTabs.map((tab) => (
                                    <DesktopTab
                                        key={tab.id}
                                        tab={tab}
                                        isActive={activeTab === tab.id}
                                        onClick={handleTabChange}
                                    />
                                ))}
                            </nav>
                        </div>

                        {/* Mobile Tab Selector */}
                        <div className="md:hidden" ref={mobileMenuRef}>
                            <button
                                onClick={toggleMobileMenu}
                                aria-expanded={showMobileMenu}
                                aria-haspopup="listbox"
                                className="w-full flex items-center justify-between px-5 py-4 text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg">
                                        <ActiveIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-900 dark:text-white">
                                            {activeTabData?.label}
                                        </span>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {activeTabData?.description}
                                        </p>
                                    </div>
                                </div>
                                <ChevronDown
                                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showMobileMenu ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            {showMobileMenu && (
                                <div
                                    role="listbox"
                                    className="border-t border-gray-200 dark:border-gray-700 py-2 px-2"
                                >
                                    {visibleTabs.map((tab) => (
                                        <MobileTabItem
                                            key={tab.id}
                                            tab={tab}
                                            isActive={activeTab === tab.id}
                                            onSelect={handleMobileSelect}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div
                    id={`panel-${activeTab}`}
                    role="tabpanel"
                    aria-labelledby={`tab-${activeTab}`}
                    className="mt-6"
                >
                    <div
                        key={activeTab}
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                    >
                        <Suspense fallback={<ReportFallback />}>
                            <ActiveReport />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default memo(ReportsPage);