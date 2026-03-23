
// import React, { useEffect, useState } from "react";
// import { motion } from "framer-motion";
// import { StatCard } from "../components/custom/StatCard";
// import { DashboardChart } from "../components/custom/DashboardChart";
// import { 
//   Users, 
//   Calendar, 
//   Receipt, 
//   DollarSign, 
//   TrendingUp, 
//   Clock,
//   AlertCircle,
//   Briefcase,
//   UserPlus,
//   UserMinus,
//   ArrowUpRight,
//   ArrowDownRight,
//   HelpCircle,
//   RefreshCw,
//   BarChart3,
//   PieChart,
//   Activity,
//   Download,
//   Filter,
//   CalendarDays,
//   ChevronRight
// } from "lucide-react";
// import { userApi } from "../api/userApi";
// import { toast } from "sonner";
// import useAuthStore from "../store/authStore";

// export const Dashboard = () => {
//   const user = useAuthStore((state) => state.user);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedPeriod, setSelectedPeriod] = useState('month');

//   const [summary, setSummary] = useState({
//     totalEmployees: 0,
//     activeEmployees: 0,
//     pendingLeaves: 0,
//     approvedLeaves: 0,
//     totalExpenses: 0,
//     monthlyExpenses: 0,
//     payrollProcessed: 0,
//     payrollAmount: 0,
//     departments: 0,
//     newHiresThisMonth: 0,
//     resignationsThisMonth: 0,
//     attendanceRate: 0,
//     overtime: 0
//   });

//   const [recentActivities, setRecentActivities] = useState([]);
//   const [departmentStats, setDepartmentStats] = useState([]);
//   const [monthlyTrends, setMonthlyTrends] = useState([]);
//   const [upcomingEvents, setUpcomingEvents] = useState([]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const data = await userApi.getDashboardSummary();
      
//       setSummary({
//         totalEmployees: data.totalEmployees || 0,
//         activeEmployees: data.activeEmployees || 0,
//         pendingLeaves: data.pendingLeaves || 0,
//         approvedLeaves: data.approvedLeaves || 0,
//         totalExpenses: data.totalExpenses || 0,
//         monthlyExpenses: data.monthlyExpenses || 0,
//         payrollProcessed: data.payrollProcessed || 0,
//         payrollAmount: data.payrollAmount || 0,
//         departments: data.departments?.length || 0,
//         newHiresThisMonth: data.newHiresThisMonth || 0,
//         resignationsThisMonth: data.resignationsThisMonth || 0,
//         attendanceRate: data.attendanceRate || 0,
//         overtime: data.overtime || 0
//       });

//       setRecentActivities(data.recentActivities || []);
//       setDepartmentStats(data.departmentStats || []);
//       setMonthlyTrends(data.monthlyTrends || []);
//       setUpcomingEvents(data.upcomingEvents || []);
      
//     } catch (error) {
//       toast.error("Failed to load dashboard data");
//       console.error("Dashboard data fetch error:", error);
      
//       // Set empty states
//       setSummary({
//         totalEmployees: 0,
//         activeEmployees: 0,
//         pendingLeaves: 0,
//         approvedLeaves: 0,
//         totalExpenses: 0,
//         monthlyExpenses: 0,
//         payrollProcessed: 0,
//         payrollAmount: 0,
//         departments: 0,
//         newHiresThisMonth: 0,
//         resignationsThisMonth: 0,
//         attendanceRate: 0,
//         overtime: 0
//       });
//       setRecentActivities([]);
//       setDepartmentStats([]);
//       setMonthlyTrends([]);
//       setUpcomingEvents([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchDashboardData();
//   };

//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   const formatNumber = (num) => {
//     return new Intl.NumberFormat('en-US').format(num);
//   };

//   // Chart data
//   const employeeTrendData = {
//     labels: monthlyTrends.map(t => t.month),
//     datasets: [
//       {
//         label: "Total Employees",
//         data: monthlyTrends.map(t => t.employeeCount),
//         borderColor: "#4F46E5",
//         backgroundColor: "rgba(79, 70, 229, 0.1)",
//         fill: true,
//         tension: 0.4
//       }
//     ]
//   };

//   const leaveData = {
//     labels: monthlyTrends.map(t => t.month),
//     datasets: [
//       {
//         label: "Leave Requests",
//         data: monthlyTrends.map(t => t.leaveRequests),
//         backgroundColor: "#4F46E5",
//         borderRadius: 6
//       }
//     ]
//   };

