import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserCheck, 
  Briefcase, 
  Search, 
  Grid, 
  List, 
  ChevronDown,
  Building2,
  AlertCircle,
  Moon,
  Sun,
  RefreshCw
} from 'lucide-react';

// Import actual API and hooks (adjust paths as needed)
import { userApi } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import { 
  LoadingSpinner, 
  formatDate,
  getStatusIcon,
  StatCard, 
  StatCardSkeleton, 
  TableSkeleton, 
  EmptyState, 
  getStatusBadgeStyle, 
  AlertMessage,
  UserCard,
  UserTable,
  ErrorState
} from "../components/ui/StatCardSkeleton";

// Theme Toggle Component
const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      aria-label="Toggle theme"
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>
  );
};

// Main Component
const DepartmentDashboard = () => {
  const { user: currentUser } = useAuth();
  
  // State Management
  const [department, setDepartment] = useState('IT');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 'grid' : 'table';
    }
    return 'table';
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Custom debounce implementation
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Available departments (can be fetched from API)
  const departments = ['IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'];

  // Fetch Users Data
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userApi.getUsersByDepartment(department);
      
      if (response.success && Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [department]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle window resize for responsive view
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode('grid');
      } else {
        setViewMode('table');
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Role filter
      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false;
      }
      
      // Search filter
      if (debouncedSearchTerm) {
        const searchLower = debouncedSearchTerm.toLowerCase();
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        const email = user.email.toLowerCase();
        
        return fullName.includes(searchLower) || email.includes(searchLower);
      }
      
      return true;
    });
  }, [users, roleFilter, debouncedSearchTerm]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalEmployees = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const managersAndAdmins = users.filter(u => 
      u.role === 'manager' || u.role === 'admin'
    ).length;
    
    return { totalEmployees, activeUsers, managersAndAdmins };
  }, [users]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Department Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage and view employees in your department
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {currentUser?.firstName} {currentUser?.lastName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {currentUser?.role}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}
                </div>
              </div>
              
              <ThemeToggle />
            </div>
          </div>
        </motion.div>

        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Department Selector */}
          <div className="relative">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="appearance-none w-full sm:w-48 px-4 py-2.5 pr-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept} Department</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400 pointer-events-none" />
          </div>

          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
          </select>

          {/* View Toggle */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              aria-label="Table view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Statistics Cards - Fixed color props */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : !error && users.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard
              icon={Users}
              title="Total Employees"
              value={stats.totalEmployees}
              color="total"
            />
            <StatCard
              icon={UserCheck}
              title="Active Users"
              value={stats.activeUsers}
              color="approved"
            />
            <StatCard
              icon={Briefcase}
              title="Managers & Admins"
              value={stats.managersAndAdmins}
              color="pending"
            />
          </div>
        )}

        {/* Main Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-200">
          {loading ? (
            viewMode === 'table' ? <TableSkeleton /> : (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-40 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            )
          ) : error ? (
            <ErrorState error={error} onRetry={fetchUsers} />
          ) : filteredUsers.length === 0 ? (
            <EmptyState hasFilters={!!(searchTerm || roleFilter !== 'all')} onRefresh={fetchUsers} />
          ) : (
            <>
              {viewMode === 'table' ? (
                <UserTable users={filteredUsers} currentUserId={currentUser?.id} />
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {filteredUsers.map((user) => (
                        <UserCard
                          key={user.id}
                          user={user}
                          isCurrentUser={user.id === currentUser?.id}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
              
              {/* Results count */}
              <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {filteredUsers.length} of {users.length} employees
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentDashboard;