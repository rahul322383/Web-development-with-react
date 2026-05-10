import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import passwordResetAPI from '../api/passwordReset.api';
import { toast } from 'sonner';
import { Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

// =============================================================================
// SHARED HELPERS
// =============================================================================

const INPUT_CLASS =
    'appearance-none rounded-lg block w-full px-3 py-2.5 border ' +
    'border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 ' +
    'text-gray-900 dark:text-white bg-white dark:bg-gray-700 ' +
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-colors';

const BTN_PRIMARY =
    'w-full flex justify-center py-2.5 px-4 rounded-xl text-sm font-medium ' +
    'text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed ' +
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors';

const validatePasswords = (newPassword, confirmPassword) => {
    if (newPassword.length < 8) {
        toast.error('Minimum 8 characters required');
        return false;
    }
    if (newPassword !== confirmPassword) {
        toast.error('Passwords do not match');
        return false;
    }
    return true;
};

// -----------------------------------------------------------------------------
// Reusable password field with show/hide toggle
// -----------------------------------------------------------------------------

const PasswordField = ({ id, label, value, onChange, placeholder, autoComplete = 'new-password' }) => {
    const [show, setShow] = useState(false);
    return (
        <div>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    id={id}
                    type={show ? 'text' : 'password'}
                    required
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={`${INPUT_CLASS} pr-10`}
                />
                <button
                    type="button"
                    onClick={() => setShow(s => !s)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
};

// -----------------------------------------------------------------------------
// Shared card wrapper
// -----------------------------------------------------------------------------

const AuthCard = ({ icon: Icon, iconBg = 'bg-indigo-100 dark:bg-indigo-900', iconColor = 'text-indigo-600 dark:text-indigo-300', title, subtitle, children }) => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md space-y-6">
            {(Icon || title) && (
                <div className="text-center space-y-3">
                    {Icon && (
                        <div className={`mx-auto h-12 w-12 rounded-full ${iconBg} flex items-center justify-center`}>
                            <Icon className={`h-6 w-6 ${iconColor}`} />
                        </div>
                    )}
                    {title && <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h2>}
                    {subtitle && <p className="text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>}
                </div>
            )}
            {children}
        </div>
    </div>
);

// =============================================================================
// 1. FORGOT PASSWORD
// =============================================================================

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await passwordResetAPI.forgotPassword(email);
            // Backend always returns success — never reveals if email exists
            toast.success(result.message ?? 'Reset link sent');
            setSent(true);
            setEmail('');
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Request failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard
            icon={Lock}
            title="Forgot password?"
            subtitle="Enter your email and we'll send you a reset link."
        >
            {sent ? (
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-400 font-medium">
                        If that email is registered, a reset link has been sent.
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Check your spam folder if you don't see it within a few minutes.
                    </p>
                    <button
                        onClick={() => setSent(false)}
                        className="text-sm text-indigo-600 hover:underline dark:text-indigo-400"
                    >
                        Try a different email
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Email address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={INPUT_CLASS}
                            placeholder="you@company.com"
                            autoComplete="email"
                        />
                    </div>
                    <button type="submit" disabled={loading} className={BTN_PRIMARY}>
                        {loading ? 'Sending…' : 'Send reset link'}
                    </button>
                    <div className="text-center">
                        <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 hover:underline">
                            ← Back to login
                        </Link>
                    </div>
                </form>
            )}
        </AuthCard>
    );
};

// =============================================================================
// 2. RESET PASSWORD  (token from email link)
// =============================================================================

export const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');
    const [tokenValid, setTokenValid] = useState(null); // null = verifying
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            toast.error('No reset token found in the link');
            return;
        }
        (async () => {
            try {
                const result = await passwordResetAPI.verifyResetToken(token);
                setTokenValid(!!result.success);
                if (!result.success) toast.error(result.message ?? 'Invalid token');
            } catch (err) {
                setTokenValid(false);
                toast.error(err.response?.data?.message ?? 'Token verification failed');
            }
        })();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePasswords(newPassword, confirmPassword)) return;
        setLoading(true);
        try {
            const result = await passwordResetAPI.resetPassword(token, newPassword);
            if (result.success) {
                toast.success('Password reset! Redirecting to login…');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                toast.error(result.message ?? 'Reset failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    // Verifying
    if (tokenValid === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Verifying reset link…</span>
                </div>
            </div>
        );
    }

    // Invalid / expired
    if (!tokenValid) {
        return (
            <AuthCard
                icon={AlertCircle}
                iconBg="bg-red-100 dark:bg-red-900/30"
                iconColor="text-red-600 dark:text-red-400"
                title="Invalid or expired link"
                subtitle="This reset link has already been used or has expired."
            >
                <div className="text-center">
                    <Link
                        to="/forgot-password"
                        className="inline-flex justify-center py-2.5 px-6 rounded-xl text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                    >
                        Request new link
                    </Link>
                </div>
            </AuthCard>
        );
    }

    return (
        <AuthCard title="Create new password" subtitle="Choose a strong password for your account.">
            <form onSubmit={handleSubmit} className="space-y-4">
                <PasswordField
                    id="new-password"
                    label="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 8 characters"
                />
                <PasswordField
                    id="confirm-password"
                    label="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                />

                {/* Password match indicator */}
                {confirmPassword && (
                    <p className={`text-xs flex items-center gap-1 ${newPassword === confirmPassword ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                        <span>{newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}</span>
                    </p>
                )}

                <button type="submit" disabled={loading} className={BTN_PRIMARY}>
                    {loading ? 'Resetting…' : 'Reset password'}
                </button>
            </form>
        </AuthCard>
    );
};

// =============================================================================
// 3. CHANGE PASSWORD  (standalone page — authenticated)
// =============================================================================

export const ChangePassword = () => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({ current: '', next: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = useCallback((e) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value })), []);

    if (!authLoading && !isAuthenticated) {
        toast.error('You must be logged in to change your password');
        return <Navigate to="/login" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePasswords(form.next, form.confirm)) return;
        if (form.current === form.next) {
            toast.error('New password must be different from current password');
            return;
        }
        setLoading(true);
        try {
            const result = await passwordResetAPI.changePassword(
                user?.id,
                form.current,
                form.next
            );
            if (result.success) {
                toast.success('Password changed successfully');
                setForm({ current: '', next: '', confirm: '' });
                navigate('/profile');
            } else {
                toast.error(result.message ?? 'Change failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Change failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard icon={Lock} title="Change password">
            {user?.email && (
                <p className="text-center text-sm text-gray-500 dark:text-gray-400 -mt-2">
                    Logged in as <span className="font-medium text-gray-700 dark:text-gray-300">{user.email}</span>
                </p>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
                <PasswordField
                    id="current"
                    name="current"
                    label="Current Password"
                    value={form.current}
                    onChange={(e) => setForm(prev => ({ ...prev, current: e.target.value }))}
                    placeholder="Enter current password"
                    autoComplete="current-password"
                />
                <PasswordField
                    id="next"
                    name="next"
                    label="New Password"
                    value={form.next}
                    onChange={(e) => setForm(prev => ({ ...prev, next: e.target.value }))}
                    placeholder="Min. 8 characters"
                />
                <PasswordField
                    id="confirm"
                    name="confirm"
                    label="Confirm New Password"
                    value={form.confirm}
                    onChange={(e) => setForm(prev => ({ ...prev, confirm: e.target.value }))}
                    placeholder="Repeat new password"
                />

                {form.confirm && (
                    <p className={`text-xs ${form.next === form.confirm ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                        {form.next === form.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                )}

                <button type="submit" disabled={loading} className={BTN_PRIMARY}>
                    {loading ? 'Updating…' : 'Update Password'}
                </button>

                <div className="text-center">
                    <button
                        type="button"
                        onClick={() => navigate('/profile')}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:underline"
                    >
                        ← Back to profile
                    </button>
                </div>
            </form>
        </AuthCard>
    );
};

// =============================================================================
// 4. CHANGE PASSWORD INLINE WIDGET  (used inside ProfilePage)
// =============================================================================

export const ChangePasswordInline = () => {
    const { user } = useAuth();
    const [form, setForm] = useState({ current: '', next: '', confirm: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validatePasswords(form.next, form.confirm)) return;
        if (form.current === form.next) {
            toast.error('New password must be different from current password');
            return;
        }
        setLoading(true);
        try {
            const result = await passwordResetAPI.changePassword(
                user?.id,
                form.current,
                form.next
            );
            if (result.success) {
                toast.success('Password changed successfully');
                setForm({ current: '', next: '', confirm: '' });
            } else {
                toast.error(result.message ?? 'Change failed');
            }
        } catch (err) {
            toast.error(err.response?.data?.message ?? 'Change failed');
        } finally {
            setLoading(false);
        }
    };

    const fields = [
        { name: 'current', label: 'Current Password', placeholder: 'Enter current password', autoComplete: 'current-password' },
        { name: 'next', label: 'New Password', placeholder: 'Min. 8 characters', autoComplete: 'new-password' },
        { name: 'confirm', label: 'Confirm New Password', placeholder: 'Repeat new password', autoComplete: 'new-password' },
    ];

    return (
        <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
                {fields.map(({ name, label, placeholder, autoComplete }) => (
                    <PasswordField
                        key={name}
                        id={name}
                        label={label}
                        value={form[name]}
                        onChange={(e) => setForm(prev => ({ ...prev, [name]: e.target.value }))}
                        placeholder={placeholder}
                        autoComplete={autoComplete}
                    />
                ))}

                {form.confirm && (
                    <p className={`text-xs ${form.next === form.confirm ? 'text-green-600 dark:text-green-400' : 'text-red-500'}`}>
                        {form.next === form.confirm ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                )}

                <button type="submit" disabled={loading} className={BTN_PRIMARY}>
                    {loading ? 'Updating…' : 'Update Password'}
                </button>
            </form>
        </div>
    );
};