//   const expenseDistributionData = {
//     labels: departmentStats.map(d => d.name),
//     datasets: [
//       {
//         data: departmentStats.map(d => d.expenses),
//         backgroundColor: [
//           "#4F46E5",
//           "#10B981",
//           "#F59E0B",
//           "#EF4444",
//           "#8B5CF6",
//           "#EC4899"
//         ]
//       }
//     ]
//   };

//   const departmentEmployeeData = {
//     labels: departmentStats.map(d => d.name),
//     datasets: [
//       {
//         label: "Employees",
//         data: departmentStats.map(d => d.employeeCount),
//         backgroundColor: "#4F46E5",
//         borderRadius: 6
//       }
//     ]
//   };

//   const quickStats = [
//     {
//       label: "Active Employees",
//       value: formatNumber(summary.activeEmployees),
//       icon: Briefcase,
//       change: summary.newHiresThisMonth - summary.resignationsThisMonth,
//       trend: summary.newHiresThisMonth > summary.resignationsThisMonth ? 'up' : 'down',
//       color: "emerald",
//       subtext: `${summary.newHiresThisMonth} new this month`
//     },
//     {
//       label: "Attendance Rate",
//       value: `${summary.attendanceRate}%`,
//       icon: Clock,
//       change: 2.5,
//       trend: 'up',
//       color: "blue",
//       subtext: "Above target"
//     },
//     {
//       label: "Pending Leaves",
//       value: formatNumber(summary.pendingLeaves),
//       icon: Calendar,
//       change: -3,
//       trend: 'down',
//       color: "amber",
//       subtext: `${summary.approvedLeaves} approved`
//     },
//     {
//       label: "Monthly Expenses",
//       value: formatCurrency(summary.monthlyExpenses),
//       icon: Receipt,
//       change: 8.2,
//       trend: 'up',
//       color: "rose",
//       subtext: `${formatCurrency(summary.totalExpenses)} total`
//     }
//   ];

//   const periodOptions = [
//     { value: 'week', label: 'This Week' },
//     { value: 'month', label: 'This Month' },
//     { value: 'quarter', label: 'This Quarter' },
//     { value: 'year', label: 'This Year' }
//   ];

//   return (
//     <div data-testid="dashboard-page" className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      
//       {/* Main Content */}
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
//         {/* Welcome Section */}
//         <div className="mb-8">
//           <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
//             <div>
//               <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
//                 Dashboard
//               </h1>
//               <p className="text-slate-600 dark:text-slate-400">
//                 Welcome back, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user?.name?.split(' ')[0] || "User"}</span>! Here's what's happening with your organization.
//               </p>
//             </div>

//             <div className="flex flex-col sm:flex-row gap-3">
//               {/* Period Selector */}
//               <select
//                 value={selectedPeriod}
//                 onChange={(e) => setSelectedPeriod(e.target.value)}
//                 className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//               >
//                 {periodOptions.map(option => (
//                   <option key={option.value} value={option.value}>
//                     {option.label}
//                   </option>
//                 ))}
//               </select>

//               {/* Action Buttons */}
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

//           {/* Quick Date Range */}
//           <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
//             <CalendarDays className="w-4 h-4" />
//             <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
//             <span className="mx-2">•</span>
//             <span>Last updated: Just now</span>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
//           {quickStats.map((stat, index) => (
//             <motion.div
//               key={stat.label}
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.1 }}
//             >
//               <StatCard
//                 title={stat.label}
//                 value={stat.value}
//                 icon={stat.icon}
//                 loading={loading}
//                 trend={stat.trend}
//                 trendValue={stat.change ? `${stat.change > 0 ? '+' : ''}${stat.change}` : null}
//                 subtext={stat.subtext}
//                 color={stat.color}
//               />
//             </motion.div>
//           ))}
//         </div>

//         {/* Charts Section */}
//         {!loading && monthlyTrends.length > 0 ? (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.3 }}
//           >
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
//               <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                     <BarChart3 className="w-5 h-5 text-indigo-600" />
//                     Employee Growth Trend
//                   </h3>
//                   <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
//                     Details <ChevronRight className="w-4 h-4" />
//                   </button>
//                 </div>
//                 <DashboardChart
//                   type="line"
//                   data={employeeTrendData}
//                   loading={loading}
//                   height={300}
//                 />
//               </div>

