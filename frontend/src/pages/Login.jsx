import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LogIn,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

// ─── Constants ─────────────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const AUTOCOMPLETE_MAP = { email: 'email', password: 'current-password' };

// ─── Validation ────────────────────────────────────────────────────────────────

const validateField = (name, value) => {
  switch (name) {
    case 'email':
      if (!value) return 'Email is required';
      return EMAIL_RE.test(value) ? '' : 'Invalid email format';
    case 'password':
      if (!value) return 'Password is required';
      return value.length < 6 ? 'At least 6 characters required' : '';
    default:
      return '';
  }
};

// ─── Input ─────────────────────────────────────────────────────────────────────

const Input = React.memo(({
  label,
  type = 'text',
  icon: Icon,
  error,
  touched,
  showPasswordToggle,
  onTogglePassword,
  showPassword,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const hasValue = Boolean(props.value);
  const isFloated = isFocused || hasValue;
  const isError = error && touched;

  const borderClass = isError
    ? 'border-red-400 ring-2 ring-red-400/20'
    : isFocused
      ? 'border-violet-500 ring-2 ring-violet-500/15'
      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600';

  return (
    <div className="relative pt-5">
      <label
        className={`
          absolute left-0 pointer-events-none transition-all duration-200 font-medium
          ${isFloated
            ? 'top-0 text-xs text-slate-500 dark:text-slate-400'
            : `top-1/2 -translate-y-1/2 translate-y-[10px] text-sm
                 ${Icon ? 'left-10' : 'left-4'} text-slate-400`
          }
          ${isError && !isFocused ? 'text-red-500' : ''}
        `}
      >
        {label}
        {props.required && <span className="text-red-400 ml-0.5">*</span>}
      </label>

      <div className="relative">
        {Icon && (
          <Icon
            className={`
              absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200
              ${isError ? 'text-red-400' : isFocused ? 'text-violet-500' : 'text-slate-400'}
            `}
          />
        )}

        <input
          type={showPassword ? 'text' : type}
          autoComplete={AUTOCOMPLETE_MAP[type] ?? 'off'}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            w-full py-3 bg-white dark:bg-slate-900 border rounded-xl outline-none
            text-slate-900 dark:text-white placeholder-transparent text-sm
            transition-all duration-200
            ${Icon ? 'pl-10' : 'pl-4'}
            ${showPasswordToggle ? 'pr-11' : 'pr-4'}
            ${borderClass}
          `}
          placeholder={label}
          {...props}
        />

        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {isError && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-xs mt-1.5 flex items-center gap-1"
        >
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </motion.p>
      )}
    </div>
  );
});

// ─── Loading Spinner ───────────────────────────────────────────────────────────

const FullPageSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  }, []);

  const handleBlur = useCallback((e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, e.target.value),
    }));
  }, []);

  const togglePassword = useCallback(() => setShowPassword((p) => !p), []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (loading) return;

      setTouched({ email: true, password: true });

      const newErrors = {
        email: validateField('email', formData.email),
        password: validateField('password', formData.password),
      };
      setErrors(newErrors);

      if (newErrors.email || newErrors.password) {
        toast.error('Please fix the errors before submitting');
        return;
      }

      setLoading(true);
      try {
        const result = await login(formData);
        if (!result.success) {
          toast.error(
            result.error?.response?.data?.message ||
            'Login failed. Please check your credentials.'
          );
          if (result.error?.response?.data?.errors) {
            setErrors(result.error.response.data.errors);
          }
        }
      } catch {
        toast.error('An unexpected error occurred. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    [loading, formData, login]
  );

  // ─── Back button handler ───────────────────────────────────────────────────
  const handleBack = useCallback(() => {
    // If there's a previous entry, go back; otherwise go home
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  // Shared field props factory
  const field = (name) => ({
    name,
    value: formData[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: errors[name],
    touched: touched[name],
  });

  if (isLoading) return <FullPageSpinner />;
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex items-center justify-center px-4">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-violet-500/6 dark:bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/5 dark:bg-indigo-500/8 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #64748b 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />
      </div>

      {/* Back button – fixed at top‑left on desktop, top‑right on mobile */}
      <button
        onClick={handleBack}
        aria-label="Go back"
        className="
          fixed z-50 top-4 right-4 sm:top-6 sm:left-6 sm:right-auto
          w-10 h-10 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm
          border border-slate-200 dark:border-slate-800 shadow-lg
          flex items-center justify-center
          text-slate-600 dark:text-slate-300
          hover:bg-white dark:hover:bg-slate-800 transition-all
        "
      >
        <ArrowLeft className="w-5 h-5" />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2.5 group"
          >
            <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:shadow-xl group-hover:shadow-violet-500/35 transition-all">
              <span className="text-white font-bold text-2xl leading-none">
                H
              </span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
              HRMS
            </span>
          </Link>
        </motion.div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/60 dark:shadow-slate-950/60 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-7 pb-5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center flex-shrink-0">
              <LogIn className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Welcome back
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                Sign in to your HRMS account
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="p-8 space-y-5">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              required
              {...field('email')}
            />
            <Input
              label="Password"
              type="password"
              icon={Lock}
              required
              showPasswordToggle
              showPassword={showPassword}
              onTogglePassword={togglePassword}
              {...field('password')}
            />

            <div className="flex justify-end -mt-1">
              <Link
                to="/forgot-password"
                className="text-xs text-violet-600 dark:text-violet-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="
                w-full py-3.5 rounded-xl font-semibold text-sm text-white
                bg-gradient-to-r from-violet-600 to-indigo-600
                hover:from-violet-500 hover:to-indigo-500
                shadow-lg shadow-violet-500/25 hover:shadow-xl hover:shadow-violet-500/30
                disabled:opacity-60 disabled:cursor-not-allowed
                transition-all duration-200 flex items-center justify-center gap-2
              "
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            <p className="text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-violet-600 dark:text-violet-400 font-medium hover:underline"
              >
                Sign up for free
              </Link>
            </p>
          </form>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-4">
            {['Privacy', 'Terms', 'Help'].map((item, i) => (
              <React.Fragment key={item}>
                {i > 0 && (
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                )}
                <Link
                  to={`/${item.toLowerCase()}`}
                  className="text-xs text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
                >
                  {item}
                </Link>
              </React.Fragment>
            ))}
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} HRMS. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;