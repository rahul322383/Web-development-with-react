
// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import { Button } from '../components/ui/button';
// import { Input } from '../components/ui/input';
// import { Label } from '../components/ui/label';
// import { toast } from 'sonner';
// import { LogIn } from 'lucide-react';

// export default function Login() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const { login } = useAuth();
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await login(email, password);
//       toast.success('Login successful!');
//       navigate('/dashboard');
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Login failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen flex">
//       <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
//         <div className="w-full max-w-md space-y-8">
//           <div>
//             <div className="flex items-center gap-3 mb-8">
//               <div className="w-12 h-12 rounded-md bg-[#002FA7] flex items-center justify-center text-white font-bold">
//                 HR
//               </div>
//               <div>
//                 <h2 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Manrope, sans-serif' }}>
//                   HR Management
//                 </h2>
//               </div>
//             </div>
//             <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2" style={{ fontFamily: 'Manrope, sans-serif' }}>
//               Welcome back
//             </h1>
//             <p className="text-sm text-slate-600" style={{ fontFamily: 'Inter, sans-serif' }}>
//               Sign in to access your account
//             </p>
//           </div>

//           <form data-testid="login-form" onSubmit={handleSubmit} className="space-y-6">
//             <div className="space-y-4">
//               <div>
//                 <Label htmlFor="email" className="text-sm font-medium text-slate-700">
//                   Email address
//                 </Label>
//                 <Input
//                   id="email"
//                   data-testid="email-input"
//                   type="email"
//                   required
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   className="mt-1.5"
//                   placeholder="you@example.com"
//                 />
//               </div>

//               <div>
//                 <Label htmlFor="password" className="text-sm font-medium text-slate-700">
//                   Password
//                 </Label>
//                 <Input
//                   id="password"
//                   data-testid="password-input"
//                   type="password"
//                   required
//                   value={password}
//                   onChange={(e) => setPassword(e.target.value)}
//                   className="mt-1.5"
//                   placeholder="••••••••"
//                 />
//               </div>
//             </div>

//             <Button
//               type="submit"
//               data-testid="login-submit-button"
//               disabled={loading}
//               className="w-full bg-[#002FA7] hover:bg-[#002480] text-white"
//             >
//               {loading ? (
//                 <span>Signing in...</span>
//               ) : (
//                 <>
//                   <LogIn className="w-4 h-4 mr-2" />
//                   Sign in
//                 </>
//               )}
//             </Button>

//             <div className="text-center text-sm text-slate-600">
//               Don't have an account?{' '}
//               <Link to="/register" className="font-medium text-[#002FA7] hover:underline">
//                 Register here
//               </Link>
//             </div>
//           </form>
//         </div>
//       </div>

//       <div
//         className="hidden lg:flex flex-1 items-center justify-center bg-slate-900 relative overflow-hidden"
//         style={{
//           backgroundImage: 'url(https://images.unsplash.com/photo-1610741804272-059e1d3c5dba?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NDh8MHwxfHNlYXJjaHwzfHxtb2Rlcm4lMjBvZmZpY2UlMjBhcmNoaXRlY3R1cmUlMjBhYnN0cmFjdHxlbnwwfHx8fDE3NzA5NzQ2MTR8MA&ixlib=rb-4.1.0&q=85)',
//           backgroundSize: 'cover',
//           backgroundPosition: 'center',
//         }}
//       >
//         <div className="absolute inset-0 bg-slate-900/80" />
//         <div className="relative z-10 max-w-md px-8 text-center">
//           <h2 className="text-4xl font-bold text-white mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
//             Enterprise HR Management
//           </h2>
//           <p className="text-lg text-slate-200" style={{ fontFamily: 'Inter, sans-serif' }}>
//             Streamline your workforce operations with our comprehensive HR solution
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  LogIn, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';

