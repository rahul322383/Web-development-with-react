// import React, { useEffect, useState } from "react";
// import { DashboardLayout } from "../components/layout/DashboardLayout";
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
//   HelpCircle
// } from "lucide-react";
// import { userApi } from "../api/userApi";
// import { toast } from "sonner";
// import useAuthStore from "../store/authStore";

// export const Dashboard = () => {
//   const user = useAuthStore((state) => state.user);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);

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
//     resignationsThisMonth: 0
//   });

//   const [recentActivities, setRecentActivities] = useState([]);
//   const [departmentStats, setDepartmentStats] = useState([]);
//   const [monthlyTrends, setMonthlyTrends] = useState([]);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const data = await userApi.getDashboardSummary();
      
//       // Process and structure the real data
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
//         resignationsThisMonth: data.resignationsThisMonth || 0
//       });

//       setRecentActivities(data.recentActivities || []);
//       setDepartmentStats(data.departmentStats || []);
//       setMonthlyTrends(data.monthlyTrends || []);
      
//     } catch (error) {
//       toast.error("Failed to load dashboard data");
//       console.error("Dashboard data fetch error:", error);
      
//       // Set empty states instead of mock data
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
//         resignationsThisMonth: 0
//       });
//       setRecentActivities([]);
//       setDepartmentStats([]);
//       setMonthlyTrends([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     await fetchDashboardData();
//   };

//   // Format currency
//   const formatCurrency = (amount) => {
//     return new Intl.NumberFormat('en-US', {
//       style: 'currency',
//       currency: 'USD',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     }).format(amount);
//   };

//   // Prepare chart data from real data
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

//   // Quick stats for the bottom section
//   const quickStats = [
//     {
//       label: "Active Employees",
//       value: summary.activeEmployees,
//       icon: Briefcase,
//       change: summary.newHiresThisMonth - summary.resignationsThisMonth,
//       trend: summary.newHiresThisMonth > summary.resignationsThisMonth ? 'up' : 'down',
//       color: "emerald"
//     },
//     {
//       label: "New Hires (MTD)",
//       value: summary.newHiresThisMonth,
//       icon: UserPlus,
//       change: null,
//       trend: 'up',
//       color: "blue"
//     },
//     {
//       label: "Resignations (MTD)",
//       value: summary.resignationsThisMonth,
//       icon: UserMinus,
//       change: null,
//       trend: 'down',
//       color: "rose"
//     }
//   ];

//   return (
//     <DashboardLayout>
//       <div data-testid="dashboard-page" className="min-h-screen bg-slate-50">
        
//         {/* Header with Refresh */}
//         <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 mb-2">
//               Dashboard
//             </h1>
//             <p className="text-slate-600">
//               Welcome back, {user?.name || "User"}! Here's your organization overview.
//             </p>
//           </div>
          
//           <button
//             onClick={handleRefresh}
//             disabled={refreshing}
//             className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <svg 
//               className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} 
//               fill="none" 
//               stroke="currentColor" 
//               viewBox="0 0 24 24"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//             </svg>
//             {refreshing ? 'Refreshing...' : 'Refresh Data'}
//           </button>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
//           <StatCard
//             title="Total Employees"
//             value={summary.totalEmployees}
//             description="Active workforce"
//             icon={Users}
//             loading={loading}
//             trend={summary.newHiresThisMonth > 0 ? 'up' : null}
//             trendValue={summary.newHiresThisMonth > 0 ? `+${summary.newHiresThisMonth} this month` : null}
//           />

//           <StatCard
//             title="Pending Leaves"
//             value={summary.pendingLeaves}
//             description="Awaiting approval"
//             icon={Calendar}
//             loading={loading}
//             trend={summary.pendingLeaves > 5 ? 'up' : 'down'}
//             trendValue={summary.pendingLeaves > 0 ? `${summary.pendingLeaves} requests` : 'No pending'}
//           />

//           <StatCard
//             title="Monthly Expenses"
//             value={formatCurrency(summary.monthlyExpenses)}
//             description="Current month"
//             icon={Receipt}
//             loading={loading}
//             trend={summary.monthlyExpenses > summary.totalExpenses / 12 ? 'up' : 'down'}
//           />

//           <StatCard
//             title="Payroll Processed"
//             value={`${summary.payrollProcessed}%`}
//             description={`${formatCurrency(summary.payrollAmount)} total`}
//             icon={DollarSign}
//             loading={loading}
//             trend={summary.payrollProcessed === 100 ? 'up' : 'down'}
//             trendValue={summary.payrollProcessed === 100 ? 'Completed' : 'In progress'}
//           />
//         </div>

//         {/* Charts Section */}
//         {!loading && monthlyTrends.length > 0 && (
//           <>
//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
//               <DashboardChart
//                 type="line"
//                 title="Employee Growth Trend"
//                 data={employeeTrendData}
//                 loading={loading}
//                 height={300}
//               />

