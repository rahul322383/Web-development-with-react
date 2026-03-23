import React, { useEffect, useState } from 'react';
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
import { Search, UserPlus, Edit, Trash2, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { toast } from 'sonner';
import { userApi } from '../api/userApi';

// Create missing components locally
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
  <div className={`flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-sm font-medium ${className}`}>
    {children}
  </div>
);

const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => onOpenChange?.(false)} 
      />
      <div className="relative z-50 bg-white rounded-xl shadow-xl max-w-md w-full mx-auto animate-in fade-in zoom-in duration-200">
        {children}
      </div>
    </div>
  );
};

const DialogContent = ({ children, className }) => (
  <div className={className}>
    {children}
  </div>
);

const DialogHeader = ({ children }) => (
  <div className="px-6 pt-6 pb-4 border-b border-slate-200">
    {children}
  </div>
);

const DialogTitle = ({ children }) => (
  <h2 className="text-xl font-semibold text-slate-900">
    {children}
  </h2>
);

const DialogDescription = ({ children }) => (
  <p className="text-sm text-slate-500 mt-1">
    {children}
  </p>
);

const DialogFooter = ({ children }) => (
  <div className="px-6 py-4 bg-slate-50 rounded-b-xl flex flex-col-reverse sm:flex-row justify-end gap-2">
    {children}
  </div>
);

const AlertDialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={() => onOpenChange?.(false)} 
      />
      <div className="relative z-50 bg-white rounded-xl shadow-xl max-w-md w-full mx-auto animate-in fade-in zoom-in duration-200">
        {children}
      </div>
    </div>
  );
};

const AlertDialogContent = ({ children }) => (
  <div>
    {children}
  </div>
);

const AlertDialogHeader = ({ children }) => (
  <div className="px-6 pt-6 pb-4">
    {children}
  </div>
);

const AlertDialogTitle = ({ children }) => (
  <h2 className="text-xl font-semibold text-slate-900">
    {children}
  </h2>
);

const AlertDialogDescription = ({ children }) => (
  <p className="text-sm text-slate-500 mt-2">
    {children}
  </p>
);

const AlertDialogFooter = ({ children }) => (
  <div className="px-6 py-4 bg-slate-50 rounded-b-xl flex flex-col-reverse sm:flex-row justify-end gap-2">
    {children}
  </div>
);

const AlertDialogCancel = ({ onClick, children, disabled }) => (
  <Button type="button" variant="outline" onClick={onClick} disabled={disabled}>
    {children}
  </Button>
);

const AlertDialogAction = ({ onClick, className, children, disabled }) => (
  <Button 
    onClick={onClick} 
    className={className}
    disabled={disabled}
  >
    {children}
  </Button>
);

