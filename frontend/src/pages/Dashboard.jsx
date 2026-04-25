
// // Dashboard.jsx
// import React, { useEffect, useState, useMemo, useCallback } from "react";
// import { motion } from "framer-motion";
// import { 
//   Users, 
//   Calendar, 
//   Receipt, 
//   DollarSign, 
//   TrendingUp, 
//   Clock,
//   HelpCircle,
//   RefreshCw,
//   Download,
//   CalendarDays,
//   ChevronRight,
//   UserPlus,
//   Briefcase,
//   Activity,
//   AlertCircle,
//   CheckCircle,
//   XCircle,
//   Clock3
// } from "lucide-react";
// import { userApi } from "../api/userApi";
// import { toast } from "sonner";
// import {useAuth } from "../context/AuthContext"
// import { useNavigate } from "react-router-dom";
// import { StatCard } from "../components/ui/StatCardSkeleton";




// const DashboardChart = ({ type = "bar", data, loading, height = 300 }) => {
//   const canvasRef = React.useRef(null);

//   useEffect(() => {
//     if (!canvasRef.current || loading || !data || !data.labels) return;

//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');
//     const container = canvas.parentElement;
    
//     canvas.width = container.clientWidth;
//     canvas.height = height;

//     const drawChart = () => {
//       const width = canvas.width;
//       const chartHeight = canvas.height - 60;
//       const padding = { top: 20, right: 20, bottom: 40, left: 60 };
      
//       ctx.clearRect(0, 0, width, canvas.height);
      
//       // Draw grid
//       ctx.strokeStyle = '#e2e8f0';
//       ctx.lineWidth = 0.5;
//       for (let i = 0; i <= 5; i++) {
//         const y = padding.top + (chartHeight / 5) * i;
//         ctx.beginPath();
//         ctx.moveTo(padding.left, y);
//         ctx.lineTo(width - padding.right, y);
//         ctx.stroke();
//       }

//       const maxValue = Math.max(...data.datasets[0].data, 1);
//       const barWidth = (width - padding.left - padding.right) / data.labels.length * 0.7;
//       const barSpacing = (width - padding.left - padding.right) / data.labels.length * 0.3;

//       if (type === "bar") {
//         data.datasets[0].data.forEach((value, index) => {
//           const x = padding.left + (index * (barWidth + barSpacing));
//           const barHeight = (value / maxValue) * chartHeight;
//           const y = padding.top + chartHeight - barHeight;

//           const gradient = ctx.createLinearGradient(x, y, x + barWidth, y + barHeight);
//           gradient.addColorStop(0, data.datasets[0].backgroundColor);
//           gradient.addColorStop(1, `${data.datasets[0].backgroundColor}cc`);
          
//           ctx.fillStyle = gradient;
//           ctx.fillRect(x, y, barWidth, barHeight);

//           ctx.fillStyle = '#64748b';
//           ctx.font = '10px Inter, sans-serif';
//           ctx.textAlign = 'center';
//           ctx.fillText(value, x + barWidth / 2, y - 5);
//         });
//       } else if (type === "line") {
//         ctx.beginPath();
//         ctx.strokeStyle = data.datasets[0].borderColor;
//         ctx.lineWidth = 2;
        
//         data.datasets[0].data.forEach((value, index) => {
//           const x = padding.left + (index * (width - padding.left - padding.right) / (data.labels.length - 1 || 1));
//           const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
          
//           if (index === 0) {
//             ctx.moveTo(x, y);
//           } else {
//             ctx.lineTo(x, y);
//           }
//         });
//         ctx.stroke();

//         data.datasets[0].data.forEach((value, index) => {
//           const x = padding.left + (index * (width - padding.left - padding.right) / (data.labels.length - 1 || 1));
//           const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
          
//           ctx.beginPath();
//           ctx.arc(x, y, 4, 0, 2 * Math.PI);
//           ctx.fillStyle = data.datasets[0].borderColor;
//           ctx.fill();
//           ctx.strokeStyle = '#fff';
//           ctx.lineWidth = 2;
//           ctx.stroke();
//         });
//       }

//       ctx.fillStyle = '#64748b';
//       ctx.font = '11px Inter, sans-serif';
//       ctx.textAlign = 'center';
//       data.labels.forEach((label, index) => {
//         const x = padding.left + (index * (width - padding.left - padding.right) / (data.labels.length - 1 || 1));
//         ctx.fillText(label, x, canvas.height - 15);
//       });
//     };

//     drawChart();

//     const handleResize = () => {
//       canvas.width = container.clientWidth;
//       drawChart();
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, [data, loading, height, type]);

//   if (loading) {
//     return (
//       <div className="w-full animate-pulse">
//         <div className="h-[300px] bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
//       </div>
//     );
//   }

//   return (
//     <div className="w-full">
//       <canvas ref={canvasRef} style={{ width: '100%', height: `${height}px` }} />
//     </div>
//   );
// };

// // ========================
// // LOADING SPINNER
// // ========================
// const LoadingSpinner = ({ size = 'default', text = 'Loading...' }) => {
//   const sizeClasses = {
//     small: 'h-8 w-8',
//     default: 'h-12 w-12',
//     large: 'h-16 w-16'
//   };
  
//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
//       <div className="text-center">
//         <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-blue-600 dark:border-blue-400 mx-auto`}></div>
//         <p className="mt-4 text-gray-600 dark:text-gray-400">{text}</p>
//       </div>
//     </div>
//   );
// };

// // ========================
// // MAIN DASHBOARD COMPONENT
// // ========================
// export const Dashboard = () => {
//   const { user } = useAuth(); 
//   const navigate = useNavigate();
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [dashboardData, setDashboardData] = useState(null);
//   const [selectedPeriod, setSelectedPeriod] = useState('month');

//   const fetchDashboardData = useCallback(async () => {
//     try {
//       setLoading(true);
//       const response = await userApi.getDashboardSummary();
      
//       if (response?.success && response?.data) {
//         setDashboardData(response.data);
        
//       } else {
//         throw new Error("Invalid response structure");
//       }
//     } catch (error) {
//       toast.error("Failed to load dashboard data");
//       console.error("Dashboard data fetch error:", error);
//       setDashboardData(null);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   }, []);

//   useEffect(() => {
//     fetchDashboardData();
//   }, [fetchDashboardData]);

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchDashboardData();
//   };

//   const processedData = useMemo(() => {
//     if (!dashboardData) return null;

//     const {
//       summary = {},
//       charts = {},
//       users = {},
//       leaves = {},
//       expenses = {},
//       salary = {}
//     } = dashboardData;

//     const userList = users?.data || [];

//     const activeEmployees = userList.filter(u => u.isActive).length;

//     const departments = [
//       ...new Set(userList.map(u => u.department).filter(Boolean))
//     ];

//     const currentMonth = new Date().getMonth();
//     const currentYear = new Date().getFullYear();

//     const newHiresThisMonth = userList.filter(u => {
//       const created = new Date(u.createdAt);
//       return (
//         created.getMonth() === currentMonth &&
//         created.getFullYear() === currentYear
//       );
//     }).length;

//     const departmentStats = departments.map(dept => ({
//       name: dept,
//       employeeCount: userList.filter(u => u.department === dept).length,
//       totalSalary: userList
//         .filter(u => u.department === dept)
//         .reduce((sum, u) => sum + parseFloat(u.baseSalary || 0), 0)
//     }));

//     const totalLeaveRequests =
//       (summary?.leaves?.approved || 0) +
//       (summary?.leaves?.pending || 0) +
//       (summary?.leaves?.rejected || 0);

//     const attendanceRate =
//       summary?.totalUsers > 0
//         ? Math.min(
//           100,
//           Math.max(
//             0,
//             Math.round(100 - (totalLeaveRequests / summary.totalUsers) * 5)
//           )
//         )
//         : 100;

//     const recentActivities = [];

//     userList.slice(0, 3).forEach(u => {
//       recentActivities.push({
//         type: "hire",
//         description: `${u.firstName} ${u.lastName} joined ${u.department}`,
//         time: new Date(u.createdAt).toLocaleDateString(),
//         icon: UserPlus
//       });
//     });

//     leaves?.pending?.slice(0, 2).forEach(l => {
//       recentActivities.push({
//         type: "leave",
//         description: `${l.employeeName || "Employee"} requested leave`,
//         time: new Date(l.startDate).toLocaleDateString(),
//         icon: Calendar
//       });
//     });

//     expenses?.all?.data?.slice(0, 2).forEach(e => {
//       recentActivities.push({
//         type: "expense",
//         description: `${e.employeeName} submitted expense of ₹${e.amount}`,
//         time: new Date(e.createdAt).toLocaleDateString(),
//         icon: Receipt
//       });
//     });

//     recentActivities.sort(
//       (a, b) => new Date(b.time) - new Date(a.time)
//     );

//     const months = [
//       "Jan", "Feb", "Mar", "Apr", "May", "Jun",
//       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
//     ];

//     const leaveChartData = {
//       labels: months,
//       datasets: [
//         {
//           label: "Leave Requests",
//           data: charts?.leaves || Array(12).fill(0),
//           backgroundColor: "#4F46E5",
//           borderColor: "#4F46E5"
//         }
//       ]
//     };

//     const departmentChartData = {
//       labels: departmentStats.map(d => d.name),
//       datasets: [
//         {
//           label: "Employees",
//           data: departmentStats.map(d => d.employeeCount),
//           backgroundColor: "#8B5CF6",
//           borderColor: "#8B5CF6"
//         }
//       ]
//     };

//     return {
//       summary: {
//         totalEmployees: summary?.totalUsers || 0,
//         activeEmployees,
//         pendingLeaves: summary?.leaves?.pending || 0,
//         approvedLeaves: summary?.leaves?.approved || 0,
//         rejectedLeaves: summary?.leaves?.rejected || 0,
//         newLeaves: summary?.newLeaves || 0,
//         expensesClaimed: summary?.finance?.expensesClaimed || 0,
//         salaryPaid: summary?.finance?.salaryPaid || 0,
//         departments: departments.length,
//         newHiresThisMonth,
//         attendanceRate
//       },
//       charts: {
//         leaves: leaveChartData,
//         departments: departmentChartData
//       },
//       recentActivities: recentActivities.slice(0, 5),
//       departmentStats,
//       pendingLeaves: leaves?.pending || [],
//       users: userList
//     };
//   }, [dashboardData]);

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-IN', {
//       style: 'currency',
//       currency: 'INR',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   const formatNumber = (num) => {
//     return new Intl.NumberFormat('en-IN').format(num);
//   };

//   const quickStats = useMemo(() => {
//     if (!processedData) return [];
    
//     const { summary } = processedData;
//     return [
//       {
//         title: "Total Employees",
//         value: formatNumber(summary.totalEmployees),
//         icon: Users,
//         trend: summary.newHiresThisMonth > 0 ? 'up' : 'neutral',
//         trendValue: summary.newHiresThisMonth > 0 ? `+${summary.newHiresThisMonth}` : null,
//         color: "indigo",
//         subtext: `${summary.newHiresThisMonth} new this month`,
//         path: "/users",
//       },
//       {
//         title: "Pending Leaves",
//         value: formatNumber(summary.pendingLeaves),
//         icon: Calendar,
//         trend: summary.newLeaves > 0 ? 'up' : 'neutral',
//         trendValue: summary.newLeaves > 0 ? `+${summary.newLeaves}` : null,
//         color: "amber",
//         subtext: `${summary.approvedLeaves} approved`,
//         path: "/pending-leave",
//       },
//       {
//         title: "Expenses Claimed",
//         value: formatCurrency(summary.expensesClaimed),
//         icon: Receipt,
//         trend: 'neutral',
//         trendValue: null,
//         color: "rose",
//         subtext: "Total claimed expenses",
//         path: "/expenses",
//       },
//       {
//         title: "Salary Paid",
//         value: formatCurrency(summary.salaryPaid),
//         icon: DollarSign,
//         trend: 'neutral',
//         trendValue: null,
//         color: "emerald",
//         subtext: "Total salary disbursed",
//         path: "/payroll",
//       }
//     ];
//   }, [processedData]);

//   if (loading && !dashboardData) {
//     return <LoadingSpinner text="Loading dashboard..." />;
//   }

//   if (!processedData) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
//         <div className="text-center">
//           <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
//           <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Data Available</h2>
//           <p className="text-slate-600 dark:text-slate-400 mb-4">Unable to load dashboard data</p>
//           <button 
//             onClick={handleRefresh}
//             className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
//         {/* Header Section */}
//         <div className="mb-8">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
//                 Dashboard
//               </h1>
//               <p className="text-slate-600 dark:text-slate-400">
//                 Welcome back, <span className="font-semibold text-indigo-600 dark:text-indigo-400">
//                   {user?.firstName || user?.name?.split(' ')[0] || "User"}
//                 </span>! Here's what's happening with your organization.
//               </p>
//             </div>

//             <div className="flex flex-col sm:flex-row gap-3">
//               <select
//                 value={selectedPeriod}
//                 onChange={(e) => setSelectedPeriod(e.target.value)}
//                 className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               >
//                 <option value="week">This Week</option>
//                 <option value="month">This Month</option>
//                 <option value="quarter">This Quarter</option>
//                 <option value="year">This Year</option>
//               </select>

//               <button
//                 onClick={handleRefresh}
//                 disabled={refreshing}
//                 className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
//               >
//                 <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
//                 {refreshing ? 'Refreshing...' : 'Refresh'}
//               </button>

//               <button className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
//                 <Download className="w-4 h-4 mr-2" />
//                 Export
//               </button>
//             </div>
//           </div>

//           <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
//             <CalendarDays className="w-4 h-4" />
//             <span>{new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
//             <span className="mx-2">•</span>
//             <span>Last updated: Just now</span>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
//           {quickStats.map((stat, index) => (
//             <motion.div
//               key={stat.title}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//               className="cursor-pointer"
//               onClick={() => stat.path && navigate(stat.path)}
//             >
//               <StatCard {...stat} loading={loading} />
//             </motion.div>
//           ))}
//         </div>

//         {/* Charts Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
//           {/* Leave Requests Chart */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
//           >
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                 <Calendar className="w-5 h-5 text-indigo-600" />
//                 Monthly Leave Requests
//               </h3>
//               <button 
//                 onClick={() => navigate('/leave')}
//                 className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
//               >
//                 Details <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//             <DashboardChart
//               type="bar"
//               data={processedData.charts.leaves}
//               loading={loading}
//               height={300}
//             />
//           </motion.div>

//           {/* Department Distribution Chart */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
//           >
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                 <Users className="w-5 h-5 text-purple-600" />
//                 Employees by Department
//               </h3>
//               <button 
//                 onClick={() => navigate('/department-dashboard')}
//                 className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
//               >
//                 Details <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
//             <DashboardChart
//               type="bar"
//               data={processedData.charts.departments}
//               loading={loading}
//               height={300}
//             />
//           </motion.div>
//         </div>

//         {/* Bottom Grid */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
//           {/* Recent Activities */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4 }}
//             className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
//           >
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center gap-3">
//                 <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
//                   <Clock className="h-5 w-5 text-indigo-600" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
//                   Recent Activities
//                 </h3>
//               </div>
//             </div>

//             <div className="space-y-3">
//               {processedData.recentActivities.length > 0 ? (
//                 processedData.recentActivities.map((activity, index) => (
//                   <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
//                     <activity.icon className="h-4 w-4 text-indigo-600 mt-0.5" />
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-slate-900 dark:text-white">
//                         {activity.description}
//                       </p>
//                       <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <p className="text-sm text-slate-500 text-center py-8">No recent activities</p>
//               )}
//             </div>
//           </motion.div>

//           {/* Quick Stats */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5 }}
//             className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
//           >
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center gap-3">
//                 <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
//                   <TrendingUp className="h-5 w-5 text-emerald-600" />
//                 </div>
//                 <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
//                   Quick Stats
//                 </h3>
//               </div>
//             </div>

//             <div className="space-y-3">
//               <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <UserPlus className="h-4 w-4 text-emerald-600" />
//                   <span className="text-sm text-slate-600 dark:text-slate-400">New Hires (This Month)</span>
//                 </div>
//                 <span className="font-semibold text-slate-900 dark:text-white">
//                   {formatNumber(processedData.summary.newHiresThisMonth)}
//                 </span>
//               </div>
              
//               <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <Briefcase className="h-4 w-4 text-indigo-600" />
//                   <span className="text-sm text-slate-600 dark:text-slate-400">Active Departments</span>
//                 </div>
//                 <span className="font-semibold text-slate-900 dark:text-white">
//                   {formatNumber(processedData.summary.departments)}
//                 </span>
//               </div>

//               <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <Activity className="h-4 w-4 text-purple-600" />
//                   <span className="text-sm text-slate-600 dark:text-slate-400">Attendance Rate</span>
//                 </div>
//                 <span className="font-semibold text-slate-900 dark:text-white">
//                   {processedData.summary.attendanceRate}%
//                 </span>
//               </div>

//               <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <CheckCircle className="h-4 w-4 text-emerald-600" />
//                   <span className="text-sm text-slate-600 dark:text-slate-400">Active Employees</span>
//                 </div>
//                 <span className="font-semibold text-slate-900 dark:text-white">
//                   {formatNumber(processedData.summary.activeEmployees)}
//                 </span>
//               </div>

//               <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
//                 <div className="flex items-center gap-2">
//                   <XCircle className="h-4 w-4 text-rose-600" />
//                   <span className="text-sm text-slate-600 dark:text-slate-400">Rejected Leaves</span>
//                 </div>
//                 <span className="font-semibold text-slate-900 dark:text-white">
//                   {formatNumber(processedData.summary.rejectedLeaves)}
//                 </span>
//               </div>
//             </div>
//           </motion.div>

//           {/* Help & Support */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6 }}
//             className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-xl"
//           >
//             <div className="flex items-center gap-3 mb-4">
//               <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
//                 <HelpCircle className="h-5 w-5 text-white" />
//               </div>
//               <h3 className="text-lg font-semibold">Need Help?</h3>
//             </div>

//             <p className="text-indigo-100 text-sm mb-6">
//               Get the most out of HRMS with our comprehensive guides and dedicated support team.
//             </p>

//             <div className="space-y-3">
//               <button className="w-full bg-white text-indigo-600 px-4 py-3 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-all">
//                 View Documentation
//               </button>
              
//               <button className="w-full bg-indigo-500/20 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-indigo-500/30 transition-all backdrop-blur border border-indigo-300/30">
//                 Contact Support
//               </button>
//             </div>

//             <div className="mt-6 pt-6 border-t border-indigo-400/30">
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-indigo-200">Response time</span>
//                 <span className="font-semibold">&lt; 2 hours</span>
//               </div>
//             </div>
//           </motion.div>
//         </div>

//         {/* Pending Leaves Section */}
//         {processedData.pendingLeaves.length > 0 && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.7 }}
//             className="mt-8 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
//           >
//             <div className="flex items-center justify-between mb-4">
//               <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                 <Clock3 className="w-5 h-5 text-amber-600" />
//                 Pending Leave Requests
//               </h3>
//               <button 
//                 onClick={() => navigate('/pending-leave')}
//                 className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
//               >
//                 View All <ChevronRight className="w-4 h-4" />
//               </button>
//             </div>
            
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-slate-200 dark:border-slate-700">
//                     <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Employee</th>
//                     <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Date Range</th>
//                     <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Reason</th>
//                     <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {processedData.pendingLeaves.slice(0, 5).map((leave) => (
//                     <tr key={leave.id} className="border-b border-slate-200 dark:border-slate-700 last:border-0">
//                       <td className="py-3 px-4">
//                         <p className="text-sm font-medium text-slate-900 dark:text-white">
//                           {leave.employeeName || 'Unknown'}
//                         </p>
//                         <p className="text-xs text-slate-500">{leave.employeeEmail}</p>
//                       </td>
//                       <td className="py-3 px-4">
//                         <p className="text-sm text-slate-600 dark:text-slate-400">
//                           {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
//                         </p>
//                       </td>
//                       <td className="py-3 px-4">
//                         <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
//                           {leave.reason?.replace(/-/g, ' ') || 'N/A'}
//                         </p>
//                       </td>
//                       <td className="py-3 px-4">
//                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
//                           Pending
//                         </span>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


