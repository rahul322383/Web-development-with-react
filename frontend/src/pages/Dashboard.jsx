
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
// import { useNavigate } from "react-router-dom";




// export const Dashboard = () => {
//   const user = useAuthStore((state) => state.user);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [selectedPeriod, setSelectedPeriod] = useState('month');
//     const navigate = useNavigate();

//   const [summary, setSummary] = useState({
//     totalEmployees: 0,
//     activeEmployees: 0,
//     pendingLeaves: 0,
//     approvedLeaves: 0,
//     rejectedLeaves: 0,
//     newLeaves: 0,
//     totalExpenses: 0,
//     monthlyExpenses: 0,
//     expensesClaimed: 0,
//     payrollProcessed: 0,
//     payrollAmount: 0,
//     salaryPaid: 0,
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
//   const [leaveChartData, setLeaveChartData] = useState([]);
//   const [expenseChartData, setExpenseChartData] = useState([]);
//   const [salaryChartData, setSalaryChartData] = useState([]);
//   const [usersData, setUsersData] = useState([]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//             const response = await userApi.getDashboardSummary();
      

//       if (response && response.success && response.data) {
//         const { summary: summaryData, charts, users } = response.data;
     
//         setSummary({
//           totalEmployees: summaryData.totalUsers || 0,
//           activeEmployees: users?.data?.filter(user => user.isActive).length || 0,
//           pendingLeaves: summaryData.pendingLeaves || 0,
//           approvedLeaves: summaryData.approvedLeaves || 0,
//           rejectedLeaves: summaryData.rejectedLeaves || 0,
//           newLeaves: summaryData.newLeaves || 0,
//           totalExpenses: summaryData.expensesClaimed || 0,
//           monthlyExpenses: summaryData.expensesClaimed || 0,
//           expensesClaimed: summaryData.expensesClaimed || 0,
//           payrollProcessed: summaryData.salaryPaid > 0 ? 1 : 0,
//           payrollAmount: summaryData.salaryPaid || 0,
//           salaryPaid: summaryData.salaryPaid || 0,
//           departments: getUniqueDepartments(users?.data || []).length,
//           newHiresThisMonth: getNewHiresThisMonth(users?.data || []),
//           resignationsThisMonth: 0,   
//           attendanceRate: calculateAttendanceRate(summaryData),
//           overtime: 0 
//         });

//         // Process chart data
//         setLeaveChartData(charts?.leaves || []);
//         setExpenseChartData(charts?.expenses || []);
//         setSalaryChartData(charts?.salary || []);
        
//         // Process users data
//         setUsersData(users?.data || []);
        
//         // Generate department stats from users data
//         const deptStats = generateDepartmentStats(users?.data || []);
//         setDepartmentStats(deptStats);
        
//         // Generate monthly trends from chart data
//         const trends = generateMonthlyTrends(charts);
//         setMonthlyTrends(trends);
        
//         // Generate recent activities from users data
//         const activities = generateRecentActivities(users?.data || [], summaryData);
//         setRecentActivities(activities);
        
//         // Generate upcoming events (placeholder)
//         const events = generateUpcomingEvents();
//         setUpcomingEvents(events);
//       } else {
//         throw new Error("Invalid response structure");
//       }
      
//     } catch (error) {
//       toast.error("Failed to load dashboard data");
//       console.error("Dashboard data fetch error:", error);
      