const Select = ({ value, onValueChange, children, ...props }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (child?.type === SelectTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            value: child.props.children || value,
            ...props
          });
        }
        if (child?.type === SelectContent && isOpen) {
          return React.cloneElement(child, {
            onSelect: (newValue) => {
              onValueChange?.(newValue);
              setIsOpen(false);
            }
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = ({ children, className, onClick, id, value, ...props }) => (
  <button
    type="button"
    id={id}
    onClick={onClick}
    className={`flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-400 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors ${className || ''}`}
    {...props}
  >
    <span className={!value ? 'text-slate-400' : ''}>
      {children || 'Select an option'}
    </span>
    <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  </button>
);

const SelectValue = ({ placeholder, children }) => (
  <span>{children || placeholder}</span>
);

const SelectContent = ({ children, onSelect }) => (
  <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg py-1 max-h-60 overflow-auto">
    {React.Children.map(children, child => {
      if (child?.type === SelectItem) {
        return React.cloneElement(child, {
          onClick: () => onSelect?.(child.props.value)
        });
      }
      return child;
    })}
  </div>
);

const SelectItem = ({ value, children, onClick }) => (
  <div
    className="px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer transition-colors"
    onClick={onClick}
  >
    {children}
  </div>
);

// Helper function to get full name
const getFullName = (user) => {
  return `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
};

// Helper function to get initials
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

// Helper function to get primary role
const getPrimaryRole = (user) => {
  if (user.Roles && user.Roles.length > 0) {
    return user.Roles[0].name || 'Employee';
  }
  return 'Employee';
};

// Role badge color mapping
const getRoleBadgeVariant = (role) => {
  const variants = {
    Admin: 'purple',
    HR: 'info',
    Manager: 'success',
    Employee: 'default',
    Finance: 'warning'
  };
  return variants[role] || 'default';
};

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
    role: 'Employee',
    department: '',
    position: '',
    employeeCode: '',
    baseSalary: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.getUsers();
      // Handle the response structure { data: [...], pagination: {...} }
      if (response && response.data) {
        setUsers(response.data);
        setPagination(response.pagination || {
          total: response.data.length,
          page: 1,
          limit: 20,
          totalPages: 1
        });
      } else if (Array.isArray(response)) {
        // Fallback if API returns array directly
        setUsers(response);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users. Please try again.');
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
    return true;
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const newUser = await userApi.createUser(formData);
      toast.success('User created successfully');
      setIsCreateModalOpen(false);
      resetForm();
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(error.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      const updatedUser = await userApi.updateUser(selectedUser.id, formData);
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
      resetForm();
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(error.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    setSubmitting(true);
    try {
      await userApi.deleteUser(selectedUser.id);
      toast.success('User deleted successfully');
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      role: getPrimaryRole(user),
      department: user.department || '',
      position: user.position || '',
      employeeCode: user.employeeCode || '',
      baseSalary: user.baseSalary || ''
    });
    setIsEditModalOpen(true);
  };

  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      role: 'Employee',
      department: '',
      position: '',
      employeeCode: '',
      baseSalary: ''
    });
    setSelectedUser(null);
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
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || 
           email.includes(query) || 
           department.includes(query);
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
              placeholder="Search by name, email, or department..."
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
                                <AvatarFallback className="bg-indigo-100 text-indigo-600">
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
                            <Badge variant={getRoleBadgeVariant(role)}>
                              {role}
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
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" data-testid={`user-actions-${user.id}`}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem 
                                  onClick={() => openEditModal(user)} 
                                  data-testid={`user-edit-${user.id}`}
                                >
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => openDeleteDialog(user)} 
                                  className="text-rose-600 focus:text-rose-600"
                                  data-testid={`user-delete-${user.id}`}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
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
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent data-testid="create-user-modal">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account for your organization
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateUser}>
              <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="create-firstName">First Name *</Label>
                  <Input
                    id="create-firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                    disabled={submitting}
                    data-testid="create-user-firstName-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-lastName">Last Name</Label>
                  <Input
                    id="create-lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    disabled={submitting}
                    data-testid="create-user-lastName-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-email">Email *</Label>
                  <Input
                    id="create-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                    disabled={submitting}
                    data-testid="create-user-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-role">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger id="create-role" data-testid="create-user-role-select">
                      <SelectValue>{formData.role}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Employee">Employee</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-department">Department</Label>
                  <Input
                    id="create-department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Enter department"
                    disabled={submitting}
                    data-testid="create-user-department-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-employeeCode">Employee Code</Label>
                  <Input
                    id="create-employeeCode"
                    name="employeeCode"
                    value={formData.employeeCode}
                    onChange={handleChange}
                    placeholder="Enter employee code"
                    disabled={submitting}
                    data-testid="create-user-employeeCode-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="create-baseSalary">Base Salary</Label>
                  <Input
                    id="create-baseSalary"
                    name="baseSalary"
                    type="number"
                    step="0.01"
                    value={formData.baseSalary}
                    onChange={handleChange}
                    placeholder="Enter base salary"
                    disabled={submitting}
                    data-testid="create-user-baseSalary-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={submitting}
                  data-testid="create-user-submit"
                >
                  {submitting ? 'Creating...' : 'Create User'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent data-testid="edit-user-modal">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditUser}>
              <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name *</Label>
                  <Input
                    id="edit-firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                    required
                    disabled={submitting}
                    data-testid="edit-user-firstName-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                    disabled={submitting}
                    data-testid="edit-user-lastName-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email address"
                    required
                    disabled={submitting}
                    data-testid="edit-user-email-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-role">Role</Label>
                  <Select 
                    value={formData.role} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger id="edit-role" data-testid="edit-user-role-select">
                      <SelectValue>{formData.role}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Employee">Employee</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-department">Department</Label>
                  <Input
                    id="edit-department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="Enter department"
                    disabled={submitting}
                    data-testid="edit-user-department-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-employeeCode">Employee Code</Label>
                  <Input
                    id="edit-employeeCode"
                    name="employeeCode"
                    value={formData.employeeCode}
                    onChange={handleChange}
                    placeholder="Enter employee code"
                    disabled={submitting}
                    data-testid="edit-user-employeeCode-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-baseSalary">Base Salary</Label>
                  <Input
                    id="edit-baseSalary"
                    name="baseSalary"
                    type="number"
                    step="0.01"
                    value={formData.baseSalary}
                    onChange={handleChange}
                    placeholder="Enter base salary"
                    disabled={submitting}
                    data-testid="edit-user-baseSalary-input"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetForm();
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  disabled={submitting}
                  data-testid="edit-user-submit"
                >
                  {submitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent data-testid="delete-user-dialog">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete <span className="font-semibold text-slate-900">{selectedUser ? getFullName(selectedUser) : ''}</span>? 
                This action cannot be undone and all associated data will be permanently removed.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setSelectedUser(null)} disabled={submitting}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteUser}
                className="bg-rose-600 hover:bg-rose-700 focus:ring-rose-600"
                disabled={submitting}
                data-testid="delete-user-confirm"
              >
                {submitting ? 'Deleting...' : 'Delete User'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};