// Dashboard.jsx
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  Receipt,
  DollarSign,
  TrendingUp,
  Clock,
  HelpCircle,
  RefreshCw,
  Download,
  CalendarDays,
  ChevronRight,
  UserPlus,
  Briefcase,
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock3
} from "lucide-react";
import { userApi } from "../api/userApi";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../components/ui/StatCardSkeleton";

// ========== Chart component (unchanged) ==========
const DashboardChart = ({ type = "bar", data, loading, height = 300 }) => {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    if (!canvasRef.current || loading || !data || !data.labels) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    canvas.width = container.clientWidth;
    canvas.height = height;

    const drawChart = () => {
      const width = canvas.width;
      const chartHeight = canvas.height - 60;
      const padding = { top: 20, right: 20, bottom: 40, left: 60 };

      ctx.clearRect(0, 0, width, canvas.height);

      // Grid
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 0.5;
      for (let i = 0; i <= 5; i++) {
        const y = padding.top + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
      }

      const maxValue = Math.max(...data.datasets[0].data, 1);
      const barWidth = (width - padding.left - padding.right) / data.labels.length * 0.7;
      const barSpacing = (width - padding.left - padding.right) / data.labels.length * 0.3;

      if (type === "bar") {
        data.datasets[0].data.forEach((value, index) => {
          const x = padding.left + (index * (barWidth + barSpacing));
          const barHeight = (value / maxValue) * chartHeight;
          const y = padding.top + chartHeight - barHeight;

          const gradient = ctx.createLinearGradient(x, y, x + barWidth, y + barHeight);
          gradient.addColorStop(0, data.datasets[0].backgroundColor);
          gradient.addColorStop(1, `${data.datasets[0].backgroundColor}cc`);

          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth, barHeight);

          ctx.fillStyle = '#64748b';
          ctx.font = '10px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(value, x + barWidth / 2, y - 5);
        });
      } else if (type === "line") {
        ctx.beginPath();
        ctx.strokeStyle = data.datasets[0].borderColor;
        ctx.lineWidth = 2;

        data.datasets[0].data.forEach((value, index) => {
          const x = padding.left + (index * (width - padding.left - padding.right) / (data.labels.length - 1 || 1));
          const y = padding.top + chartHeight - (value / maxValue) * chartHeight;

          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        data.datasets[0].data.forEach((value, index) => {
          const x = padding.left + (index * (width - padding.left - padding.right) / (data.labels.length - 1 || 1));
          const y = padding.top + chartHeight - (value / maxValue) * chartHeight;

          ctx.beginPath();
          ctx.arc(x, y, 4, 0, 2 * Math.PI);
          ctx.fillStyle = data.datasets[0].borderColor;
          ctx.fill();
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }

      ctx.fillStyle = '#64748b';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'center';
      data.labels.forEach((label, index) => {
        const x = padding.left + (index * (width - padding.left - padding.right) / (data.labels.length - 1 || 1));
        ctx.fillText(label, x, canvas.height - 15);
      });
    };

    drawChart();

    const handleResize = () => {
      canvas.width = container.clientWidth;
      drawChart();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [data, loading, height, type]);

  if (loading) {
    return (
      <div className="w-full animate-pulse">
        <div className="h-[300px] bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <canvas ref={canvasRef} style={{ width: '100%', height: `${height}px` }} />
    </div>
  );
};

// ========== Loading spinner ==========
const LoadingSpinner = ({ size = 'default', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    default: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="text-center">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 border-blue-600 dark:border-blue-400 mx-auto`}></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">{text}</p>
      </div>
    </div>
  );
};

// ========== MAIN DASHBOARD ==========
export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userApi.getDashboardSummary();

      // 🔥 Handle double-wrapped API: response.data.data.data
      const innerData = response?.data?.data || response?.data || response;

      if (innerData?.summary) {
        setDashboardData(innerData);
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
      setDashboardData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  const processedData = useMemo(() => {
    if (!dashboardData) return null;

    // Destructure with safe defaults
    const {
      summary = {},
      charts = null,           // backend sends null, we'll ignore it
      users = {},
      leaves = {},
      expenses = {}
    } = dashboardData;

    const userList = users?.data || [];
    const activeEmployees = userList.filter(u => u.isActive).length;
    const departments = [...new Set(userList.map(u => u.department).filter(Boolean))];

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const newHiresThisMonth = userList.filter(u => {
      const created = new Date(u.createdAt);
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    }).length;

    const departmentStats = departments.map(dept => ({
      name: dept,
      employeeCount: userList.filter(u => u.department === dept).length,
      totalSalary: userList
        .filter(u => u.department === dept)
        .reduce((sum, u) => sum + parseFloat(u.baseSalary || 0), 0)
    }));

    const totalLeaveRequests =
      (summary?.leaves?.approved || 0) +
      (summary?.leaves?.pending || 0) +
      (summary?.leaves?.rejected || 0);

    const attendanceRate = summary?.totalUsers > 0
      ? Math.min(100, Math.max(0, Math.round(100 - (totalLeaveRequests / summary.totalUsers) * 5)))
      : 100;

    // Build recent activities from real data
    const recentActivities = [];

    userList.slice(0, 3).forEach(u => {
      recentActivities.push({
        type: "hire",
        description: `${u.firstName} ${u.lastName} joined ${u.department}`,
        time: new Date(u.createdAt).toLocaleDateString(),
        icon: UserPlus
      });
    });

    // Use leaves.pending (from leaves.segmented.pending)
    const pendingLeavesList = leaves?.segmented?.pending || leaves?.pending || [];
    pendingLeavesList.slice(0, 2).forEach(l => {
      recentActivities.push({
        type: "leave",
        description: `${l.employeeName || "Employee"} requested leave`,
        time: new Date(l.startDate).toLocaleDateString(),
        icon: Calendar
      });
    });

    // Expenses: expenses.data is the array
    (expenses?.data || []).slice(0, 2).forEach(e => {
      recentActivities.push({
        type: "expense",
        description: `${e.employeeName} submitted expense of ₹${e.amount}`,
        time: new Date(e.createdAt).toLocaleDateString(),
        icon: Receipt
      });
    });

    recentActivities.sort((a, b) => new Date(b.time) - new Date(a.time));

    // ---------- CHART DATA (built from real data, not backend's null charts) ----------
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Leave chart: if backend ever sends charts.leaves use it, else fallback to zeros (or you could count per month from leaves)
    const leaveChartData = {
      labels: months,
      datasets: [
        {
          label: "Leave Requests",
          data: charts?.leaves || Array(12).fill(0),
          backgroundColor: "#4F46E5",
          borderColor: "#4F46E5"
        }
      ]
    };

    const departmentChartData = {
      labels: departmentStats.map(d => d.name),
      datasets: [
        {
          label: "Employees",
          data: departmentStats.map(d => d.employeeCount),
          backgroundColor: "#8B5CF6",
          borderColor: "#8B5CF6"
        }
      ]
    };

    // ---------- MAPPED SUMMARY (fix field names) ----------
    return {
      summary: {
        totalEmployees: summary?.totalUsers || 0,            // 👈 backend sent totalUsers
        activeEmployees,
        pendingLeaves: summary?.leaves?.pending || 0,
        approvedLeaves: summary?.leaves?.approved || 0,
        rejectedLeaves: summary?.leaves?.rejected || 0,
        newLeaves: summary?.newLeaves || 0,
        expensesClaimed: summary?.finance?.expensesClaimed || 0,
        salaryPaid: summary?.finance?.salaryPaid || 0,
        departments: departments.length,
        newHiresThisMonth,
        attendanceRate
      },
      charts: {
        leaves: leaveChartData,
        departments: departmentChartData
      },
      recentActivities: recentActivities.slice(0, 5),
      departmentStats,
      pendingLeaves: pendingLeavesList,
      users: userList
    };
  }, [dashboardData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  const quickStats = useMemo(() => {
    if (!processedData) return [];

    const { summary } = processedData;
    return [
      {
        title: "Total Employees",
        value: formatNumber(summary.totalEmployees),
        icon: Users,
        trend: summary.newHiresThisMonth > 0 ? 'up' : 'neutral',
        trendValue: summary.newHiresThisMonth > 0 ? `+${summary.newHiresThisMonth}` : null,
        color: "indigo",
        subtext: `${summary.newHiresThisMonth} new this month`,
        path: "/users",
      },
      {
        title: "Pending Leaves",
        value: formatNumber(summary.pendingLeaves),
        icon: Calendar,
        trend: summary.newLeaves > 0 ? 'up' : 'neutral',
        trendValue: summary.newLeaves > 0 ? `+${summary.newLeaves}` : null,
        color: "amber",
        subtext: `${summary.approvedLeaves} approved`,
        path: "/pending-leave",
      },
      {
        title: "Expenses Claimed",
        value: formatCurrency(summary.expensesClaimed),
        icon: Receipt,
        trend: 'neutral',
        trendValue: null,
        color: "rose",
        subtext: "Total claimed expenses",
        path: "/expenses",
      },
      {
        title: "Salary Paid",
        value: formatCurrency(summary.salaryPaid),
        icon: DollarSign,
        trend: 'neutral',
        trendValue: null,
        color: "emerald",
        subtext: "Total salary disbursed",
        path: "/payroll",
      }
    ];
  }, [processedData]);

  if (loading && !dashboardData) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  if (!processedData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">No Data Available</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-4">Unable to load dashboard data</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ========== RENDER (exactly your original JSX, now powered by fixed data) ==========
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Welcome back, <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {user?.firstName || user?.name?.split(' ')[0] || "User"}
                </span>! Here's what's happening with your organization.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
                <option value="year">This Year</option>
              </select>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
              </button>

              <button className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="mx-2">•</span>
            <span>Last updated: Just now</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          {quickStats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="cursor-pointer"
              onClick={() => stat.path && navigate(stat.path)}
            >
              <StatCard {...stat} loading={loading} />
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* Leave Requests Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                Monthly Leave Requests
              </h3>
              <button
                onClick={() => navigate('/leave')}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <DashboardChart
              type="bar"
              data={processedData.charts.leaves}
              loading={loading}
              height={300}
            />
          </motion.div>

          {/* Department Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Employees by Department
              </h3>
              <button
                onClick={() => navigate('/department-dashboard')}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                Details <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <DashboardChart
              type="bar"
              data={processedData.charts.departments}
              loading={loading}
              height={300}
            />
          </motion.div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Recent Activities
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              {processedData.recentActivities.length > 0 ? (
                processedData.recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <activity.icon className="h-4 w-4 text-indigo-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-8">No recent activities</p>
              )}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Quick Stats
                </h3>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">New Hires (This Month)</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatNumber(processedData.summary.newHiresThisMonth)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Active Departments</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatNumber(processedData.summary.departments)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Attendance Rate</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {processedData.summary.attendanceRate}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Active Employees</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatNumber(processedData.summary.activeEmployees)}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-rose-600" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Rejected Leaves</span>
                </div>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatNumber(processedData.summary.rejectedLeaves)}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Help & Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center">
                <HelpCircle className="h-5 w-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold">Need Help?</h3>
            </div>

            <p className="text-indigo-100 text-sm mb-6">
              Get the most out of HRMS with our comprehensive guides and dedicated support team.
            </p>

            <div className="space-y-3">
              <button className="w-full bg-white text-indigo-600 px-4 py-3 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-all">
                View Documentation
              </button>

              <button className="w-full bg-indigo-500/20 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-indigo-500/30 transition-all backdrop-blur border border-indigo-300/30">
                Contact Support
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-indigo-400/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-indigo-200">Response time</span>
                <span className="font-semibold">&lt; 2 hours</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Pending Leaves Section */}
        {processedData.pendingLeaves.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mt-8 bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock3 className="w-5 h-5 text-amber-600" />
                Pending Leave Requests
              </h3>
              <button
                onClick={() => navigate('/pending-leave')}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Employee</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Date Range</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Reason</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600 dark:text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {processedData.pendingLeaves.slice(0, 5).map((leave) => (
                    <tr key={leave.id} className="border-b border-slate-200 dark:border-slate-700 last:border-0">
                      <td className="py-3 px-4">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">
                          {leave.employeeName || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-500">{leave.employeeEmail}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                          {leave.reason?.replace(/-/g, ' ') || 'N/A'}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                          Pending
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;