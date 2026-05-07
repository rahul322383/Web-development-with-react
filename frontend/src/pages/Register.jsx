import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Briefcase,
  DollarSign,
  Users,
  ChevronLeft,
  Building2,
  Shield,
  AlertCircle,
  ArrowRight,
  Scale,
  Lock as LockIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Reusable Input Field Component
const InputField = ({
  label,
  type = 'text',
  icon: Icon,
  error,
  touched,
  floating = true,
  showPasswordToggle,
  onTogglePassword,
  showPassword,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value);

  React.useEffect(() => {
    setHasValue(!!props.value);
  }, [props.value]);

  return (
    <div className="relative">
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <Icon className={`w-5 h-5 transition-colors duration-200 ${error && touched
              ? 'text-rose-500'
              : isFocused
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400'
              }`} />
          </div>
        )}

        <input
          type={showPassword ? 'text' : type}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full px-4 py-3.5 bg-white dark:bg-slate-900
            border-2 rounded-xl outline-none transition-all duration-200
            ${Icon ? 'pl-10' : 'pl-4'}
            ${showPasswordToggle ? 'pr-12' : 'pr-4'}
            ${error && touched
              ? 'border-rose-500 focus:border-rose-500 ring-4 ring-rose-500/10'
              : isFocused
                ? 'border-indigo-600 dark:border-indigo-400 ring-4 ring-indigo-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }
            text-slate-900 dark:text-white placeholder-transparent
            transition-all duration-200
          `}
          placeholder={label}
          autoComplete="off"
          {...props}
        />

        {floating && (
          <label
            className={`
              absolute left-10 transition-all duration-200 pointer-events-none
              ${isFocused || hasValue
                ? 'text-xs -top-6 left-0 text-slate-500 dark:text-slate-400'
                : 'top-1/2 -translate-y-1/2 text-slate-400'
              }
              ${error && touched && !isFocused ? 'text-rose-500' : ''}
            `}
          >
            {label}
            {props.required && <span className="text-rose-500 ml-1">*</span>}
          </label>
        )}

        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      <AnimatePresence>
        {error && touched && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-rose-500 text-sm mt-2 flex items-center gap-1"
          >
            <AlertCircle className="w-4 h-4" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

// Password Strength Indicator
const PasswordStrength = ({ password }) => {
  const getStrength = (pass) => {
    let score = 0;
    if (!pass) return 0;
    if (pass.length >= 8) score += 1;
    if (pass.match(/[a-z]/)) score += 1;
    if (pass.match(/[A-Z]/)) score += 1;
    if (pass.match(/[0-9]/)) score += 1;
    // Symbol is optional but gives extra point
    if (pass.match(/[^a-zA-Z0-9]/)) score += 1;
    return Math.min(score, 5);
  };

  const strength = getStrength(password);
  const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColor = [
    'bg-rose-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-green-500',
    'bg-emerald-500'
  ];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-3"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(strength / 5) * 100}%` }}
            className={`h-full ${strengthColor[strength - 1] || 'bg-slate-300'}`}
          />
        </div>
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {strengthText[strength - 1]}
        </span>
      </div>
      <p className="text-xs text-slate-500 dark:text-slate-500">
        At least 8 characters with uppercase, lowercase, and a number
      </p>
    </motion.div>
  );
};