//               <DashboardChart
//                 type="bar"
//                 title="Monthly Leave Requests"
//                 data={leaveData}
//                 loading={loading}
//                 height={300}
//               />
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
//               {departmentStats.length > 0 && (
//                 <DashboardChart
//                   type="doughnut"
//                   title="Expense Distribution by Department"
//                   data={expenseDistributionData}
//                   loading={loading}
//                   height={300}
//                 />
//               )}

//               {departmentStats.length > 0 && (
//                 <DashboardChart
//                   type="bar"
//                   title="Employees by Department"
//                   data={departmentEmployeeData}
//                   loading={loading}
//                   height={300}
//                 />
//               )}
//             </div>
//           </>
//         )}

//         {/* Empty State for Charts */}
//         {!loading && monthlyTrends.length === 0 && (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
//             <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
//               <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
//               <h3 className="text-lg font-semibold text-slate-900 mb-2">No Chart Data Available</h3>
//               <p className="text-slate-600">Start adding employees and tracking data to see insights here.</p>
//             </div>
//           </div>
//         )}

//         {/* Quick Stats and Activities */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          
//           {/* Recent Activities */}
//           <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
//             <div className="flex items-center space-x-3 mb-6">
//               <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center">
//                 <Clock className="h-5 w-5 text-indigo-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-slate-900">
//                 Recent Activities
//               </h3>
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
//                   <div key={index} className="flex items-start space-x-3">
//                     <div className={`h-2 w-2 mt-2 rounded-full ${
//                       activity.type === 'leave' ? 'bg-yellow-400' :
//                       activity.type === 'hire' ? 'bg-green-400' :
//                       activity.type === 'expense' ? 'bg-blue-400' :
//                       'bg-slate-400'
//                     }`} />
//                     <div className="flex-1">
//                       <p className="text-sm font-medium text-slate-900">{activity.description}</p>
//                       <p className="text-xs text-slate-500">{activity.time}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <p className="text-sm text-slate-500 text-center py-4">No recent activities</p>
//             )}
//           </div>

//           {/* Quick Stats */}
//           <div className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-all">
//             <div className="flex items-center space-x-3 mb-6">
//               <div className="h-10 w-10 rounded-lg bg-emerald-100 flex items-center justify-center">
//                 <TrendingUp className="h-5 w-5 text-emerald-600" />
//               </div>
//               <h3 className="text-lg font-semibold text-slate-900">
//                 Quick Stats
//               </h3>
//             </div>

//             {loading ? (
//               <div className="space-y-4">
//                 {[1, 2, 3].map(i => (
//                   <div key={i} className="animate-pulse">
//                     <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
//                   </div>
//                 ))}
//               </div>
//             ) : (
//               <div className="space-y-4">
//                 {quickStats.map((stat, index) => (
//                   <div key={index} className="flex items-center justify-between">
//                     <div className="flex items-center space-x-2">
//                       <stat.icon className={`h-4 w-4 text-${stat.color}-600`} />
//                       <span className="text-sm text-slate-600">{stat.label}</span>
//                     </div>
//                     <div className="flex items-center space-x-2">
//                       <span className="font-semibold text-slate-900">{stat.value}</span>
//                       {stat.change !== null && stat.change !== 0 && (
//                         <span className={`flex items-center text-xs ${
//                           stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
//                         }`}>
//                           {stat.trend === 'up' ? 
//                             <ArrowUpRight className="h-3 w-3" /> : 
//                             <ArrowDownRight className="h-3 w-3" />
//                           }
//                           {Math.abs(stat.change)}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 ))}

//                 <div className="pt-4 mt-4 border-t border-slate-100">
//                   <div className="flex items-center justify-between">
//                     <span className="text-sm text-slate-600">Departments</span>
//                     <span className="font-semibold text-slate-900">{summary.departments}</span>
//                   </div>
//                   <div className="flex items-center justify-between mt-2">
//                     <span className="text-sm text-slate-600">Approved Leaves</span>
//                     <span className="font-semibold text-slate-900">{summary.approvedLeaves}</span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Help & Support */}
//           <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 text-white hover:shadow-lg transition-all">
//             <div className="flex items-center space-x-3 mb-4">
//               <div className="h-10 w-10 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur">
//                 <HelpCircle className="h-5 w-5 text-white" />
//               </div>
//               <h3 className="text-lg font-semibold">Need Help?</h3>
//             </div>

//             <p className="text-indigo-100 text-sm mb-6">
//               Access documentation, video tutorials, or contact our support team for assistance.
//             </p>

//             <div className="space-y-3">
//               <button className="w-full bg-white text-indigo-600 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors">
//                 View Documentation
//               </button>
              
//               <button className="w-full bg-indigo-400/20 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-400/30 transition-colors backdrop-blur border border-indigo-300/30">
//                 Contact Support
//               </button>
//             </div>

//             <div className="mt-6 pt-6 border-t border-indigo-400/30">
//               <p className="text-xs text-indigo-200">
//                 Average response time: &lt; 2 hours
//               </p>
//             </div>
//           </div>
//         </div>