const Input = ({ 
  label, 
  type = 'text', 
  icon: Icon,
  error,
  touched,
  showPasswordToggle,
  onTogglePassword,
  showPassword,
  autoComplete,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value);

  React.useEffect(() => {
    setHasValue(!!props.value);
  }, [props.value]);

  const getAutoComplete = () => {
    if (autoComplete) return autoComplete;
    if (type === 'email') return 'email';
    if (type === 'password') return 'current-password';
    if (label.toLowerCase().includes('name')) return 'name';
    return 'off';
  };

  return (
    <div className="relative">
      <div className="relative">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Icon className={`w-5 h-5 transition-colors duration-200 ${
              error && touched
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
          autoComplete={getAutoComplete()}
          className={`
            w-full px-4 py-4 bg-white dark:bg-slate-900
            border-2 rounded-2xl outline-none transition-all duration-200
            ${Icon ? 'pl-12' : 'pl-4'}
            ${showPasswordToggle ? 'pr-12' : 'pr-4'}
            ${
              error && touched
                ? 'border-rose-500 focus:border-rose-500 ring-4 ring-rose-500/10'
                : isFocused
                ? 'border-indigo-600 dark:border-indigo-400 ring-4 ring-indigo-500/10'
                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }
            text-slate-900 dark:text-white placeholder-transparent
            transition-all duration-200 text-base
          `}
          placeholder={label}
          {...props}
        />

        <label
          className={`
            absolute left-12 transition-all duration-200 pointer-events-none
            ${
              isFocused || hasValue
                ? 'text-xs -top-6 left-0 text-slate-500 dark:text-slate-400'
                : 'top-1/2 -translate-y-1/2 text-slate-400'
            }
            ${error && touched && !isFocused ? 'text-rose-500' : ''}
          `}
        >
          {label}
          {props.required && <span className="text-rose-500 ml-1">*</span>}
        </label>

        {showPasswordToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>

      {error && touched && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-rose-500 text-sm mt-2 flex items-center gap-1"
        >
          <AlertCircle className="w-4 h-4" />
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Main Login Component
export const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  // Clean redirect logic - no setTimeout, no extra state
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Show loader while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Validation
  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? 'Invalid email format' : '';
      case 'password':
        if (!value) return 'Password is required';
        return value.length < 6 ? 'Password must be at least 6 characters' : '';
      default:
        return '';
    }
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
    
    if (loading) return;
    
    setTouched({ email: true, password: true });
    
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    
    if (emailError || passwordError) {
      setErrors({ email: emailError, password: passwordError });
      toast.error('Please fix the errors before submitting');
      return;
    }

    setLoading(true);

    try {
      const result = await login(formData);
      
      if (result.success) {
        
        setLoading(false);
        // useEffect will handle navigation when isAuthenticated becomes true
      } else {
        toast.error(result.error?.response?.data?.message || 'Login failed. Please check your credentials.');
        setLoading(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-950 relative overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-indigo-300 dark:bg-indigo-900/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-300 dark:bg-purple-900/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 dark:bg-pink-900/20 rounded-full mix-blend-multiply dark:mix-blend-soft-light filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http://www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />

      {/* Main Content */}
      <div className="relative container mx-auto px-4 py-8 sm:py-12 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo & Brand */}
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:shadow-xl group-hover:shadow-indigo-500/40 transition-all">
                <span className="text-white font-bold text-3xl">H</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                HRMS
              </span>
            </Link>
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl flex items-center justify-center">
                  <LogIn className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                    Welcome back
                  </h1>
                  <p className="text-slate-600 dark:text-slate-400 mt-1">
                    Sign in to your HRMS account
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Email */}
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                icon={Mail}
                error={errors.email}
                touched={touched.email}
                autoComplete="email"
                required
              />

              {/* Password */}
              <Input
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
                autoComplete="current-password"
                required
              />

              {/* Forgot Password */}
              <div className="flex items-center justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full relative group px-6 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white font-semibold text-lg shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/40 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
                <div className="absolute inset-0 -z-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>

              {/* Sign Up Link */}
              <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
                >
                  Sign up for free
                </Link>
              </p>
            </form>
          </motion.div>

          {/* Footer Links */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center gap-6 mb-4">
              <Link to="/privacy" className="text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                Privacy
              </Link>
              <span className="text-slate-300">•</span>
              <Link to="/terms" className="text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                Terms
              </Link>
              <span className="text-slate-300">•</span>
              <Link to="/help" className="text-xs text-slate-500 hover:text-indigo-600 transition-colors">
                Help
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};