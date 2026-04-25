
// import React, { useState, useEffect, useMemo } from 'react';
// import { useAuth } from '../context/AuthContext';
// import { authApi } from '../api/authApi';
// import { toast } from 'sonner';
// import { User, Mail, Briefcase, Building2, Shield, Key, Edit2, Save, X } from 'lucide-react';

// const ProfilePage = () => {
//   const { user, meta, refreshUserData, isAuthenticated } = useAuth();
//   const [isEditing, setIsEditing] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     currentPassword: '',
//     newPassword: '',
//     confirmPassword: ''
//   });
//   const [errors, setErrors] = useState({});

//   // Extract user data with proper fallbacks
//   const userData = useMemo(() => {
//     if (!user && !meta) return null;

//     // Name handling
//     let firstName = '';
//     let lastName = '';
//     let fullName = '';

//     if (user?.firstName && user?.lastName) {
//       firstName = user.firstName;
//       lastName = user.lastName;
//       fullName = `${firstName} ${lastName}`;
//     } else if (user?.fullName) {
//       fullName = user.fullName;
//       const parts = fullName.split(' ');
//       firstName = parts[0] || '';
//       lastName = parts.slice(1).join(' ') || '';
//     } else if (meta?.name) {
//       fullName = meta.name;
//       const parts = fullName.split(' ');
//       firstName = parts[0] || '';
//       lastName = parts.slice(1).join(' ') || '';
//     }

//     // Email
//     const email = user?.email || meta?.email || '';

//     // Role handling
//     const roles = user?.roles?.length ? user.roles : [user?.primaryRole || meta?.role || 'Employee'];
//     const primaryRole = roles[0];

//     // Department
//     const department = user?.department || meta?.department || '';

//     // Status
//     const isActive = typeof user?.isActive === 'boolean'
//       ? user.isActive
//       : typeof meta?.isActive === 'boolean'
//         ? meta.isActive
//         : true;

//     // User ID
//     const id = user?.id || meta?.id;

//     return {
//       firstName,
//       lastName,
//       fullName,
//       email,
//       roles,
//       primaryRole,
//       department,
//       isActive,
//       id
//     };
//   }, [user, meta]);

//   // Initialize form when entering edit mode
//   useEffect(() => {
//     if (userData) {
//       setFormData(prev => ({
//         ...prev,
//         firstName: userData.firstName,
//         lastName: userData.lastName,
//         email: userData.email
//       }));
//     }
//   }, [userData]);

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//     // Clear error for this field
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: '' }));
//     }
//   };

//   const validateProfileForm = () => {
//     const newErrors = {};

//     if (!formData.firstName.trim()) {
//       newErrors.firstName = 'First name is required';
//     }
//     if (!formData.lastName.trim()) {
//       newErrors.lastName = 'Last name is required';
//     }
//     if (!formData.email.trim()) {
//       newErrors.email = 'Email is required';
//     } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
//       newErrors.email = 'Please enter a valid email address';
//     }

//     // Password validation only if attempting to change password
//     if (formData.newPassword || formData.currentPassword || formData.confirmPassword) {
//       if (!formData.currentPassword) {
//         newErrors.currentPassword = 'Current password is required to change password';
//       }
//       if (formData.newPassword && formData.newPassword.length < 6) {
//         newErrors.newPassword = 'Password must be at least 6 characters';
//       }
//       if (formData.newPassword !== formData.confirmPassword) {
//         newErrors.confirmPassword = 'Passwords do not match';
//       }
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleUpdateProfile = async () => {
//     if (!validateProfileForm()) return;

//     setIsLoading(true);
//     try {
//       const updateData = {
//         firstName: formData.firstName,
//         lastName: formData.lastName,
//         email: formData.email
//       };

//       // Include password change if provided
//       if (formData.newPassword && formData.currentPassword) {
//         updateData.currentPassword = formData.currentPassword;
//         updateData.newPassword = formData.newPassword;
//       }

//       const response = await authApi.updateProfile(updateData);

//       if (response.success) {
//         await refreshUserData();
//         toast.success('Profile updated successfully');
//         setIsEditing(false);
//         // Clear password fields
//         setFormData(prev => ({
//           ...prev,
//           currentPassword: '',
//           newPassword: '',
//           confirmPassword: ''
//         }));

//         // Emit socket event if available
//         if (window.socket) {
//           window.socket.emit('PROFILE_UPDATED', {
//             userId: userData?.id,
//             timestamp: new Date().toISOString()
//           });
//         }
//       } else {
//         toast.error(response.message || 'Failed to update profile');
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to update profile');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleChangePassword = async () => {
//     // Separate validation for standalone password change
//     if (!formData.currentPassword) {
//       setErrors({ currentPassword: 'Current password is required' });
//       return;
//     }
//     if (!formData.newPassword) {
//       setErrors({ newPassword: 'New password is required' });
//       return;
//     }
//     if (formData.newPassword.length < 6) {
//       setErrors({ newPassword: 'Password must be at least 6 characters' });
//       return;
//     }
//     if (formData.newPassword !== formData.confirmPassword) {
//       setErrors({ confirmPassword: 'Passwords do not match' });
//       return;
//     }

//     setIsLoading(true);
//     try {
//       const response = await authApi.changePassword({
//         currentPassword: formData.currentPassword,
//         newPassword: formData.newPassword
//       });

//       if (response.success) {
//         toast.success('Password changed successfully');
//         setFormData(prev => ({
//           ...prev,
//           currentPassword: '',
//           newPassword: '',
//           confirmPassword: ''
//         }));
//         setErrors({});

//         if (window.socket) {
//           window.socket.emit('PASSWORD_CHANGED', {
//             userId: userData?.id,
//             timestamp: new Date().toISOString()
//           });
//         }
//       } else {
//         toast.error(response.message || 'Failed to change password');
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || 'Failed to change password');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getRoleBadgeStyles = (role) => {
//     const roleLower = role?.toLowerCase();
//     const base = "px-3 py-1 rounded-full text-xs font-medium shadow-sm";
//     switch (roleLower) {
//       case 'admin': return `${base} bg-gradient-to-r from-red-500 to-pink-500 text-white`;
//       case 'manager': return `${base} bg-gradient-to-r from-blue-500 to-cyan-500 text-white`;
//       case 'hr': return `${base} bg-gradient-to-r from-purple-500 to-indigo-500 text-white`;
//       case 'employee': return `${base} bg-gradient-to-r from-green-500 to-emerald-500 text-white`;
//       case 'finance': return `${base} bg-gradient-to-r from-amber-500 to-orange-500 text-white`;
//       default: return `${base} bg-gray-500 text-white`;
//     }
//   };

//   // Loading / not authenticated states
//   if (!isAuthenticated) {
//     return (
//       <div className="max-w-4xl mx-auto mt-8 px-4">
//         <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 text-amber-800 dark:text-amber-300 p-6 rounded-lg shadow-md">
//           <p className="font-medium">Please log in to view your profile.</p>
//         </div>
//       </div>
//     );
//   }

//   if (!userData) {
//     return (
//       <div className="max-w-4xl mx-auto mt-8 px-4">
//         <div className="flex justify-center items-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto mt-6 sm:mt-8 px-4 sm:px-6 lg:px-8 mb-8">
//       <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-all">
//         {/* Header */}
//         <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-800 text-white p-6 sm:p-8">
//           <div className="absolute inset-0 bg-black/10"></div>
//           <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
//             <div className="flex-shrink-0">
//               <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-2xl">
//                 <span className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
//                   {userData.firstName?.charAt(0) || userData.fullName?.charAt(0) || 'U'}
//                 </span>
//               </div>
//             </div>
//             <div className="flex-1 text-center sm:text-left">
//               <h1 className="text-2xl sm:text-3xl font-bold mb-1">{userData.fullName}</h1>
//               <div className="flex flex-wrap justify-center sm:justify-start gap-2">
//                 <span className={getRoleBadgeStyles(userData.primaryRole)}>
//                   {userData.primaryRole}
//                 </span>
//                 {userData.department && (
//                   <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
//                     {userData.department}
//                   </span>
//                 )}
//                 <span className={`px-3 py-1 rounded-full text-xs font-medium ${userData.isActive
//                     ? 'bg-green-500/20 text-white backdrop-blur-sm'
//                     : 'bg-red-500/20 text-white backdrop-blur-sm'
//                   }`}>
//                   {userData.isActive ? 'Active' : 'Inactive'}
//                 </span>
//               </div>
//             </div>
//             {!isEditing && (
//               <button
//                 onClick={() => setIsEditing(true)}
//                 className="absolute top-4 right-4 sm:static bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:px-4 sm:py-2 rounded-lg transition-all flex items-center gap-2 border border-white/20"
//                 aria-label="Edit profile"
//               >
//                 <Edit2 className="w-4 h-4" />
//                 <span className="hidden sm:inline">Edit Profile</span>
//               </button>
//             )}
//           </div>
//         </div>

//         {/* Content */}
//         <div className="p-6 sm:p-8">
//           {/* Profile Form / View */}
//           <div className="mb-10">
//             <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
//               <User className="w-5 h-5 text-indigo-500" />
//               Personal Information
//             </h2>

//             {isEditing ? (
//               <div className="space-y-5">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                       First Name *
//                     </label>
//                     <input
//                       type="text"
//                       name="firstName"
//                       value={formData.firstName}
//                       onChange={handleInputChange}
//                       className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${errors.firstName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
//                         }`}
//                       disabled={isLoading}
//                     />
//                     {errors.firstName && (
//                       <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.firstName}</p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                       Last Name *
//                     </label>
//                     <input
//                       type="text"
//                       name="lastName"
//                       value={formData.lastName}
//                       onChange={handleInputChange}
//                       className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${errors.lastName ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
//                         }`}
//                       disabled={isLoading}
//                     />
//                     {errors.lastName && (
//                       <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.lastName}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Email Address *
//                   </label>
//                   <div className="relative">
//                     <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
//                     <input
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleInputChange}
//                       className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${errors.email ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
//                         }`}
//                       disabled={isLoading}
//                     />
//                   </div>
//                   {errors.email && (
//                     <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.email}</p>
//                   )}
//                 </div>

//                 <div className="flex flex-col sm:flex-row gap-3 pt-4">
//                   <button
//                     onClick={handleUpdateProfile}
//                     disabled={isLoading}
//                     className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {isLoading ? (
//                       <>
//                         <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
//                         Saving...
//                       </>
//                     ) : (
//                       <>
//                         <Save className="w-4 h-4" />
//                         Save Changes
//                       </>
//                     )}
//                   </button>
//                   <button
//                     onClick={() => {
//                       setIsEditing(false);
//                       setErrors({});
//                       // Reset form to original values
//                       if (userData) {
//                         setFormData(prev => ({
//                           ...prev,
//                           firstName: userData.firstName,
//                           lastName: userData.lastName,
//                           email: userData.email,
//                           currentPassword: '',
//                           newPassword: '',
//                           confirmPassword: ''
//                         }));
//                       }
//                     }}
//                     disabled={isLoading}
//                     className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-4 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
//                   >
//                     <X className="w-4 h-4" />
//                     Cancel
//                   </button>
//                 </div>
//               </div>
//             ) : (
//               <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5 space-y-4">
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                   <div className="flex items-center gap-3">
//                     <User className="w-5 h-5 text-gray-400" />
//                     <div>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
//                       <p className="font-medium text-gray-800 dark:text-gray-200">{userData.fullName}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Mail className="w-5 h-5 text-gray-400" />
//                     <div>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
//                       <p className="font-medium text-gray-800 dark:text-gray-200">{userData.email}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Shield className="w-5 h-5 text-gray-400" />
//                     <div>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">Role</p>
//                       <div className="flex flex-wrap gap-2 mt-1">
//                         {userData.roles.map(role => (
//                           <span key={role} className={getRoleBadgeStyles(role)}>
//                             {role}
//                           </span>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                   {userData.department && (
//                     <div className="flex items-center gap-3">
//                       <Building2 className="w-5 h-5 text-gray-400" />
//                       <div>
//                         <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
//                         <p className="font-medium text-gray-800 dark:text-gray-200">{userData.department}</p>
//                       </div>
//                     </div>
//                   )}
//                   <div className="flex items-center gap-3">
//                     <div className={`w-2 h-2 rounded-full ${userData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
//                     <div>
//                       <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
//                       <p className={`font-medium ${userData.isActive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
//                         {userData.isActive ? 'Active' : 'Inactive'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 {userData.id && (
//                   <div className="pt-2 border-t dark:border-gray-700">
//                     <p className="text-sm text-gray-500 dark:text-gray-400">
//                       User ID: <span className="font-mono text-gray-700 dark:text-gray-300">{userData.id}</span>
//                     </p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Change Password Section */}
//           <div>
//             <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
//               <Key className="w-5 h-5 text-indigo-500" />
//               Change Password
//             </h2>
//             <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5">
//               <div className="space-y-5">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Current Password
//                   </label>
//                   <input
//                     type="password"
//                     name="currentPassword"
//                     value={formData.currentPassword}
//                     onChange={handleInputChange}
//                     placeholder="Enter current password"
//                     className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${errors.currentPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
//                       }`}
//                     disabled={isLoading}
//                   />
//                   {errors.currentPassword && (
//                     <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.currentPassword}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     New Password
//                   </label>
//                   <input
//                     type="password"
//                     name="newPassword"
//                     value={formData.newPassword}
//                     onChange={handleInputChange}
//                     placeholder="Enter new password (min 6 characters)"
//                     className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${errors.newPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
//                       }`}
//                     disabled={isLoading}
//                   />
//                   {errors.newPassword && (
//                     <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.newPassword}</p>
//                   )}
//                 </div>

//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                     Confirm New Password
//                   </label>
//                   <input
//                     type="password"
//                     name="confirmPassword"
//                     value={formData.confirmPassword}
//                     onChange={handleInputChange}
//                     placeholder="Confirm new password"
//                     className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${errors.confirmPassword ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'
//                       }`}
//                     disabled={isLoading}
//                   />
//                   {errors.confirmPassword && (
//                     <p className="text-red-500 dark:text-red-400 text-sm mt-1">{errors.confirmPassword}</p>
//                   )}
//                 </div>

//                 <button
//                   onClick={handleChangePassword}
//                   disabled={isLoading}
//                   className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {isLoading ? 'Updating...' : 'Update Password'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProfilePage;

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams, Navigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  User, Mail, Briefcase, Building2, Shield, Key, Edit2, Save, X,
  Lock, ArrowRight, AlertCircle
} from 'lucide-react';
import  passwordResetAPI  from '../api/passwordReset.api'; // adjust path

// ============================================================
// 1. FORGOT PASSWORD PAGE
// ============================================================
export const ForgotPassword = () => {
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
      toast.error(err.response?.data?.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
            <Lock className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            Forgot password?
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a reset link.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Email address"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
          <div className="text-center">
            <Link to="/login" className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// 2. RESET PASSWORD PAGE (token from email)
// ============================================================
export const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [tokenValid, setTokenValid] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      toast.error('No reset token provided');
      return;
    }
    const verify = async () => {
      try {
        const result = await passwordResetAPI.verifyResetToken(token);
        if (result.success) setTokenValid(true);
        else {
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
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2">
            Invalid or expired link
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The password reset link is invalid or has already been used.
          </p>
          <Link
            to="/forgot-password"
            className="inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md">
        <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Create new password
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="New password (min. 8 characters)"
          />
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Confirm new password"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============================================================
// 3. CHANGE PASSWORD COMPONENT (used inside ProfilePage)
// ============================================================
const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Current Password
          </label>
          <input
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300 dark:border-gray-600"
            placeholder="Enter current password"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            New Password
          </label>
          <input
            type="password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300 dark:border-gray-600"
            placeholder="New password (min 8 characters)"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white border-gray-300 dark:border-gray-600"
            placeholder="Confirm new password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

// ============================================================
// 4. PROFILE PAGE (updated to use ChangePassword component)
// ============================================================
export const ProfilePage = () => {
  const { user, meta, refreshUserData, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [errors, setErrors] = useState({});

  // Extract user data (same as your original logic)
  const userData = useMemo(() => {
    if (!user && !meta) return null;
    let firstName = '', lastName = '', fullName = '';
    if (user?.firstName && user?.lastName) {
      firstName = user.firstName;
      lastName = user.lastName;
      fullName = `${firstName} ${lastName}`;
    } else if (user?.fullName) {
      fullName = user.fullName;
      const parts = fullName.split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    } else if (meta?.name) {
      fullName = meta.name;
      const parts = fullName.split(' ');
      firstName = parts[0] || '';
      lastName = parts.slice(1).join(' ') || '';
    }
    const email = user?.email || meta?.email || '';
    const roles = user?.roles?.length ? user.roles : [user?.primaryRole || meta?.role || 'Employee'];
    const primaryRole = roles[0];
    const department = user?.department || meta?.department || '';
    const isActive = typeof user?.isActive === 'boolean' ? user.isActive : (typeof meta?.isActive === 'boolean' ? meta.isActive : true);
    const id = user?.id || meta?.id;
    return { firstName, lastName, fullName, email, roles, primaryRole, department, isActive, id };
  }, [user, meta]);

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
      });
    }
  }, [userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateProfileForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!validateProfileForm()) return;
    setIsLoading(true);
    try {
      const response = await authApi.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
      });
      if (response.success) {
        await refreshUserData();
        toast.success('Profile updated successfully');
        setIsEditing(false);
      } else {
        toast.error(response.message || 'Update failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getRoleBadgeStyles = (role) => {
    const base = "px-3 py-1 rounded-full text-xs font-medium shadow-sm";
    const roleLower = role?.toLowerCase();
    switch (roleLower) {
      case 'admin': return `${base} bg-gradient-to-r from-red-500 to-pink-500 text-white`;
      case 'manager': return `${base} bg-gradient-to-r from-blue-500 to-cyan-500 text-white`;
      case 'hr': return `${base} bg-gradient-to-r from-purple-500 to-indigo-500 text-white`;
      case 'employee': return `${base} bg-gradient-to-r from-green-500 to-emerald-500 text-white`;
      default: return `${base} bg-gray-500 text-white`;
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!userData) {
    return (
      <div className="max-w-4xl mx-auto mt-8 px-4">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-6 sm:mt-8 px-4 sm:px-6 lg:px-8 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Header with Forgot Password link */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-800 text-white p-6 sm:p-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-2xl">
                <span className="text-4xl sm:text-5xl font-bold text-white drop-shadow-lg">
                  {userData.firstName?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold mb-1">{userData.fullName}</h1>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                <span className={getRoleBadgeStyles(userData.primaryRole)}>{userData.primaryRole}</span>
                {userData.department && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm text-white">
                    {userData.department}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${userData.isActive ? 'bg-green-500/20' : 'bg-red-500/20'} text-white backdrop-blur-sm`}>
                  {userData.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="absolute top-4 right-4 sm:static flex gap-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:px-4 sm:py-2 rounded-lg transition-all flex items-center gap-2 border border-white/20"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </button>
              )}
              {/* Forgot Password link - redirects to forgot page */}
              <button
                onClick={() => navigate('/forgot-password')}
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 sm:px-4 sm:py-2 rounded-lg transition-all flex items-center gap-2 border border-white/20"
              >
                <Key className="w-4 h-4" />
                <span className="hidden sm:inline">Forgot Password?</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Personal Information */}
          <div className="mb-10">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              Personal Information
            </h2>
            {isEditing ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">First Name *</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      disabled={isLoading}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Last Name *</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      disabled={isLoading}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isLoading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <><Save className="w-4 h-4" /> Save</>}
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setErrors({});
                      if (userData) setFormData({
                        firstName: userData.firstName,
                        lastName: userData.lastName,
                        email: userData.email,
                      });
                    }}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-900/30 rounded-xl p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p><p className="font-medium text-gray-800 dark:text-gray-200">{userData.fullName}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Email</p><p className="font-medium text-gray-800 dark:text-gray-200">{userData.email}</p></div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-400" />
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Role</p><div className="flex flex-wrap gap-2 mt-1">{userData.roles.map(role => <span key={role} className={getRoleBadgeStyles(role)}>{role}</span>)}</div></div>
                  </div>
                  {userData.department && (
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <div><p className="text-sm text-gray-500 dark:text-gray-400">Department</p><p className="font-medium text-gray-800 dark:text-gray-200">{userData.department}</p></div>
                    </div>
                  )}
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${userData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <div><p className="text-sm text-gray-500 dark:text-gray-400">Status</p><p className={`font-medium ${userData.isActive ? 'text-green-600' : 'text-red-600'}`}>{userData.isActive ? 'Active' : 'Inactive'}</p></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Change Password Section (using the component) */}
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6 flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-500" />
              Change Password
            </h2>
            <ChangePassword />
          </div>
        </div>
      </div>
    </div>
  );
};

// Also export ChangePassword separately if needed
export { ChangePassword };