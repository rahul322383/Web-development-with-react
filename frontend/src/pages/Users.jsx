import React, { useEffect, useState, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/Table.jsx';
import { Search, UserPlus, Edit, Trash2, MoreVertical, X, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { userApi } from '../api/userApi';
import useAuthStore from '../store/authStore';

// Constants
const ROLES = [
  { value: 'Employee', label: 'Employee', badgeVariant: 'default' },
  { value: 'Manager', label: 'Manager', badgeVariant: 'success' },
  { value: 'HR', label: 'HR', badgeVariant: 'info' },
  { value: 'Admin', label: 'Admin', badgeVariant: 'purple' },
  { value: 'Finance', label: 'Finance', badgeVariant: 'warning' }
];

const AVATAR_COLORS = [
  'bg-indigo-100 text-indigo-600',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-purple-100 text-purple-700',
  'bg-blue-100 text-blue-700'
];

// Improved Dropdown Menu Component
const DropdownMenu = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleTriggerClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <div ref={triggerRef} onClick={handleTriggerClick}>
        {trigger}
      </div>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
          {React.Children.map(children, child => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                onClick: (e) => {
                  e.stopPropagation();
                  if (child.props.onClick) {
                    child.props.onClick(e);
                  }
                  setIsOpen(false);
                }
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

const DropdownMenuItem = ({ onClick, children, className = '', disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        w-full text-left px-4 py-2 text-sm hover:bg-slate-50 transition-colors
        flex items-center gap-2
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

// Helper Functions
const getErrorMessage = (error) => {
  return error.response?.data?.message || error.message || 'Something went wrong';
};

const getFullName = (user) => {
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
};

const getInitials = (user) => {
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  
  if (firstName && lastName) {
    return (firstName[0] + lastName[0]).toUpperCase();
  } else if (firstName) {
    return firstName.slice(0, 2).toUpperCase();
  } else if (lastName) {
    return lastName.slice(0, 2).toUpperCase();
  }
  return 'U';
};

const getAvatarColor = (userId) => {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
};

const getPrimaryRole = (user) => {
  if (user.Roles && user.Roles.length > 0) {
    const roleName = user.Roles[0].name;
    const role = ROLES.find(r => r.value === roleName);
    return role || { value: 'Employee', label: 'Employee', badgeVariant: 'default' };
  }
  return ROLES.find(r => r.value === 'Employee');
};

// UI Components
const Badge = ({ children, className, variant = 'default' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-rose-100 text-rose-800',
    info: 'bg-blue-100 text-blue-800',
    purple: 'bg-purple-100 text-purple-800',
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Avatar = ({ children, className }) => (
  <div className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full ${className}`}>
    {children}
  </div>
);

const AvatarFallback = ({ children, className }) => (
  <div className={`flex h-full w-full items-center justify-center rounded-full text-sm font-medium ${className}`}>
    {children}
  </div>
);

// Reusable User Form Component
const UserForm = ({ 
  formData, 
  onChange, 
  onSubmit, 
  submitting, 
  isEdit = false,
  onCancel 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit}>
      <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            placeholder="Enter first name"
            required
            disabled={submitting}
            autoFocus
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            placeholder="Enter last name"
            disabled={submitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={onChange}
            placeholder="Enter email address"
            required
            disabled={submitting}
          />
        </div>
        
        {/* Password Field - Required for create, optional for edit */}
        <div className="space-y-2">
          <Label htmlFor="password">
            Password {!isEdit && '*'}
            {isEdit && <span className="text-xs text-slate-400 ml-2">(Leave blank to keep current password)</span>}
          </Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password || ''}
              onChange={onChange}
              placeholder={isEdit ? "Enter new password (optional)" : "Enter password"}
              required={!isEdit}
              disabled={submitting}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {!isEdit && (
            <p className="text-xs text-slate-400">Password must be at least 6 characters</p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={onChange}
            className="flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            disabled={submitting}
          >
            {ROLES.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            value={formData.department}
            onChange={onChange}
            placeholder="Enter department"
            disabled={submitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="employeeCode">Employee Code</Label>
          <Input
            id="employeeCode"
            name="employeeCode"
            value={formData.employeeCode}
            onChange={onChange}
            placeholder={isEdit ? "Enter employee code" : "Enter employee code (optional)"}
            disabled={submitting}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="baseSalary">Base Salary</Label>
          <Input
            id="baseSalary"
            name="baseSalary"
            type="number"
            step="0.01"
            value={formData.baseSalary}
            onChange={onChange}
            placeholder="Enter base salary"
            disabled={submitting}
          />
        </div>
      </div>
      
      <div className="px-6 py-4 bg-slate-50 rounded-b-xl flex flex-col-reverse sm:flex-row justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={submitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={submitting}
        >
          {submitting 
            ? (isEdit ? 'Saving...' : 'Creating...') 
            : (isEdit ? 'Save Changes' : 'Create User')
          }
        </Button>
      </div>
    </form>
  );
};

// Dialog Component
const Dialog = ({ open, onOpenChange, children, title, description }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={() => onOpenChange?.(false)} 
      />
      <div className="relative z-50 bg-white rounded-xl shadow-xl max-w-md w-full mx-auto animate-in fade-in zoom-in duration-200">
        <div className="px-6 pt-6 pb-4 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
              {description && (
                <p className="text-sm text-slate-500 mt-1">{description}</p>
              )}
            </div>
            <button
              onClick={() => onOpenChange?.(false)}
              className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
};

// Alert Dialog Component
const AlertDialog = ({ open, onOpenChange, user, onConfirm, submitting }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" 
        onClick={() => onOpenChange?.(false)} 
      />
      <div className="relative z-50 bg-white rounded-xl shadow-xl max-w-md w-full mx-auto animate-in fade-in zoom-in duration-200">
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-xl font-semibold text-slate-900">Delete User</h2>
          <p className="text-sm text-slate-500 mt-2">
            Are you sure you want to delete <span className="font-semibold text-slate-900">
              {user ? getFullName(user) : ''}
            </span>? 
            This action cannot be undone and all associated data will be permanently removed.
          </p>
        </div>
        <div className="px-6 py-4 bg-slate-50 rounded-b-xl flex flex-col-reverse sm:flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            className="bg-rose-600 hover:bg-rose-700 focus:ring-rose-600"
            disabled={submitting}
          >
            {submitting ? 'Deleting...' : 'Delete User'}
          </Button>
        </div>
      </div>
    </div>
  );
};

// Main Users Component
export const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1
  });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Employee',
    department: '',
    employeeCode: '',
    baseSalary: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { user: currentUser } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getUsers(); // Handle response - it's already an array
      if (Array.isArray(response)) {
        setUsers(response);
        setPagination({
          total: response.length,
          page: 1,
          limit: 20,
          totalPages: Math.ceil(response.length / 20)
        });
      } else if (response && response.data) {
        setUsers(response.data);
        setPagination(response.pagination || {
          total: response.data.length,
          page: 1,
          limit: 20,
          totalPages: Math.ceil(response.data.length / 20)
        });
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(getErrorMessage(error));
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.firstName?.trim()) {
      toast.error('First name is required');
      return false;
    }
    if (!formData.email?.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }
    // Password validation only for create
    if (!isEditModalOpen && (!formData.password || formData.password.length < 6)) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const prepareUserData = () => {
    const userData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName?.trim() || '',
      email: formData.email.trim(),
      department: formData.department?.trim() || '',
      employeeCode: formData.employeeCode?.trim() || `EMP${Date.now()}`,
      baseSalary: parseFloat(formData.baseSalary) || 0,
      role: formData.role,
      isActive: true,
      managerId: currentUser?.id || 1
    };
    
    // Only include password if it's provided
    if (formData.password && formData.password.trim()) {
      userData.password = formData.password.trim();
    }
    
    return userData;
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'Employee',
      department: '',
      employeeCode: '',
      baseSalary: ''
    });
    setSelectedUser(null);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const userData = prepareUserData();
      await userApi.createUser(userData);
      
      toast.success('User created successfully');
      setIsCreateModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const userData = prepareUserData();
      await userApi.updateUser(selectedUser.id, userData);
      
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setSubmitting(true);
    try {
      await userApi.deleteUser(selectedUser.id);
      toast.success('User deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    const role = getPrimaryRole(user);
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '', // Don't populate password for security
      role: role.value,
      department: user.department || '',
      employeeCode: user.employeeCode || '',
      baseSalary: user.baseSalary ? String(user.baseSalary) : ''
    });
    setIsEditModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const fullName = getFullName(user).toLowerCase();
    const email = (user.email || '').toLowerCase();
    const department = (user.department || '').toLowerCase();
    const employeeCode = (user.employeeCode || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || 
           email.includes(query) || 
           department.includes(query) ||
           employeeCode.includes(query);
  });

  return (
    <div className="min-h-screen bg-slate-50" data-testid="users-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold font-heading tracking-tight text-slate-900 mb-2">
            User Management
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Manage your organization's employees and their information
          </p>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="search"
              placeholder="Search by name, email, department, or employee code..."
              className="pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="users-search-input"
            />
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
            data-testid="users-create-button"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-600 mt-4">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold whitespace-nowrap">User</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Employee Code</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap">Role</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap hidden md:table-cell">Department</TableHead>
                    <TableHead className="font-semibold whitespace-nowrap hidden lg:table-cell">Status</TableHead>
                    <TableHead className="text-right font-semibold whitespace-nowrap">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 sm:py-12 text-slate-500">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => {
                      const role = getPrimaryRole(user);
                      return (
                        <TableRow key={user.id} data-testid={`user-row-${user.id}`}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="hidden xs:flex">
                                <AvatarFallback className={getAvatarColor(user.id)}>
                                  {getInitials(user)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium text-slate-900">{getFullName(user)}</p>
                                <p className="text-xs sm:text-sm text-slate-500 truncate max-w-[150px] sm:max-w-none">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm font-mono text-slate-600">
                              {user.employeeCode || 'N/A'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant={role.badgeVariant}>
                              {role.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-700">
                            {user.department || 'N/A'}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <Badge variant={user.isActive ? 'success' : 'danger'}>
                              {user.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu
                              trigger={
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  data-testid={`user-actions-${user.id}`}
                                  className="hover:bg-slate-100"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              }
                            >
                              <DropdownMenuItem 
                                onClick={() => openEditModal(user)}
                                className="hover:bg-slate-50"
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
                                  setIsDeleteDialogOpen(true);
                                }}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination Info */}
          {!loading && users.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-600">
                Showing {filteredUsers.length} of {pagination.total} users
              </p>
            </div>
          )}
        </div>

        {/* Create User Modal */}
        <Dialog
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          title="Add New User"
          description="Create a new user account for your organization"
        >
          <UserForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleCreateUser}
            submitting={submitting}
            isEdit={false}
            onCancel={() => {
              setIsCreateModalOpen(false);
              resetForm();
            }}
          />
        </Dialog>

        {/* Edit User Modal */}
        <Dialog
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          title="Edit User"
          description="Update user information"
        >
          <UserForm
            formData={formData}
            onChange={handleChange}
            onSubmit={handleEditUser}
            submitting={submitting}
            isEdit={true}
            onCancel={() => {
              setIsEditModalOpen(false);
              resetForm();
            }}
          />
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          user={selectedUser}
          onConfirm={handleDeleteUser}
          submitting={submitting}
        />
      </div>
    </div>
  );
};