//               <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
//                 <div className="flex items-center justify-between mb-4">
//                   <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                     <Activity className="w-5 h-5 text-indigo-600" />
//                     Monthly Leave Requests
//                   </h3>
//                   <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
//                     Details <ChevronRight className="w-4 h-4" />
//                   </button>
//                 </div>
//                 <DashboardChart
//                   type="bar"
//                   data={leaveData}
//                   loading={loading}
//                   height={300}
//                 />
//               </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
//               {departmentStats.length > 0 && (
//                 <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                       <PieChart className="w-5 h-5 text-indigo-600" />
//                       Expense Distribution
//                     </h3>
//                     <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
//                       Details <ChevronRight className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <DashboardChart
//                     type="doughnut"
//                     data={expenseDistributionData}
//                     loading={loading}
//                     height={300}
//                   />
//                 </div>
//               )}

//               {departmentStats.length > 0 && (
//                 <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                       <Users className="w-5 h-5 text-indigo-600" />
//                       Employees by Department
//                     </h3>
//                     <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
//                       Details <ChevronRight className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <DashboardChart
//                     type="bar"
//                     data={departmentEmployeeData}
//                     loading={loading}
//                     height={300}
//                   />
//                 </div>
//               )}
//             </div>
//           </motion.div>
//         ) : (
//           !loading && (
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="mb-8"
//             >
//               <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
//                 <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
//                   <BarChart3 className="w-10 h-10 text-indigo-600" />
//                 </div>
//                 <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
//                   No Data Available
//                 </h3>
//                 <p className="text-slate-600 dark:text-slate-400 mb-6">
//                   Start adding employees and tracking data to see insights here.
//                 </p>
//                 <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
//                   Add Employees
//                 </button>
//               </div>
//             </motion.div>
//           )
//         )}

//         {/* Bottom Grid - Activities, Upcoming, Help */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
//           {/* Recent Activities */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.4 }}
//             className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all"
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
//               <button className="text-sm text-indigo-600 hover:text-indigo-700">
//                 View All
//               </button>
//             </div>

//             {loading ? (
//               <div className="space-y-4">
//                 {[1, 2, 3].map(i => (
//                   <div key={i} className="animate-pulse">
//                     <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
//                     <div className="h-3 bg-slate-200 rounded w-1/2"></div>
//                   </div>
//                 ))}
//               </div>
//             ) : recentActivities.length > 0 ? (
//               <div className="space-y-4">
//                 {recentActivities.slice(0, 5).map((activity, index) => (
//                   <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
//                     <div className={`w-2 h-2 mt-2 rounded-full ${
//                       activity.type === 'leave' ? 'bg-amber-500' :
//                       activity.type === 'hire' ? 'bg-emerald-500' :
//                       activity.type === 'expense' ? 'bg-blue-500' :
//                       'bg-slate-400'
//                     }`} />
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-slate-900 dark:text-white">
//                         {activity.description}
//                       </p>
//                       <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-slate-500 text-center py-8">No recent activities</p>
//             )}
//           </motion.div>

//           {/* Quick Stats */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.5 }}
//             className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all"
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

//             {loading ? (
//               <div className="space-y-4">
//                 {[1, 2, 3].map(i => (
//                   <div key={i} className="animate-pulse h-10 bg-slate-200 rounded"></div>
//                 ))}
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
//                   <div className="flex items-center gap-2">
//                     <UserPlus className="h-4 w-4 text-emerald-600" />
//                     <span className="text-sm text-slate-600 dark:text-slate-400">New Hires</span>
//                   </div>
//                   <span className="font-semibold text-slate-900 dark:text-white">
//                     {formatNumber(summary.newHiresThisMonth)}
//                   </span>
//                 </div>
                
//                 <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
//                   <div className="flex items-center gap-2">
//                     <UserMinus className="h-4 w-4 text-rose-600" />
//                     <span className="text-sm text-slate-600 dark:text-slate-400">Resignations</span>
//                   </div>
//                   <span className="font-semibold text-slate-900 dark:text-white">
//                     {formatNumber(summary.resignationsThisMonth)}
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
//                   <div className="flex items-center gap-2">
//                     <Briefcase className="h-4 w-4 text-indigo-600" />
//                     <span className="text-sm text-slate-600 dark:text-slate-400">Departments</span>
//                   </div>
//                   <span className="font-semibold text-slate-900 dark:text-white">
//                     {formatNumber(summary.departments)}
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
//                   <div className="flex items-center gap-2">
//                     <Clock className="h-4 w-4 text-purple-600" />
//                     <span className="text-sm text-slate-600 dark:text-slate-400">Overtime (hrs)</span>
//                   </div>
//                   <span className="font-semibold text-slate-900 dark:text-white">
//                     {formatNumber(summary.overtime)}
//                   </span>
//                 </div>
//               </div>
//             )}
//           </motion.div>