//         {/* Footer Stats */}
//         <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
//           <div className="bg-white/50 rounded-lg p-3">
//             <p className="text-slate-600">Total Departments</p>
//             <p className="text-xl font-semibold text-slate-900">{summary.departments}</p>
//           </div>
//           <div className="bg-white/50 rounded-lg p-3">
//             <p className="text-slate-600">Active Employees</p>
//             <p className="text-xl font-semibold text-slate-900">{summary.activeEmployees}</p>
//           </div>
//           <div className="bg-white/50 rounded-lg p-3">
//             <p className="text-slate-600">Approved Leaves</p>
//             <p className="text-xl font-semibold text-slate-900">{summary.approvedLeaves}</p>
//           </div>
//           <div className="bg-white/50 rounded-lg p-3">
//             <p className="text-slate-600">Payroll Date</p>
//             <p className="text-xl font-semibold text-slate-900">
//               {new Date().getDate() > 25 ? 'Next Month' : '25th'}
//             </p>
//           </div>
//         </div>

//       </div>
//     </DashboardLayout>
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

export const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  const [summary, setSummary] = useState({
    totalEmployees: 0,
    activeEmployees: 0,
    pendingLeaves: 0,
    approvedLeaves: 0,
    totalExpenses: 0,
    monthlyExpenses: 0,
    payrollProcessed: 0,
    payrollAmount: 0,
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await userApi.getDashboardSummary();
      
      setSummary({
        totalEmployees: data.totalEmployees || 0,
        activeEmployees: data.activeEmployees || 0,
        pendingLeaves: data.pendingLeaves || 0,
        approvedLeaves: data.approvedLeaves || 0,
        totalExpenses: data.totalExpenses || 0,
        monthlyExpenses: data.monthlyExpenses || 0,
        payrollProcessed: data.payrollProcessed || 0,
        payrollAmount: data.payrollAmount || 0,
        departments: data.departments?.length || 0,
        newHiresThisMonth: data.newHiresThisMonth || 0,
        resignationsThisMonth: data.resignationsThisMonth || 0,
        attendanceRate: data.attendanceRate || 0,
        overtime: data.overtime || 0
      });

      setRecentActivities(data.recentActivities || []);
      setDepartmentStats(data.departmentStats || []);
      setMonthlyTrends(data.monthlyTrends || []);
      setUpcomingEvents(data.upcomingEvents || []);
      
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error("Dashboard data fetch error:", error);
      
      // Set empty states
      setSummary({
        totalEmployees: 0,
        activeEmployees: 0,
        pendingLeaves: 0,
        approvedLeaves: 0,
        totalExpenses: 0,
        monthlyExpenses: 0,
        payrollProcessed: 0,
        payrollAmount: 0,
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
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
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

  // Chart data
  const employeeTrendData = {
    labels: monthlyTrends.map(t => t.month),
    datasets: [
      {
        label: "Total Employees",
        data: monthlyTrends.map(t => t.employeeCount),
        borderColor: "#4F46E5",
        backgroundColor: "rgba(79, 70, 229, 0.1)",
        fill: true,
        tension: 0.4
      }
    ]
  };

  const leaveData = {
    labels: monthlyTrends.map(t => t.month),
    datasets: [
      {
        label: "Leave Requests",
        data: monthlyTrends.map(t => t.leaveRequests),
        backgroundColor: "#4F46E5",
        borderRadius: 6
      }
    ]
  };

  const expenseDistributionData = {
    labels: departmentStats.map(d => d.name),
    datasets: [
      {
        data: departmentStats.map(d => d.expenses),
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
      label: "Active Employees",
      value: formatNumber(summary.activeEmployees),
      icon: Briefcase,
      change: summary.newHiresThisMonth - summary.resignationsThisMonth,
      trend: summary.newHiresThisMonth > summary.resignationsThisMonth ? 'up' : 'down',
      color: "emerald",
      subtext: `${summary.newHiresThisMonth} new this month`
    },
    {
      label: "Attendance Rate",
      value: `${summary.attendanceRate}%`,
      icon: Clock,
      change: 2.5,
      trend: 'up',
      color: "blue",
      subtext: "Above target"
    },
    {
      label: "Pending Leaves",
      value: formatNumber(summary.pendingLeaves),
      icon: Calendar,
      change: -3,
      trend: 'down',
      color: "amber",
      subtext: `${summary.approvedLeaves} approved`
    },
    {
      label: "Monthly Expenses",
      value: formatCurrency(summary.monthlyExpenses),
      icon: Receipt,
      change: 8.2,
      trend: 'up',
      color: "rose",
      subtext: `${formatCurrency(summary.totalExpenses)} total`
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
        {!loading && monthlyTrends.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                    Employee Growth Trend
                  </h3>
                  <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                    Details <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <DashboardChart
                  type="line"
                  data={employeeTrendData}
                  loading={loading}
                  height={300}
                />
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-600" />
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
              {departmentStats.length > 0 && (
                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-indigo-600" />
                      Expense Distribution
                    </h3>
                    <button className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                      Details <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <DashboardChart
                    type="doughnut"
                    data={expenseDistributionData}
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
                    <UserMinus className="h-4 w-4 text-rose-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Resignations</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatNumber(summary.resignationsThisMonth)}
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
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">Overtime (hrs)</span>
                  </div>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatNumber(summary.overtime)}
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