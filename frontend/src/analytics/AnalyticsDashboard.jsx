// src/pages/AnalyticsDashboard.jsx
import React, { useState } from 'react';
import { useDashboard } from './useAnalytics';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { Link } from 'react-router-dom';

// ─── colour palette ──────────────────────────────────────────
const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  muted: '#6B7280',
  bg: '#F9FAFB',
  border: '#E5E7EB',
};

const DEPT_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

// ─── tiny helpers ────────────────────────────────────────────
const fmt = (n, dec = 1) => Number(n ?? 0).toFixed(dec);
const fmtLakh = (n) => `₹${(Number(n ?? 0) / 100_000).toFixed(1)}L`;

// ─── KPI card ────────────────────────────────────────────────
const KPICard = ({ label, value, sub, color = COLORS.primary }) => (
  <div style={{
    background: '#fff', border: `1px solid ${COLORS.border}`,
    borderRadius: 12, padding: '20px 24px', minWidth: 0,
  }}>
    <p style={{
      fontSize: 12, color: COLORS.muted, textTransform: 'uppercase',
      letterSpacing: '0.06em', marginBottom: 8
    }}>{label}</p>
    <p style={{ fontSize: 28, fontWeight: 600, color, lineHeight: 1 }}>{value}</p>
    {sub && <p style={{ fontSize: 12, color: COLORS.muted, marginTop: 6 }}>{sub}</p>}
  </div>
);

// ─── section wrapper ─────────────────────────────────────────
const Card = ({ title, children, style = {} }) => (
  <div style={{
    background: '#fff', border: `1px solid ${COLORS.border}`,
    borderRadius: 12, padding: 20, ...style,
  }}>
    <p style={{
      fontSize: 13, fontWeight: 600, color: COLORS.muted,
      textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16
    }}>{title}</p>
    {children}
  </div>
);

// ─── filter bar ──────────────────────────────────────────────
const FilterBar = ({ filters, onChange }) => (
  <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
    <input
      type="date"
      value={filters.startDate}
      onChange={e => onChange({ ...filters, startDate: e.target.value })}
      style={inputStyle}
    />
    <input
      type="date"
      value={filters.endDate}
      onChange={e => onChange({ ...filters, endDate: e.target.value })}
      style={inputStyle}
    />
    <input
      placeholder="Department (optional)"
      value={filters.department}
      onChange={e => onChange({ ...filters, department: e.target.value })}
      style={{ ...inputStyle, minWidth: 200 }}
    />
    <button
      onClick={() => onChange({ startDate: '', endDate: '', department: '' })}
      style={{ ...inputStyle, background: COLORS.bg, cursor: 'pointer', color: COLORS.muted }}
    >
      Reset
    </button>
  </div>
);

const inputStyle = {
  padding: '8px 12px', border: `1px solid ${COLORS.border}`,
  borderRadius: 8, fontSize: 13, outline: 'none',
};

// ─── skeleton loader ─────────────────────────────────────────
const Skeleton = ({ h = 200 }) => (
  <div style={{
    height: h, borderRadius: 8, background: '#F3F4F6',
    animation: 'pulse 1.5s ease-in-out infinite'
  }} />
);

// ─────────────────────────────────────────────────────────────
//  MAIN PAGE
// ─────────────────────────────────────────────────────────────

const defaultEnd = new Date().toISOString().split('T')[0];
const defaultStart = new Date(new Date().setFullYear(new Date().getFullYear() - 1))
  .toISOString().split('T')[0];