// Main Component
const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    employeeCode: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: '',
    department: '',
    baseSalary: '',
    managerId: ''
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  const roles = ['Employee', 'Manager', 'HR', 'Finance', 'Admin'];
  const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'];

  const validateField = (name, value) => {
    switch (name) {
      case 'employeeCode':
        return !value ? 'Employee code is required' : '';
      case 'firstName':
        return !value ? 'First name is required' : '';
      case 'lastName':
        return !value ? 'Last name is required' : '';
      case 'email':
        if (!value) return 'Email is required';
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' : '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (value.length > 64) return 'Password must be at most 64 characters';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
        return '';
      case 'role':
        return !value ? 'Role is required' : '';
      case 'department':
        return !value ? 'Department is required' : '';
      case 'baseSalary':
        if (value && (isNaN(value) || parseFloat(value) <= 0)) {
          return 'Salary must be a positive number';
        }
        return '';
      case 'managerId':
        if (value && isNaN(value)) return 'Manager ID must be a number';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const requiredFields = ['employeeCode', 'firstName', 'lastName', 'email', 'password', 'role', 'department'];
    requiredFields.forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });
    if (formData.baseSalary) {
      const error = validateField('baseSalary', formData.baseSalary);
      if (error) newErrors.baseSalary = error;
    }
    if (formData.managerId) {
      const error = validateField('managerId', formData.managerId);
      if (error) newErrors.managerId = error;
    }
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = {};
    const requiredFields = ['employeeCode', 'firstName', 'lastName', 'email', 'password', 'role', 'department'];
    requiredFields.forEach(key => { allTouched[key] = true; });
    setTouched(allTouched);

    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.values(formErrors).some(error => error)) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const submitData = {
        employeeCode: formData.employeeCode,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        department: formData.department
      };

      if (formData.baseSalary) {
        submitData.baseSalary = parseFloat(formData.baseSalary);
      }

      if (formData.role === 'Employee' && formData.managerId) {
        submitData.managerId = parseInt(formData.managerId, 10);
      }

      const result = await register(submitData);

      if (result.success) {
        toast.success('Registration successful! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 relative overflow-hidden">

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-900/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 dark:bg-pink-900/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-8 sm:py-12">
        {/* Navigation Bar */}
        <div className="mb-6 flex items-center justify-between">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate(-1)}
            className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            Back
          </motion.button>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">

            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Employee Registration
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Create a new employee account to get started
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8" autoComplete="off">
              {/* Personal Information */}
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Personal Information
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <InputField
                    label="Employee Code"
                    name="employeeCode"
                    value={formData.employeeCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={errors.employeeCode}
                    touched={touched.employeeCode}
                    required
                    autoComplete="off"
                  />

                  <InputField
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    icon={User}
                    error={errors.firstName}
                    touched={touched.firstName}
                    required
                  />

                  <InputField
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    icon={User}
                    error={errors.lastName}
                    touched={touched.lastName}
                    required
                  />

                  <InputField
                    label="Email Address"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    icon={Mail}
                    error={errors.email}
                    touched={touched.email}
                    required
                  />

                  <div className="md:col-span-2">
                    <InputField
                      label="Password"
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      icon={Lock}
                      error={errors.password}
                      touched={touched.password}
                      showPasswordToggle
                      showPassword={showPassword}
                      onTogglePassword={() => setShowPassword(!showPassword)}
                      required
                      autoComplete="new-password"
                    />
                    <PasswordStrength password={formData.password} />
                  </div>
                </div>
              </div>

              {/* Work Details */}
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4" />
                  Work Details
                </h2>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                      <Shield className="w-5 h-5 text-slate-400" />
                    </div>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3.5 pl-10 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer text-slate-900 dark:text-white"
                      autoComplete="off"
                    >
                      <option value="">Select Role</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <label className="absolute text-xs -top-6 left-0 text-slate-500 dark:text-slate-400">
                      Role <span className="text-rose-500">*</span>
                    </label>
                    {errors.role && touched.role && (
                      <p className="text-rose-500 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.role}
                      </p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
                      <Building2 className="w-5 h-5 text-slate-400" />
                    </div>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className="w-full px-4 py-3.5 pl-10 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-600 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all appearance-none cursor-pointer text-slate-900 dark:text-white"
                      autoComplete="off"
                    >
                      <option value="">Select Department</option>
                      {departments.map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                    <label className="absolute text-xs -top-6 left-0 text-slate-500 dark:text-slate-400">
                      Department <span className="text-rose-500">*</span>
                    </label>
                    {errors.department && touched.department && (
                      <p className="text-rose-500 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.department}
                      </p>
                    )}
                  </div>

                  <InputField
                    label="Base Salary (Optional)"
                    type="number"
                    name="baseSalary"
                    value={formData.baseSalary}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    icon={DollarSign}
                    error={errors.baseSalary}
                    touched={touched.baseSalary}
                  />

                  {formData.role === 'Employee' && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <InputField
                        label="Manager ID (Optional)"
                        name="managerId"
                        value={formData.managerId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        icon={Users}
                        error={errors.managerId}
                        touched={touched.managerId}
                      />
                    </motion.div>
                  )}
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full relative group px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>

              {/* Footer Links */}
              <div className="mt-8 space-y-4">
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                  Already have an account?{' '}
                  <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
                    Sign in
                  </Link>
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500">
                  <Link to="/privacy" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    Privacy Policy
                  </Link>
                  <span>•</span>
                  <Link to="/terms" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                    <Scale className="w-3 h-3" />
                    Terms of Service
                  </Link>
                  <span>•</span>
                  <Link to="/security" className="hover:text-indigo-600 transition-colors flex items-center gap-1">
                    <LockIcon className="w-3 h-3" />
                    Security
                  </Link>
                </div>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;