
import React, { useState, useEffect } from 'react';
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
} from 'lucide-react';
import DashboardReport from '../reports/DashboardReport';
import EmployeesReport from '../reports/EmployeesReport';
import PayrollReport from '../reports/PayrollReport';
import LeaveReport from '../reports/LeaveReport';
import ExpenseReport from '../reports/ExpenseReport';

const TABS = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        roles: ['Admin', 'Manager', 'HR', 'Finance'],
        description: 'Key metrics and overview'
    },
    {
        id: 'employees',
        label: 'Employees',
        icon: Users,
        roles: ['Admin', 'HR', 'Manager'],
        description: 'Workforce analytics'
    },
    {
        id: 'payroll',
        label: 'Payroll',
        icon: DollarSign,
        roles: ['Admin', 'Finance', 'HR'],
        description: 'Salary and compensation'
    },
    {
        id: 'leave',
        label: 'Leave',
        icon: Calendar,
        roles: ['Admin', 'HR', 'Manager'],
        description: 'Time-off requests'
    },
    {
        id: 'expenses',
        label: 'Expenses',
        icon: Receipt,
        roles: ['Admin', 'Finance', 'Manager'],
        description: 'Expense tracking'
    },
];

const ReportsPage = () => {
    const { user, meta, isAuthenticated } = useAuth();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [isSticky, setIsSticky] = useState(false);

    // Handle scroll for sticky header
    useEffect(() => {
        const handleScroll = () => {
            setIsSticky(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Get user roles for permission checks
    const userRoles = user?.roles?.length
        ? user.roles
        : [user?.primaryRole || meta?.role || 'Employee'];

    // Filter tabs based on user roles
    const visibleTabs = TABS.filter(tab =>
        tab.roles.some(role => userRoles.includes(role))
    );

    const activeTabData = visibleTabs.find(tab => tab.id === activeTab);
    const ActiveIcon = activeTabData?.icon || BarChart3;

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <DashboardReport />;
            case 'employees': return <EmployeesReport />;
            case 'payroll': return <PayrollReport />;
            case 'leave': return <LeaveReport />;
            case 'expenses': return <ExpenseReport />;
            default: return <DashboardReport />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                {/* Page Header */}
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

                {/* Sticky Tab Bar */}
                <div
                    className={`
            transition-all duration-300
            ${isSticky ? 'sticky top-16 z-20 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8' : ''}
          `}
                >
                    <div className={`
            bg-white dark:bg-gray-800/95 backdrop-blur-sm
            border border-gray-200 dark:border-gray-700
            rounded-2xl shadow-sm
            ${isSticky ? 'rounded-t-none border-t-0' : ''}
          `}>
                        {/* Desktop Tabs */}
                        <div className="hidden md:block">
                            <nav className="flex items-center px-2" aria-label="Tabs">
                                {visibleTabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                        group relative flex items-center gap-2 px-5 py-4 text-sm font-medium
                        transition-all duration-200
                        ${isActive
                                                    ? 'text-indigo-600 dark:text-indigo-400'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                                }
                      `}
                                        >
                                            <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''
                                                }`} />
                                            <span>{tab.label}</span>

                                            {/* Active Indicator */}
                                            {isActive && (
                                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Mobile Tab Selector */}
                        <div className="md:hidden">
                            <button
                                onClick={() => setShowMobileMenu(!showMobileMenu)}
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
                                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showMobileMenu ? 'rotate-180' : ''
                                    }`} />
                            </button>

                            {/* Mobile Dropdown Menu */}
                            {showMobileMenu && (
                                <div className="border-t border-gray-200 dark:border-gray-700 py-2 px-2">
                                    {visibleTabs.map((tab) => {
                                        const Icon = tab.icon;
                                        const isActive = activeTab === tab.id;
                                        return (
                                            <button
                                                key={tab.id}
                                                onClick={() => {
                                                    setActiveTab(tab.id);
                                                    setShowMobileMenu(false);
                                                }}
                                                className={`
                          w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left
                          transition-colors duration-150
                          ${isActive
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                                                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                    }
                        `}
                                            >
                                                <div className={`p-1.5 rounded-lg ${isActive
                                                        ? 'bg-indigo-100 dark:bg-indigo-800/50'
                                                        : 'bg-gray-100 dark:bg-gray-700'
                                                    }`}>
                                                    <Icon className={`w-4 h-4 ${isActive
                                                            ? 'text-indigo-600 dark:text-indigo-400'
                                                            : 'text-gray-500 dark:text-gray-400'
                                                        }`} />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-medium">{tab.label}</span>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">{tab.description}</p>
                                                </div>
                                                {isActive && (
                                                    <div className="w-2 h-2 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Report Content */}
                <div className="mt-6">
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {renderContent()}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;