//       // Set empty states
//       resetStates();
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const getUniqueDepartments = (users) => {
//     const departments = new Set();
//     users.forEach(user => {
//       if (user.department) {
//         departments.add(user.department);
//       }
//     });
//     return Array.from(departments);
//   };

//   const getNewHiresThisMonth = (users) => {
//     const currentDate = new Date();
//     const currentMonth = currentDate.getMonth();
//     const currentYear = currentDate.getFullYear();
    
//     return users.filter(user => {
//       const createdAt = new Date(user.createdAt);
//       return createdAt.getMonth() === currentMonth && 
//              createdAt.getFullYear() === currentYear;
//     }).length;
//   };

//   const calculateAttendanceRate = (summaryData) => {
//     // Calculate attendance rate based on leave data
//     const totalLeaves = (summaryData.approvedLeaves || 0) + (summaryData.pendingLeaves || 0) + (summaryData.rejectedLeaves || 0);
//     if (totalLeaves === 0) return 100;
//     // Simple calculation - can be adjusted based on actual business logic
//     const rate = 100 - (totalLeaves / (summaryData.totalUsers || 1) * 10);
//     return Math.max(0, Math.min(100, Math.round(rate)));
//   };

//   const generateDepartmentStats = (users) => {
//     const deptMap = new Map();
    
//     users.forEach(user => {
//       const dept = user.department || "Unassigned";
//       if (!deptMap.has(dept)) {
//         deptMap.set(dept, {
//           name: dept,
//           employeeCount: 0,
//           expenses: 0
//         });
//       }
//       deptMap.get(dept).employeeCount++;
//     });
    
//     return Array.from(deptMap.values());
//   };

//   const generateMonthlyTrends = (charts) => {
//     // Use leave chart data to create monthly trends
//     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
//     return (charts?.leaves || []).map((item, index) => ({
//       month: months[item.month - 1] || `Month ${item.month}`,
//       employeeCount: 0, // Not directly available, can be calculated from users data
//       leaveRequests: item.value || 0
//     }));
//   };

//   const generateRecentActivities = (users, summaryData) => {
//     const activities = [];
    
//     // Add recent user additions
//     const recentUsers = [...users]
//       .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
//       .slice(0, 3);
    
//     recentUsers.forEach(user => {
//       activities.push({
//         type: 'hire',
//         description: `New employee ${user.firstName} ${user.lastName} joined the ${user.department} department`,
//         time: formatRelativeTime(user.createdAt)
//       });
//     });
    
//     // Add leave activities if any
//     if (summaryData.newLeaves > 0) {
//       activities.push({
//         type: 'leave',
//         description: `${summaryData.newLeaves} new leave request${summaryData.newLeaves > 1 ? 's' : ''} pending approval`,
//         time: 'Just now'
//       });
//     }
    
//     return activities.slice(0, 5);
//   };

//   const generateUpcomingEvents = () => {
//     // Generate placeholder events - can be enhanced with actual data
//     const events = [];
//     const today = new Date();
    
//     events.push({
//       title: "Monthly Review Meeting",
//       date: new Date(today.setDate(today.getDate() + 5)),
//       type: "meeting"
//     });
    
//     events.push({
//       title: "Payroll Processing",
//       date: new Date(today.setDate(today.getDate() + 10)),
//       type: "payroll"
//     });
    
//     return events;
//   };

//   const formatRelativeTime = (dateString) => {
//     const date = new Date(dateString);
//     const now = new Date();
//     const diffTime = Math.abs(now - date);
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
//     if (diffDays === 0) return "Today";
//     if (diffDays === 1) return "Yesterday";
//     if (diffDays < 7) return `${diffDays} days ago`;
//     if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
//     return date.toLocaleDateString();
//   };

//   const resetStates = () => {
//     setSummary({
//       totalEmployees: 0,
//       activeEmployees: 0,
//       pendingLeaves: 0,
//       approvedLeaves: 0,
//       rejectedLeaves: 0,
//       newLeaves: 0,
//       totalExpenses: 0,
//       monthlyExpenses: 0,
//       expensesClaimed: 0,
//       payrollProcessed: 0,
//       payrollAmount: 0,
//       salaryPaid: 0,
//       departments: 0,
//       newHiresThisMonth: 0,
//       resignationsThisMonth: 0,
//       attendanceRate: 0,
//       overtime: 0
//     });
//     setRecentActivities([]);
//     setDepartmentStats([]);
//     setMonthlyTrends([]);
//     setUpcomingEvents([]);
//     setLeaveChartData([]);
//     setExpenseChartData([]);
//     setSalaryChartData([]);
//     setUsersData([]);
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

//   // Chart data using actual backend response
//   const employeeTrendData = {
//     labels: monthlyTrends.map(t => t.month),
//     datasets: [
//       {
//         label: "Leave Requests",
//         data: monthlyTrends.map(t => t.leaveRequests),
//         borderColor: "#4F46E5",
//         backgroundColor: "rgba(79, 70, 229, 0.1)",
//         fill: true,
//         tension: 0.4
//       }
//     ]
//   };

//   const leaveData = {
//     labels: leaveChartData.map(item => `Month ${item.month}`),
//     datasets: [
//       {
//         label: "Leave Requests",
//         data: leaveChartData.map(item => item.value),
//         backgroundColor: "#4F46E5",
//         borderRadius: 6
//       }
//     ]
//   };

//   const expenseData = {
//     labels: expenseChartData.map(item => `Month ${item.month}`),
//     datasets: [
//       {
//         label: "Expenses",
//         data: expenseChartData.map(item => item.value),
//         backgroundColor: "#10B981",
//         borderRadius: 6
//       }
//     ]
//   };

//   const salaryData = {
//     labels: salaryChartData.map(item => `Month ${item.month}`),
//     datasets: [
//       {
//         label: "Salary Paid",
//         data: salaryChartData.map(item => item.value),
//         backgroundColor: "#F59E0B",
//         borderRadius: 6
//       }
//     ]
//   };

//   const expenseDistributionData = {
//     labels: departmentStats.map(d => d.name),
//     datasets: [
//       {
//         data: departmentStats.map(d => d.expenses || 0),
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

// const quickStats = [ 
//   {
//     label: "Total Employees",
//     value: formatNumber(summary.totalEmployees),
//     icon: Users,
//     change: summary.newHiresThisMonth,
//     trend: summary.newHiresThisMonth > 0 ? 'up' : 'neutral',
//     color: "indigo",
//     subtext: `${summary.newHiresThisMonth} new this month`,
//     path: "/users", // 🔹 add this
//   },
//   {
//     label: "Pending Leaves",
//     value: formatNumber(summary.pendingLeaves),
//     icon: Calendar,
//     change: summary.newLeaves,
//     trend: summary.newLeaves > 0 ? 'up' : 'neutral',
//     color: "amber",
//     subtext: `${summary.approvedLeaves} approved, ${summary.rejectedLeaves} rejected`,
//     path: "/leave", // 🔹 add this
//   },
//   {
//     label: "Expenses Claimed",
//     value: formatCurrency(summary.expensesClaimed),
//     icon: Receipt,
//     change: summary.expensesClaimed > 0 ? 5 : 0,
//     trend: summary.expensesClaimed > 0 ? 'up' : 'neutral',
//     color: "rose",
//     subtext: "Total claimed expenses",
//     path: "/expenses",
//   },
//   {
//     label: "Salary Paid",
//     value: formatCurrency(summary.salaryPaid),
//     icon: DollarSign,
//     change: summary.salaryPaid > 0 ? 10 : 0,
//     trend: summary.salaryPaid > 0 ? 'up' : 'neutral',
//     color: "emerald",
//     subtext: "Total salary disbursed",
//     path: "/payroll",
//   }
// ];

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
// <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
//       {quickStats.map((stat, index) => (
//         <motion.div
//           key={stat.label}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: index * 0.1 }}
//           className="cursor-pointer" // make it clear it’s clickable
//           onClick={() => stat.path && navigate(stat.path)} // 🔹 navigate
//         >
//           <StatCard
//             title={stat.label}
//             value={stat.value}
//             icon={stat.icon}
//             loading={loading}
//             trend={stat.trend}
//             trendValue={stat.change ? `${stat.change > 0 ? '+' : ''}${stat.change}` : null}
//             subtext={stat.subtext}
//             color={stat.color}
//           />
//         </motion.div>
//       ))}
//     </div>


//         {/* Charts Section */}
//         {!loading && (leaveChartData.length > 0 || expenseChartData.length > 0 || salaryChartData.length > 0) ? (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.3 }}
//           >
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
//               {leaveChartData.length > 0 && (
//                 <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                       <Calendar className="w-5 h-5 text-indigo-600" />
//                       Monthly Leave Requests
//                     </h3>
//                     <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
//                       Details <ChevronRight className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <DashboardChart
//                     type="bar"
//                     data={leaveData}
//                     loading={loading}
//                     height={300}
//                   />
//                 </div>
//               )}

//               {expenseChartData.length > 0 && (
//                 <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                       <Receipt className="w-5 h-5 text-indigo-600" />
//                       Monthly Expenses
//                     </h3>
//                     <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
//                       Details <ChevronRight className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <DashboardChart
//                     type="line"
//                     data={expenseData}
//                     loading={loading}
//                     height={300}
//                   />
//                 </div>
//               )}
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
//               {salaryChartData.length > 0 && (
//                 <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
//                   <div className="flex items-center justify-between mb-4">
//                     <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
//                       <DollarSign className="w-5 h-5 text-indigo-600" />
//                       Salary Distribution
//                     </h3>
//                     <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
//                       Details <ChevronRight className="w-4 h-4" />
//                     </button>
//                   </div>
//                   <DashboardChart
//                     type="bar"
//                     data={salaryData}
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
//                     <Briefcase className="h-4 w-4 text-indigo-600" />
//                     <span className="text-sm text-slate-600 dark:text-slate-400">Departments</span>
//                   </div>
//                   <span className="font-semibold text-slate-900 dark:text-white">
//                     {formatNumber(summary.departments)}
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
//                   <div className="flex items-center gap-2">
//                     <Activity className="h-4 w-4 text-purple-600" />
//                     <span className="text-sm text-slate-600 dark:text-slate-400">Attendance Rate</span>
//                   </div>
//                   <span className="font-semibold text-slate-900 dark:text-white">
//                     {summary.attendanceRate}%
//                   </span>
//                 </div>

//                 <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
//                   <div className="flex items-center gap-2">
//                     <Calendar className="h-4 w-4 text-amber-600" />
//                     <span className="text-sm text-slate-600 dark:text-slate-400">New Leaves</span>
//                   </div>
//                   <span className="font-semibold text-slate-900 dark:text-white">
//                     {formatNumber(summary.newLeaves)}
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
  BarChart3,
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
import useAuthStore from "../store/authStore";
import { useNavigate } from "react-router-dom";

// StatCard Component
const StatCard = ({ title, value, icon: Icon, loading, trend, trendValue, subtext, color = "indigo" }) => {
  const colorClasses = {
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    rose: "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  };

  const trendColors = {
    up: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
    down: "text-rose-600 bg-rose-50 dark:bg-rose-900/20",
    neutral: "text-slate-600 bg-slate-50 dark:bg-slate-800"
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 animate-pulse">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{value}</h3>
        </div>
        <div className={`h-12 w-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        {trend && trendValue && (
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${trendColors[trend]}`}>
            {trend === 'up' && <TrendingUp className="h-3 w-3" />}
            {trend === 'down' && <TrendingUp className="h-3 w-3 rotate-180" />}
            <span>{trendValue}</span>
          </div>
        )}
        {subtext && (
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtext}</p>
        )}
      </div>
    </div>
  );
};