export default function AnalyticsDashboard() {
  const [filters, setFilters] = useState({
    startDate: defaultStart,
    endDate: defaultEnd,
    department: '',
  });

  const apiParams = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '')
  );

  const { data, isLoading, isError, errors } = useDashboard(apiParams);

  // ✅ safety utils
  const safeArray = (val) => (Array.isArray(val) ? val : []);
  const safeNumber = (val) => Number(val ?? 0);

  // ✅ Normalize every piece from the merged data
  const normalized = {
    attritionOverall: data?.attrition?.overall ?? {},
    attritionByDept: safeArray(data?.attrition?.byDepartment),
    deptPerformance: safeArray(data?.departmentPerformance),   // now an array
    leaveMonthly: safeArray(data?.leaveTrends?.monthly),
    leaveStatusBreakdown: safeArray(data?.leaveTrends?.statusBreakdown),
    costOverall: data?.cost?.overall ?? {},
    costByDept: safeArray(data?.cost?.byDepartment),
  };

  const {
    attritionOverall,
    attritionByDept,
    deptPerformance,
    leaveMonthly,
    leaveStatusBreakdown,
    costOverall,
    costByDept,
  } = normalized;

  const statusColors = {
    Approved: COLORS.success,
    Pending: COLORS.warning,
    Rejected: COLORS.danger,
  };

  // Derived KPIs
  const totalLeaveDays = leaveMonthly.reduce((s, r) => s + safeNumber(r?.totalDays), 0);
  const totalLeaveRequests = leaveMonthly.reduce((s, r) => s + safeNumber(r?.leaveCount), 0);
  const activeEmployees = attritionOverall.employeesAtEnd ?? deptPerformance.reduce((s, d) => s + safeNumber(d?.headCount), 0);
  const periodText = data?.period
    ? `${data.period.startDate} → ${data.period.endDate}`
    : '';

  return (
    <div style={{ padding: '24px 32px', background: COLORS.bg, minHeight: '100vh' }}>

      {/* HEADER */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111827' }}>
          Analytics Dashboard
        </h1>
        <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>
          {periodText || 'Loading period…'}
        </p>
      </div>

      <FilterBar filters={filters} onChange={setFilters} />

      {isError && (
        <div style={{ color: COLORS.danger, marginBottom: 16, fontSize: 14 }}>
          Failed to load analytics:
          {errors?.map((e, i) => <div key={i}>• {e.message}</div>)}
        </div>
      )}

      {/* KPI Cards */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 14, marginBottom: 24
      }}>
        {isLoading
          ? [0, 1, 2, 3].map(i => <Skeleton key={i} h={100} />)
          : (
            <>
              <KPICard
                label="Attrition Rate"
                value={`${fmt(attritionOverall.value)}%`}
                sub={`${attritionOverall.leftInPeriod ?? 0} left / ${attritionOverall.employeesAtStart ?? 0} at start`}
                color={Number(attritionOverall.value) > 15 ? COLORS.danger : COLORS.success}
              />
              <Link to="/users" style={{ textDecoration: 'none' }}>
                <KPICard
                  label="Active Employees"
                  value={activeEmployees ?? '—'}
                  sub="Currently active"
                  color={COLORS.primary}
                />
              </Link>
              <KPICard
                label="Avg Cost / Employee"
                value={fmtLakh(costOverall.avgSalary)}
                sub={`${costOverall.employeeCount ?? activeEmployees} employees`}
                color={COLORS.warning}
              />
              <Link to="/pending-leave" style={{ textDecoration: 'none' }}>
                <div style={{ cursor: 'pointer' }}>
                  <KPICard
                    label="Leave Days (period)"
                    value={totalLeaveDays}
                    sub={`${totalLeaveRequests} requests`}
                    color={COLORS.muted}
                  />
                </div>
              </Link>
            </>
          )}
      </div>

      {/* ROW 1 */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 14, marginBottom: 14
      }}>
        <Card title="Leave Trend — Monthly">
          {isLoading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={leaveMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="monthLabel" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="totalDays" stroke={COLORS.primary} name="Total Days" />
                <Line type="monotone" dataKey="leaveCount" stroke={COLORS.success} name="Leave Count" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Attrition by Department">
          {isLoading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attritionByDept} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis type="number" />
                <YAxis dataKey="department" type="category" />
                <Tooltip />
                <Bar dataKey="attritionRate" name="Attrition %">
                  {attritionByDept.map((entry, i) => (
                    <Cell
                      key={entry?.department || i}
                      fill={
                        entry?.attritionRate >= 18
                          ? COLORS.danger
                          : entry?.attritionRate >= 13
                            ? COLORS.warning
                            : COLORS.success
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ROW 2 */}
      <div style={{
        display: 'grid', gridTemplateColumns: '2fr 1fr',
        gap: 14, marginBottom: 14
      }}>
        <Card title="Department Performance">
          {isLoading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={deptPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="headCount" fill={COLORS.primary} name="Headcount" />
                <Bar dataKey="totalLeaveDays" fill={COLORS.warning} name="Leave Days" />
                <Bar dataKey="avgBaseSalary" fill={COLORS.success} name="Avg Salary" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Leave Status Breakdown">
          {isLoading ? <Skeleton h={240} /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {leaveStatusBreakdown.map((item, i) => {
                const total = leaveStatusBreakdown.reduce(
                  (s, r) => s + safeNumber(r?.count), 0
                ) || 1;
                const pct = ((safeNumber(item?.count) / total) * 100).toFixed(1);
                const color = statusColors[item?.status] ?? COLORS.muted;

                return (
                  <div key={item?.status || i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item?.status}</span>
                      <span style={{ color }}>{item?.count} ({pct}%)</span>
                    </div>
                    <div style={{ height: 8, background: COLORS.bg }}>
                      <div style={{
                        width: `${pct}%`, background: color,
                        height: '100%', transition: 'width 0.3s'
                      }} />
                    </div>
                  </div>
                );
              })}
              {leaveStatusBreakdown.length === 0 && (
                <p style={{ color: COLORS.muted }}>No leave data available.</p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* ROW 3 */}
      <Card title="Cost per Employee by Department">
        {isLoading ? <Skeleton h={220} /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={costByDept}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="department" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="avgSalary" name="Avg Salary">
                {costByDept.map((entry, i) => (
                  <Cell
                    key={entry?.department || i}
                    fill={DEPT_COLORS[i % DEPT_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  );
}