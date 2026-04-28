// src/pages/AnalyticsDashboard.jsx
import React, { useState } from 'react';
import { useDashboard } from './useAnalytics';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';

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

  // strip empty strings before sending to API
  const apiParams = Object.fromEntries(
    Object.entries(filters).filter(([, v]) => v !== '')
  );

  const { data, isLoading, isError, error } = useDashboard(apiParams);

  // ── destructure exact backend payload shapes ───────────────
  const attritionOverall = data?.attrition?.overall ?? {};
  const attritionByDept = data?.attrition?.byDepartment ?? [];
  const deptPerformance = data?.departmentPerformance ?? [];
  const leaveMonthly = data?.leaveTrends?.monthly ?? [];
  const leaveStatusBreakdown = data?.leaveTrends?.statusBreakdown ?? [];
  const costOverall = data?.costPerEmployee?.overall ?? {};
  const costByDept = data?.costPerEmployee?.byDepartment ?? [];

  // ── status breakdown → pie-friendly array ─────────────────
  // [{ status: 'Approved', count: 42 }, ...]
  const statusColors = { Approved: COLORS.success, Pending: COLORS.warning, Rejected: COLORS.danger };

  return (
    <div style={{ padding: '24px 32px', background: COLORS.bg, minHeight: '100vh' }}>

      {/* header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#111827' }}>
          Analytics Dashboard
        </h1>
        <p style={{ fontSize: 13, color: COLORS.muted, marginTop: 4 }}>
          {data?.period
            ? `${data.period.startDate} → ${data.period.endDate}`
            : 'Loading period…'}
        </p>
      </div>

      {/* filters */}
      <FilterBar filters={filters} onChange={setFilters} />

      {isError && (
        <div style={{ color: COLORS.danger, marginBottom: 16, fontSize: 14 }}>
          Failed to load analytics: {error?.message}
        </div>
      )}

      {/* ── KPI row ─────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {isLoading ? (
          [0, 1, 2, 3].map(i => <Skeleton key={i} h={100} />)
        ) : (
          <>
            <KPICard
              label="Attrition Rate"
              value={`${fmt(attritionOverall.attritionRate)}%`}
              sub={`${attritionOverall.leftInPeriod ?? 0} left / ${attritionOverall.totalAtPeriodStart ?? 0} total`}
              color={Number(attritionOverall.attritionRate) > 15 ? COLORS.danger : COLORS.success}
            />
            <KPICard
              label="Active Employees"
              value={attritionOverall.totalActive ?? '—'}
              sub="Currently active"
              color={COLORS.primary}
            />
            <KPICard
              label="Avg Cost / Employee"
              value={fmtLakh(costOverall.avgSalary)}
              sub={`${costOverall.employeeCount ?? 0} employees on payroll`}
              color={COLORS.warning}
            />
            <KPICard
              label="Leave Days (period)"
              value={leaveMonthly.reduce((s, r) => s + r.totalDays, 0)}
              sub={`${leaveMonthly.reduce((s, r) => s + r.leaveCount, 0)} requests approved`}
              color={COLORS.muted}
            />
          </>
        )}
      </div>

      {/* ── row 1: attrition trend + attrition by dept ──────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Leave trend line chart — monthLabel on X, totalDays on Y */}
        <Card title="Leave Trend — Monthly">
          {isLoading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={leaveMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="monthLabel" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v, n) => [v, n === 'totalDays' ? 'Total Days' : 'Requests']} />
                <Legend formatter={v => v === 'totalDays' ? 'Total Days' : 'Requests'} />
                <Line
                  type="monotone" dataKey="totalDays"
                  stroke={COLORS.primary} strokeWidth={2}
                  dot={{ r: 3 }} activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone" dataKey="leaveCount"
                  stroke={COLORS.success} strokeWidth={2}
                  dot={{ r: 3 }} strokeDasharray="4 3"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Attrition by department — horizontal bar */}
        <Card title="Attrition by Department">
          {isLoading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={attritionByDept} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis type="number" tick={{ fontSize: 11 }}
                  tickFormatter={v => `${v}%`} domain={[0, 'dataMax + 5']} />
                <YAxis dataKey="department" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(v) => [`${v}%`, 'Attrition Rate']} />
                <Bar dataKey="attritionRate" radius={[0, 4, 4, 0]} barSize={18}>
                  {attritionByDept.map((entry, i) => (
                    <Cell
                      key={entry.department}
                      fill={entry.attritionRate >= 18 ? COLORS.danger
                        : entry.attritionRate >= 13 ? COLORS.warning
                          : COLORS.success}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* ── row 2: dept performance + leave status breakdown ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Department performance — grouped bar: headCount + avgBaseSalary */}
        <Card title="Department Performance">
          {isLoading ? <Skeleton /> : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={deptPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }}
                  tickFormatter={v => fmtLakh(v)} />
                <Tooltip
                  formatter={(v, name) => {
                    if (name === 'avgBaseSalary') return [fmtLakh(v), 'Avg Base Salary'];
                    if (name === 'headCount') return [v, 'Head Count'];
                    if (name === 'totalLeaveDays') return [v, 'Leave Days'];
                    if (name === 'avgWorkedMinutes') return [`${(v / 60).toFixed(1)}h`, 'Avg Hours/Day'];
                    return [v, name];
                  }}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="headCount" fill={COLORS.primary} radius={[4, 4, 0, 0]} barSize={20} />
                <Bar yAxisId="left" dataKey="totalLeaveDays" fill={COLORS.warning} radius={[4, 4, 0, 0]} barSize={20} />
                <Bar yAxisId="right" dataKey="avgBaseSalary" fill={COLORS.success} radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Leave status breakdown */}
        <Card title="Leave Status Breakdown">
          {isLoading ? <Skeleton h={240} /> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingTop: 8 }}>
              {leaveStatusBreakdown.map((item) => {
                const total = leaveStatusBreakdown.reduce((s, r) => s + r.count, 0) || 1;
                const pct = ((item.count / total) * 100).toFixed(1);
                const color = statusColors[item.status] ?? COLORS.muted;
                return (
                  <div key={item.status}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      fontSize: 13, marginBottom: 6
                    }}>
                      <span style={{ color: '#374151', fontWeight: 500 }}>{item.status}</span>
                      <span style={{ color }}>{item.count} ({pct}%)</span>
                    </div>
                    <div style={{
                      height: 8, background: COLORS.bg,
                      borderRadius: 4, overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: color, borderRadius: 4,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ── row 3: cost by department ────────────────────────── */}
      <Card title="Cost per Employee by Department">
        {isLoading ? <Skeleton h={220} /> : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={costByDept}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={v => fmtLakh(v)} tick={{ fontSize: 11 }} />
              <Tooltip
                formatter={(v, name) => [
                  fmtLakh(v),
                  name === 'avgSalary' ? 'Avg Salary' : 'Total Salary',
                ]}
              />
              <Legend formatter={v => v === 'avgSalary' ? 'Avg Salary' : 'Total Salary'} />
              <Bar dataKey="avgSalary" radius={[4, 4, 0, 0]} barSize={28}>
                {costByDept.map((entry, i) => (
                  <Cell key={entry.department} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      
    </div>
  );
}
