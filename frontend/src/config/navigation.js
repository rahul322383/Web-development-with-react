
import {
    LayoutDashboard,
    Users,
    Calendar,
    Receipt,
    Bell,
    Home,
    Info,
    Sparkles,
    CreditCard,
    PlayCircle,
    BookOpen,
    Briefcase,
    Shield,
    Scale,
    Lock,
    HelpCircle,
    Settings,
    User,
    ClipboardList,
    BarChart,
    MessageSquare,
    Clock,
    Building2,
    FileText,
    IndianRupee,
    BarChart3,
} from 'lucide-react';

// ─── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = {
    ADMIN: 'Admin',
    MANAGER: 'Manager',
    HR: 'HR',
    EMPLOYEE: 'Employee',
    FINANCE: 'Finance',
};

// ─── Public navigation ───────────────────────────────────────────────────────
export const PUBLIC_NAVIGATION = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Features', href: '/features', icon: Sparkles },
    { name: 'Pricing', href: '/pricing', icon: CreditCard },
    { name: 'Demo', href: '/demo', icon: PlayCircle },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: MessageSquare },
    { name: 'Careers', href: '/careers', icon: Briefcase },
];

// ─── Auth navigation ─────────────────────────────────────────────────────────
export const AUTH_NAVIGATION = [
    {
        name: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
        roles: Object.values(ROLES),
        showInHeader: true,
    },
    {
        name: 'Department Dashboard',
        href: '/department-dashboard',
        icon: Building2,
        roles: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.FINANCE],
    },
    {
        name: 'Profile',
        href: '/profile',
        icon: User,
        roles: Object.values(ROLES),
    },
    {
        name: 'Leave Management',
        href: '/leave',
        icon: Calendar,
        roles: Object.values(ROLES),
    },
    {
        name: 'Attendance',
        href: '/attendance',
        icon: Calendar,
        roles: Object.values(ROLES),
    },
    {
        name: 'Shift Management',
        href: '/shift-management',
        icon: Clock,
        roles: Object.values(ROLES),
    },
    {
        name: 'Pending Approvals',
        href: '/pending-leave',
        icon: ClipboardList,
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.FINANCE],
        badge: { type: 'pendingLeaves' },
    },
    {
        name: 'Approved Leaves',
        href: '/approved-leave',
        icon: ClipboardList,
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.FINANCE],
        badge: { type: 'count', key: 'approvedLeaves' },
    },
    {
        name: 'Year End',
        href: '/year-end',
        icon: BarChart3,
        roles: [ROLES.ADMIN, ROLES.HR, ROLES.FINANCE, ROLES.MANAGER],
    },
    {
        name: 'Analytics',
        href: '/analytics',
        icon: Receipt,
        roles: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.FINANCE],
    },
    {
        name: 'Company',
        href: '/company',
        icon: Building2,
        roles: Object.values(ROLES),
    },
    {
        name: 'Expenses',
        href: '/expenses',
        icon: Receipt,
        roles: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.FINANCE ,ROLES.EMPLOYEE] ,
    },
    {
        name: 'Audit Logs',
        href: '/audit-logs',
        icon: FileText,
        roles: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER, ROLES.FINANCE],
    },
    {
        name: 'Users Management',
        href: '/users',
        icon: Users,
        roles: [ROLES.ADMIN, ROLES.MANAGER],
        showInHeader: true,
    },
    {
        name: 'Payroll',
        href: '/payroll',
        icon: IndianRupee,
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.FINANCE],
    },
    {
        name: 'Reports & Analytics',
        href: '/reports',
        icon: BarChart,
        roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.HR, ROLES.FINANCE],
    },
    {
        name: 'Recruitment',
        href: '/recruitment',
        icon: Briefcase,
        roles: [ROLES.ADMIN, ROLES.HR, ROLES.MANAGER],
    },
    {
        name: 'Notifications',
        href: '/notifications',
        icon: Bell,
        roles: Object.values(ROLES),
    },
    {
        name: 'Settings',
        href: '/settings',
        icon: Settings,
        roles: Object.values(ROLES),
    },
];

// ─── Footer links ────────────────────────────────────────────────────────────
export const FOOTER_LINKS = [
    {
        section: 'Legal',
        links: [
            { name: 'Privacy', href: '/privacy', icon: Shield },
            { name: 'Terms', href: '/terms', icon: Scale },
            { name: 'Security', href: '/security', icon: Lock },
        ],
    },
    {
        section: 'Support',
        links: [
            { name: 'Help Center', href: '/help', icon: HelpCircle },
            { name: 'Documentation', href: '/docs', icon: BookOpen },
        ],
    },
];

// ─── Utility ─────────────────────────────────────────────────────────────────
export function filterNavigation(navItems, userRoles = [], department = '') {
    return navItems.filter(item =>
        item.roles?.some(role => userRoles.includes(role)) ||
        (item.department && item.department.includes(department))
    );
}