// DepartmentDashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserCheck,
  Briefcase,
  Search,
  Grid,
  List,
  RefreshCw,
  Filter,
  X,
  Building2,
  ChevronDown
} from 'lucide-react';
import { userApi } from '../api/userApi';
import {
  LoadingSpinner,
  StatCard,
  StatCardSkeleton,
  TableSkeleton,
  EmptyState,
  ErrorState,
  UserCard,
  UserTable
} from '../components/ui/StatCardSkeleton';

const DepartmentDashboard = () => {
  // State
  const [selectedDepartment, setSelectedDepartment] = useState('Engineering');
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
  const [showFilters, setShowFilters] = useState(false);
  const [availableDepartments, setAvailableDepartments] = useState([]);

  // --- Department list (can be fetched from an API or hardcoded) ---
  const departmentList = useMemo(() => [
    { id: 'Engineering', name: 'Engineering', icon: '⚙️' },
    { id: 'Marketing', name: 'Marketing', icon: '📢' },
    { id: 'Sales', name: 'Sales', icon: '📊' },
    { id: 'Finance', name: 'Finance', icon: '💰' },
    { id: 'HR', name: 'Human Resources', icon: '👥' },
    { id: 'Operations', name: 'Operations', icon: '🔧' }
  ], []);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users by department using your userApi
  const fetchUsersByDepartment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the API endpoint (e.g., /users/department/Engineering)
      const response = await userApi.getUsersByDepartment(selectedDepartment);

      // Handle different possible response shapes (array, or { data: [] })
      let userList = [];
      if (Array.isArray(response)) {
        userList = response;
      } else if (response?.data && Array.isArray(response.data)) {
        userList = response.data;
      } else if (response?.users) {
        userList = response.users;
      }

      // Transform backend snake_case to frontend camelCase
      const transformed = userList.map(u => ({
        id: u.id,
        employeeCode: u.employee_code,
        roleId: u.role_id,
        firstName: u.first_name,
        lastName: u.last_name,
        email: u.email,
        managerId: u.manager_id,
        department: u.department,
        baseSalary: u.base_salary,
        isActive: u.is_active === 1 || u.is_active === true,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
        role: getRoleFromId(u.role_id) // helper to get role string
      }));

      setUsers(transformed);
    } catch (err) {
      console.error('Error fetching department users:', err);
      setError(err.message || 'Failed to load department data');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDepartment]);

  useEffect(() => {
    fetchUsersByDepartment();
  }, [fetchUsersByDepartment]);

  // Window resize → switch view mode
  useEffect(() => {
    const handleResize = () => {
      setViewMode(window.innerWidth < 768 ? 'grid' : 'table');
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Helper: role id → string
  const getRoleFromId = (roleId) => {
    switch (roleId) {
      case 1: return 'employee';
      case 2: return 'manager';
      case 5: return 'admin';
      default: return 'unknown';
    }
  };

  // Filter and search
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (roleFilter !== 'all' && user.role !== roleFilter) return false;
      if (debouncedSearchTerm) {
        const term = debouncedSearchTerm.toLowerCase();
        const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
        return fullName.includes(term) || user.email.toLowerCase().includes(term);
      }
      return true;
    });
  }, [users, roleFilter, debouncedSearchTerm]);

  // Stats
  const stats = useMemo(() => ({
    totalEmployees: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    managementUsers: users.filter(u => u.role === 'manager' || u.role === 'admin').length
  }), [users]);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setDebouncedSearchTerm('');
    setShowFilters(false);
  };

  // Get current department label
  const currentDeptLabel = departmentList.find(d => d.id === selectedDepartment)?.name || selectedDepartment;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-600" />
                Department Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage employees by department
              </p>
            </div>
            <button
              onClick={fetchUsersByDepartment}
              className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Department Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 pb-2 min-w-max">
            {departmentList.map((dept) => (
              <button
                key={dept.id}
                onClick={() => setSelectedDepartment(dept.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${selectedDepartment === dept.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
              >
                <span>{dept.icon}</span>
                <span>{dept.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${showFilters || roleFilter !== 'all' || searchTerm
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700'
              }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {(roleFilter !== 'all' || searchTerm) && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                {(roleFilter !== 'all' ? 1 : 0) + (searchTerm ? 1 : 0)}
              </span>
            )}
          </button>

          {/* View Toggle */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-all ${viewMode === 'grid'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-md transition-all ${viewMode === 'table'
                  ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Filter by Role
                    </label>
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full sm:w-48 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Roles</option>
                      <option value="admin">Admin</option>
                      <option value="manager">Manager</option>
                      <option value="employee">Employee</option>
                    </select>
                  </div>

                  {(roleFilter !== 'all' || searchTerm) && (
                    <button
                      onClick={clearFilters}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
        ) : !error && users.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatCard icon={Users} title="Total Employees" value={stats.totalEmployees} color="total" />
            <StatCard icon={UserCheck} title="Active Users" value={stats.activeUsers} color="approved" />
            <StatCard icon={Briefcase} title="Management" value={stats.managementUsers} color="pending" />
          </div>
        )}

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            viewMode === 'table' ? <TableSkeleton /> : (
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-48 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
                  ))}
                </div>
              </div>
            )
          ) : error ? (
            <ErrorState error={error} onRetry={fetchUsersByDepartment} />
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              hasFilters={!!(searchTerm || roleFilter !== 'all')}
              onRefresh={clearFilters}
            />
          ) : (
            <>
              {viewMode === 'table' ? (
                <UserTable users={filteredUsers} currentUserId={null} />
              ) : (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                      {filteredUsers.map((user) => (
                        <UserCard key={user.id} user={user} isCurrentUser={false} />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Showing {filteredUsers.length} of {users.length} employees in {currentDeptLabel}
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