//           {/* Help & Support */}
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.6 }}
//             className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all"
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
//               <button className="w-full bg-white text-indigo-600 px-4 py-3 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-all transform hover:scale-[1.02]">
//                 View Documentation
//               </button>
              
//               <button className="w-full bg-indigo-500/20 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-indigo-500/30 transition-all backdrop-blur border border-indigo-300/30 transform hover:scale-[1.02]">
//                 Contact Support
//               </button>
//             </div>

//             <div className="mt-6 pt-6 border-t border-indigo-400/30">
//               <div className="flex items-center justify-between text-sm">
//                 <span className="text-indigo-200">Average response time</span>
//                 <span className="font-semibold text-white">&lt; 2 hours</span>
//               </div>
//               <div className="mt-2 flex items-center gap-2">
//                 <div className="flex-1 h-1.5 bg-indigo-400/30 rounded-full overflow-hidden">
//                   <div className="w-3/4 h-full bg-white rounded-full" />
//                 </div>
//                 <span className="text-xs text-indigo-200">95% satisfaction</span>
//               </div>
//             </div>
//           </motion.div>
//         </div>

//         {/* Quick Actions */}
//         <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
//           {[
//             { label: 'Add Employee', icon: UserPlus, color: 'indigo' },
//             { label: 'Process Payroll', icon: DollarSign, color: 'emerald' },
//             { label: 'Approve Leaves', icon: Calendar, color: 'amber' },
//             { label: 'View Reports', icon: BarChart3, color: 'purple' }
//           ].map((action, index) => (
//             <motion.button
//               key={action.label}
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               className="px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
//             >
//               <action.icon className={`w-4 h-4 text-${action.color}-600`} />
//               {action.label}
//             </motion.button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { StatCard } from "../components/custom/StatCard";
import { DashboardChart } from "../components/custom/DashboardChart";
import { 
  Users, 
  Calendar, 
  Receipt, 
  DollarSign, 
  TrendingUp, 
  Clock,
  AlertCircle,
  Briefcase,
  UserPlus,
  UserMinus,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Download,
  Filter,
  CalendarDays,
  ChevronRight
} from "lucide-react";
import { userApi } from "../api/userApi";
import { toast } from "sonner";
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";




