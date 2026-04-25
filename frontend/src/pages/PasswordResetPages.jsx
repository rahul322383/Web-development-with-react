// src/pages/PasswordResetPages.jsx
import React, { useState, useEffect } from 'react';
import {
    useSearchParams,
    useNavigate,
    useLocation,
    Navigate,
} from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // adjust path to your AuthContext
import  passwordResetAPI  from '../api/passwordReset.api'
import { toast } from 'sonner';

// ==============================
// 1. FORGOT PASSWORD
// ==============================
const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const result = await passwordResetAPI.forgotPassword(email);
            toast.success(result.message);
            setEmail('');
        } catch (err) {
            const msg = err.response?.data?.message || 'Request failed';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Reset your password
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Enter your email address and we'll send you a reset link.
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="sr-only">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                            placeholder="Email address"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Send reset link'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ==============================
// 2. RESET PASSWORD (with token)
// ==============================
const ResetPassword = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const token = searchParams.get('token');

    const [tokenValid, setTokenValid] = useState(null); // null = checking
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Verify token on mount
    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            toast.error('No reset token provided');
            return;
        }

        const verify = async () => {
            try {
                const result = await passwordResetAPI.verifyResetToken(token);
                if (result.success) {
                    setTokenValid(true);
                } else {
                    setTokenValid(false);
                    toast.error(result.message);
                }
            } catch (err) {
                setTokenValid(false);
                toast.error(err.response?.data?.message || 'Token verification failed');
            }
        };
        verify();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            const result = await passwordResetAPI.resetPassword(token, newPassword);
            if (result.success) {
                toast.success('Password reset successful! Redirecting to login...');
                setTimeout(() => navigate('/login'), 3000);
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    // Loading / invalid states
    if (tokenValid === null) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="text-gray-600 dark:text-gray-400">Verifying reset link...</div>
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md text-center">
                    <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
                        Invalid or expired link
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        The password reset link is invalid or has already been used.
                    </p>
                    <button
                        onClick={() => navigate('/forgot-password')}
                        className="inline-flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Request new link
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
                <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
                    Create new password
                </h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="new-password" className="sr-only">
                            New password
                        </label>
                        <input
                            id="new-password"
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="New password (min. 8 characters)"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className="sr-only">
                            Confirm password
                        </label>
                        <input
                            id="confirm-password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Confirm new password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Resetting...' : 'Reset password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ==============================
// 3. CHANGE PASSWORD (authenticated)
// ==============================
const ChangePassword = () => {
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Redirect if not authenticated
    if (!authLoading && !isAuthenticated) {
        toast.error('You must be logged in to change your password');
        return <Navigate to="/login" replace />;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }
        if (newPassword.length < 8) {
            toast.error('New password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            const result = await passwordResetAPI.changePassword(currentPassword, newPassword);
            if (result.success) {
                toast.success('Password changed successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                navigate('/profile'); // adjust to your profile route
            } else {
                toast.error(result.message);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Change failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
                <h2 className="text-center text-3xl font-extrabold text-gray-900 dark:text-white mb-6">
                    Change password
                </h2>
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
                    Logged in as <span className="font-medium">{user?.email}</span>
                </p>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="current-password" className="sr-only">
                            Current password
                        </label>
                        <input
                            id="current-password"
                            type="password"
                            required
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Current password"
                        />
                    </div>
                    <div>
                        <label htmlFor="new-password" className="sr-only">
                            New password
                        </label>
                        <input
                            id="new-password"
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="New password (min. 8 characters)"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirm-password" className="sr-only">
                            Confirm new password
                        </label>
                        <input
                            id="confirm-password"
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            placeholder="Confirm new password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update password'}
                    </button>
                </form>
            </div>
        </div>
    );
};

// ==============================
// EXPORT: a router‑aware component that renders the correct page based on the route
// ==============================
export const PasswordResetPages = () => {
    const location = useLocation();

    if (location.pathname === '/forgot-password') return <ForgotPassword />;
    if (location.pathname === '/reset-password') return <ResetPassword />;
    if (location.pathname === '/change-password') return <ChangePassword />;

    // Fallback – redirect to forgot password
    return <Navigate to="/forgot-password" replace />;
};