// DashboardChart Component
const DashboardChart = ({ type = "bar", data, loading, height = 300 }) => {
  const canvasRef = React.useRef(null);

  useEffect(() => {
    if (!canvasRef.current || loading || !data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;
    
    canvas.width = container.clientWidth;
    canvas.height = height;

    const drawChart = () => {
      const width = canvas.width;
      const chartHeight = canvas.height - 60;
      const padding = { top: 20, right: 20, bottom: 40, left: 60 };
      
      // Clear canvas
      ctx.clearRect(0, 0, width, canvas.height);
      
      // Draw grid
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

          // Gradient
          const gradient = ctx.createLinearGradient(x, y, x + barWidth, y + barHeight);
          gradient.addColorStop(0, data.datasets[0].backgroundColor);
          gradient.addColorStop(1, `${data.datasets[0].backgroundColor}cc`);
          
          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, barWidth, barHeight);

          // Value label
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
          const x = padding.left + (index * (width - padding.left - padding.right) / (data.labels.length - 1));
          const y = padding.top + chartHeight - (value / maxValue) * chartHeight;
          
          if (index === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        ctx.stroke();

        // Points
        data.datasets[0].data.forEach((value, index) => {
          const x = padding.left + (index * (width - padding.left - padding.right) / (data.labels.length - 1));
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

      // Labels
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

// Main Dashboard Component
export const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Fetch dashboard data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await userApi.getDashboardSummary();
      
      if (response?.success && response?.data) {
        setDashboardData(response.data);
        toast.success("Dashboard data loaded successfully");
      } else {
        throw new Error("Invalid response structure");
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error("Dashboard data fetch error:", error);
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

  // Process data for display
  const processedData = useMemo(() => {
    if (!dashboardData) return null;

    const { summary, charts, users, leaves } = dashboardData;
    
    // Calculate active employees
    const activeEmployees = users?.data?.filter(u => u.isActive).length || 0;
    
    // Get unique departments
    const departments = [...new Set(users?.data?.map(u => u.department).filter(Boolean))];
    
    // Calculate new hires this month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const newHiresThisMonth = users?.data?.filter(u => {
      const created = new Date(u.createdAt);
      return created.getMonth() === currentMonth && created.getFullYear() === currentYear;
    }).length || 0;

    // Process department statistics
    const departmentStats = departments.map(dept => ({
      name: dept,
      employeeCount: users?.data?.filter(u => u.department === dept).length || 0,
      totalSalary: users?.data
        ?.filter(u => u.department === dept)
        .reduce((sum, u) => sum + parseFloat(u.baseSalary || 0), 0) || 0
    }));

    // Calculate attendance rate
    const totalLeaveRequests = (summary.approvedLeaves || 0) + 
                              (summary.pendingLeaves || 0) + 
                              (summary.rejectedLeaves || 0);
    const attendanceRate = summary.totalUsers > 0 
      ? Math.round(100 - (totalLeaveRequests / summary.totalUsers) * 5)
      : 100;

    // Format recent activities
    const recentActivities = [
      ...users?.data?.slice(0, 3).map(u => ({
        type: 'hire',
        description: `${u.firstName} ${u.lastName} joined ${u.department}`,
        time: new Date(u.createdAt).toLocaleDateString(),
        icon: UserPlus
      })) || [],
      ...leaves?.pending?.slice(0, 2).map(l => ({
        type: 'leave',
        description: `${l.employeeName || 'Employee'} requested leave`,
        time: new Date(l.startDate).toLocaleDateString(),
        icon: Calendar
      })) || []
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

    // Prepare chart data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const leaveChartData = {
      labels: months,
      datasets: [{
        label: "Leave Requests",
        data: charts?.leaves?.map(l => l.value) || Array(12).fill(0),
        backgroundColor: "#4F46E5",
        borderColor: "#4F46E5"
      }]
    };

    // Department distribution chart
    const departmentChartData = {
      labels: departmentStats.map(d => d.name),
      datasets: [{
        label: "Employees",
        data: departmentStats.map(d => d.employeeCount),
        backgroundColor: "#8B5CF6",
        borderColor: "#8B5CF6"
      }]
    };

    // Salary distribution chart
    const salaryChartData = {
      labels: departmentStats.map(d => d.name),
      datasets: [{
        label: "Total Salary",
        data: departmentStats.map(d => d.totalSalary),
        backgroundColor: "#10B981",
        borderColor: "#10B981"
      }]
    };

    return {
      summary: {
        totalEmployees: summary.totalUsers || 0,
        activeEmployees,
        pendingLeaves: summary.pendingLeaves || 0,
        approvedLeaves: summary.approvedLeaves || 0,
        rejectedLeaves: summary.rejectedLeaves || 0,
        newLeaves: summary.newLeaves || 0,
        expensesClaimed: summary.expensesClaimed || 0,
        salaryPaid: summary.salaryPaid || 0,
        departments: departments.length,
        newHiresThisMonth,
        attendanceRate: Math.min(100, Math.max(0, attendanceRate))
      },
      charts: {
        leaves: leaveChartData,
        departments: departmentChartData,
        salary: salaryChartData
      },
      recentActivities,
      departmentStats,
      pendingLeaves: leaves?.pending || [],
      users: users?.data || []
    };
  }, [dashboardData]);

  // Format helpers
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

  // Quick stats configuration
  const quickStats = useMemo(() => {
    if (!processedData) return [];
    
    const { summary } = processedData;
    return [
      {
        label: "Total Employees",
        value: formatNumber(summary.totalEmployees),
        icon: Users,
        change: summary.newHiresThisMonth,
        trend: summary.newHiresThisMonth > 0 ? 'up' : 'neutral',
        color: "indigo",
        subtext: `${summary.newHiresThisMonth} new this month`,
        path: "/users",
      },
      {
        label: "Pending Leaves",
        value: formatNumber(summary.pendingLeaves),
        icon: Calendar,
        change: summary.newLeaves,
        trend: summary.newLeaves > 0 ? 'up' : 'neutral',
        color: "amber",
        subtext: `${summary.approvedLeaves} approved, ${summary.rejectedLeaves} rejected`,
        path: "/leave",
      },
      {
        label: "Expenses Claimed",
        value: formatCurrency(summary.expensesClaimed),
        icon: Receipt,
        change: 0,
        trend: 'neutral',
        color: "rose",
        subtext: "Total claimed expenses",
        path: "/expenses",
      },
      {
        label: "Salary Paid",
        value: formatCurrency(summary.salaryPaid),
        icon: DollarSign,
        change: 0,
        trend: 'neutral',
        color: "emerald",
        subtext: "Total salary disbursed",
        path: "/payroll",
      }
    ];
  }, [processedData]);

  // Loading state
  if (loading && !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
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
                  {user?.name?.split(' ')[0] || "User"}
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
              key={stat.label}
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
              <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
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
              <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
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
              <button className="text-sm text-indigo-600 hover:text-indigo-700">
                View All
              </button>
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
                onClick={() => navigate('/leave')}
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
                          {leave.reason.replace('-', ' ')}
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