export const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
    const navigate = useNavigate();

  const [summary, setSummary] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    rejectedLeaves: 0,
    newLeaves: 0,
    totalExpenses: 0,
    monthlyExpenses: 0,
    expensesClaimed: 0,
    payrollProcessed: 0,
    payrollAmount: 0,
    salaryPaid: 0,
    departments: 0,
    newHiresThisMonth: 0,
    resignationsThisMonth: 0,
    attendanceRate: 0,
    overtime: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [departmentStats, setDepartmentStats] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [leaveChartData, setLeaveChartData] = useState([]);
  const [expenseChartData, setExpenseChartData] = useState([]);
  const [salaryChartData, setSalaryChartData] = useState([]);
  const [usersData, setUsersData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
            const response = await userApi.getDashboardSummary();
      
      // The response is already the data object from the API
      console.log("Dashboard data:", response); // For debugging
      
      // Handle the actual response structure
      if (response && response.success && response.data) {
        const { summary: summaryData, charts, users } = response.data;
        
        // Process summary data
        setSummary({
          totalEmployees: summaryData.totalUsers || 0,
          activeEmployees: users?.data?.filter(user => user.isActive).length || 0,
          pendingLeaves: summaryData.pendingLeaves || 0,
          approvedLeaves: summaryData.approvedLeaves || 0,
          rejectedLeaves: summaryData.rejectedLeaves || 0,
          newLeaves: summaryData.newLeaves || 0,
          totalExpenses: summaryData.expensesClaimed || 0,
          monthlyExpenses: summaryData.expensesClaimed || 0,
          expensesClaimed: summaryData.expensesClaimed || 0,
          payrollProcessed: summaryData.salaryPaid > 0 ? 1 : 0,
          payrollAmount: summaryData.salaryPaid || 0,
          salaryPaid: summaryData.salaryPaid || 0,
          departments: getUniqueDepartments(users?.data || []).length,
          newHiresThisMonth: getNewHiresThisMonth(users?.data || []),
          resignationsThisMonth: 0, // Not provided in current response
          attendanceRate: calculateAttendanceRate(summaryData),
          overtime: 0 // Not provided in current response
        });

        // Process chart data
        setLeaveChartData(charts?.leaves || []);
        setExpenseChartData(charts?.expenses || []);
        setSalaryChartData(charts?.salary || []);
        
        // Process users data
        setUsersData(users?.data || []);
        
        // Generate department stats from users data
        const deptStats = generateDepartmentStats(users?.data || []);
        setDepartmentStats(deptStats);
        
        // Generate monthly trends from chart data
        const trends = generateMonthlyTrends(charts);
        setMonthlyTrends(trends);
        
        // Generate recent activities from users data
        const activities = generateRecentActivities(users?.data || [], summaryData);
        setRecentActivities(activities);
        
        // Generate upcoming events (placeholder)
        const events = generateUpcomingEvents();
        setUpcomingEvents(events);
      } else {
        throw new Error("Invalid response structure");
      }
      
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error("Dashboard data fetch error:", error);
      
      // Set empty states
      resetStates();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getUniqueDepartments = (users) => {
    const departments = new Set();
    users.forEach(user => {
      if (user.department) {
        departments.add(user.department);
      }
    });
    return Array.from(departments);
  };

  const getNewHiresThisMonth = (users) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return users.filter(user => {
      const createdAt = new Date(user.createdAt);
      return createdAt.getMonth() === currentMonth && 
             createdAt.getFullYear() === currentYear;
    }).length;
  };

  const calculateAttendanceRate = (summaryData) => {
    // Calculate attendance rate based on leave data
    const totalLeaves = (summaryData.approvedLeaves || 0) + (summaryData.pendingLeaves || 0) + (summaryData.rejectedLeaves || 0);
    if (totalLeaves === 0) return 100;
    // Simple calculation - can be adjusted based on actual business logic
    const rate = 100 - (totalLeaves / (summaryData.totalUsers || 1) * 10);
    return Math.max(0, Math.min(100, Math.round(rate)));
  };

  const generateDepartmentStats = (users) => {
    const deptMap = new Map();
    
    users.forEach(user => {
      const dept = user.department || "Unassigned";
      if (!deptMap.has(dept)) {
        deptMap.set(dept, {
          name: dept,
          employeeCount: 0,
          expenses: 0
        });
      }
      deptMap.get(dept).employeeCount++;
    });
    
    return Array.from(deptMap.values());
  };

  const generateMonthlyTrends = (charts) => {
    // Use leave chart data to create monthly trends
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return (charts?.leaves || []).map((item, index) => ({
      month: months[item.month - 1] || `Month ${item.month}`,
      employeeCount: 0, // Not directly available, can be calculated from users data
      leaveRequests: item.value || 0
    }));
  };

  const generateRecentActivities = (users, summaryData) => {
    const activities = [];
    
    // Add recent user additions
    const recentUsers = [...users]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 3);
    
    recentUsers.forEach(user => {
      activities.push({
        type: 'hire',
        description: `New employee ${user.firstName} ${user.lastName} joined the ${user.department} department`,
        time: formatRelativeTime(user.createdAt)
      });
    });
    
    // Add leave activities if any
    if (summaryData.newLeaves > 0) {
      activities.push({
        type: 'leave',
        description: `${summaryData.newLeaves} new leave request${summaryData.newLeaves > 1 ? 's' : ''} pending approval`,
        time: 'Just now'
      });
    }
    
    return activities.slice(0, 5);
  };

  const generateUpcomingEvents = () => {
    // Generate placeholder events - can be enhanced with actual data
    const events = [];
    const today = new Date();
    
    events.push({
      title: "Monthly Review Meeting",
      date: new Date(today.setDate(today.getDate() + 5)),
      type: "meeting"
    });
    
    events.push({
      title: "Payroll Processing",
      date: new Date(today.setDate(today.getDate() + 10)),
      type: "payroll"
    });
    
    return events;
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const resetStates = () => {
    setSummary({
      totalEmployees: 0,
      activeEmployees: 0,
      pendingLeaves: 0,
      approvedLeaves: 0,
      rejectedLeaves: 0,
      newLeaves: 0,
      totalExpenses: 0,
      monthlyExpenses: 0,
      expensesClaimed: 0,
      payrollProcessed: 0,
      payrollAmount: 0,
      salaryPaid: 0,
      departments: 0,
      newHiresThisMonth: 0,
      resignationsThisMonth: 0,
      attendanceRate: 0,
      overtime: 0
    });
    setRecentActivities([]);
    setDepartmentStats([]);
    setMonthlyTrends([]);
    setUpcomingEvents([]);
    setLeaveChartData([]);
    setExpenseChartData([]);
    setSalaryChartData([]);
    setUsersData([]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  // Chart data using actual backend response
  const employeeTrendData = {
    labels: monthlyTrends.map(t => t.month),
    datasets: [
      {
        label: "Leave Requests",
        data: monthlyTrends.map(t => t.leaveRequests),
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        fill: true,
        tension: 0.4
      }
    ]
  };

  const leaveData = {
    labels: leaveChartData.map(item => `Month ${item.month}`),
    datasets: [
      {
        label: "Leave Requests",
        data: leaveChartData.map(item => item.value),
        backgroundColor: "#4F46E5",
        borderRadius: 6
      }
    ]
  };

  const expenseData = {
    labels: expenseChartData.map(item => `Month ${item.month}`),
    datasets: [
      {
        label: "Expenses",
        data: expenseChartData.map(item => item.value),
        backgroundColor: "#10B981",
        borderRadius: 6
      }
    ]
  };

  const salaryData = {
    labels: salaryChartData.map(item => `Month ${item.month}`),
    datasets: [
      {
        label: "Salary Paid",
        data: salaryChartData.map(item => item.value),
        backgroundColor: "#F59E0B",
        borderRadius: 6
      }
    ]
  };

  const expenseDistributionData = {
    labels: departmentStats.map(d => d.name),
    datasets: [
      {
        data: departmentStats.map(d => d.expenses || 0),
        backgroundColor: [
          "#4F46E5",
          "#10B981",
          "#F59E0B",
          "#EF4444",
          "#8B5CF6",
          "#EC4899"
        ]
      }
    ]
  };

  const departmentEmployeeData = {
    labels: departmentStats.map(d => d.name),
    datasets: [
      {
        label: "Employees",
        data: departmentStats.map(d => d.employeeCount),
        backgroundColor: "#4F46E5",
        borderRadius: 6
      }
    ]
  };

const quickStats = [ 
  {
    label: "Total Employees",
    value: formatNumber(summary.totalEmployees),
    icon: Users,
    change: summary.newHiresThisMonth,
    trend: summary.newHiresThisMonth > 0 ? 'up' : 'neutral',
    color: "indigo",
    subtext: `${summary.newHiresThisMonth} new this month`,
    path: "/users", // 🔹 add this
  },
  {
    label: "Pending Leaves",
    value: formatNumber(summary.pendingLeaves),
    icon: Calendar,
    change: summary.newLeaves,
    trend: summary.newLeaves > 0 ? 'up' : 'neutral',
    color: "amber",
    subtext: `${summary.approvedLeaves} approved, ${summary.rejectedLeaves} rejected`,
    path: "/leave", // 🔹 add this
  },
  {
    label: "Expenses Claimed",
    value: formatCurrency(summary.expensesClaimed),
    icon: Receipt,
    change: summary.expensesClaimed > 0 ? 5 : 0,
    trend: summary.expensesClaimed > 0 ? 'up' : 'neutral',
    color: "rose",
    subtext: "Total claimed expenses",
    path: "/expenses",
  },
  {
    label: "Salary Paid",
    value: formatCurrency(summary.salaryPaid),
    icon: DollarSign,
    change: summary.salaryPaid > 0 ? 10 : 0,
    trend: summary.salaryPaid > 0 ? 'up' : 'neutral',
    color: "emerald",
    subtext: "Total salary disbursed",
    path: "/payroll",
  }
];

  const periodOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' }
  ];

  return (
    <div data-testid="dashboard-page" className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      
      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
                Dashboard
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Welcome back, <span className="font-semibold text-indigo-600 dark:text-indigo-400">{user?.name?.split(' ')[0] || "User"}</span>! Here's what's happening with your organization.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Action Buttons */}
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

          {/* Quick Date Range */}
          <div className="mt-4 flex items-center gap-2 text-sm text-slate-500">
            <CalendarDays className="w-4 h-4" />
            <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
            <span className="mx-2">•</span>
            <span>Last updated: Just now</span>
          </div>
        </div>

        {/* Stats Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
      {quickStats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="cursor-pointer" // make it clear it’s clickable
          onClick={() => stat.path && navigate(stat.path)} // 🔹 navigate
        >
          <StatCard
            title={stat.label}
            value={stat.value}
            icon={stat.icon}
            loading={loading}
            trend={stat.trend}
            trendValue={stat.change ? `${stat.change > 0 ? '+' : ''}${stat.change}` : null}
            subtext={stat.subtext}
            color={stat.color}
          />
        </motion.div>
      ))}
    </div>


        {/* Charts Section */}
        {!loading && (leaveChartData.length > 0 || expenseChartData.length > 0 || salaryChartData.length > 0) ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
              {leaveChartData.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-600" />
                      Monthly Leave Requests
                    </h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <DashboardChart
                    type="bar"
                    data={leaveData}
                    loading={loading}
                    height={300}
                  />
                </div>
              )}

              {expenseChartData.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Receipt className="w-5 h-5 text-indigo-600" />
                      Monthly Expenses
                    </h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <DashboardChart
                    type="line"
                    data={expenseData}
                    loading={loading}
                    height={300}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
              {salaryChartData.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-indigo-600" />
                      Salary Distribution
                    </h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <DashboardChart
                    type="bar"
                    data={salaryData}
                    loading={loading}
                    height={300}
                  />
                </div>
              )}

              {departmentStats.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-indigo-600" />
                      Employees by Department
                    </h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <DashboardChart
                    type="bar"
                    data={departmentEmployeeData}
                    loading={loading}
                    height={300}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          !loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <div className="bg-white dark:bg-slate-900 rounded-xl p-12 text-center border border-slate-200 dark:border-slate-800">
                <div className="w-20 h-20 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-10 h-10 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  No Data Available
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Start adding employees and tracking data to see insights here.
                </p>
                <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition-all">
                  Add Employees
                </button>
              </div>
            </motion.div>
          )
        )}

        {/* Bottom Grid - Activities, Upcoming, Help */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all"
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
              <button className="text-sm text-indigo-600 hover:text-indigo-700">
                View All
              </button>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length > 0 ? (
              <div className="space-y-4">
                {recentActivities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                    <div className={`w-2 h-2 mt-2 rounded-full ${
                      activity.type === 'leave' ? 'bg-amber-500' :
                      activity.type === 'hire' ? 'bg-emerald-500' :
                      activity.type === 'expense' ? 'bg-blue-500' :
                      'bg-slate-400'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {activity.description}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No recent activities</p>
            )}
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all"
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

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="animate-pulse h-10 bg-slate-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">New Hires</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatNumber(summary.newHiresThisMonth)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Departments</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatNumber(summary.departments)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Attendance Rate</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {summary.attendanceRate}%
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-amber-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">New Leaves</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatNumber(summary.newLeaves)}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Help & Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-xl hover:shadow-2xl transition-all"
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
              <button className="w-full bg-white text-indigo-600 px-4 py-3 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-all transform hover:scale-[1.02]">
                View Documentation
              </button>
              
              <button className="w-full bg-indigo-500/20 text-white px-4 py-3 rounded-lg text-sm font-medium hover:bg-indigo-500/30 transition-all backdrop-blur border border-indigo-300/30 transform hover:scale-[1.02]">
                Contact Support
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-indigo-400/30">
              <div className="flex items-center justify-between text-sm">
                <span className="text-indigo-200">Average response time</span>
                <span className="font-semibold text-white">&lt; 2 hours</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-indigo-400/30 rounded-full overflow-hidden">
                  <div className="w-3/4 h-full bg-white rounded-full" />
                </div>
                <span className="text-xs text-indigo-200">95% satisfaction</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Add Employee', icon: UserPlus, color: 'indigo' },
            { label: 'Process Payroll', icon: DollarSign, color: 'emerald' },
            { label: 'Approve Leaves', icon: Calendar, color: 'amber' },
            { label: 'View Reports', icon: BarChart3, color: 'purple' }
          ].map((action, index) => (
            <motion.button
              key={action.label}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:border-indigo-600 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
            >
              <action.icon className={`w-4 h-4 text-${action.color}-600`} />
              {action.label}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};