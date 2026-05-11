// pages/JobsPage.jsx — HR/Admin job listing & management

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { recruitmentApi } from '../api/recruitment.api';
import {
  JobStatusBadge, PageLoader, Empty, SectionHeader, Btn,
  Pagination, fmtSalary, fmtDate, StatCard, Confirm,
} from './recruitment.ui';
import { JobFormModal } from './JobFormModal';

const FILTERS = ['', 'Draft', 'Published', 'Paused', 'Closed', 'Expired'];

export const JobsPage = ({ onViewApplications }) => {
  const [jobs,       setJobs]       = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [stats,      setStats]      = useState(null);

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [editJob,    setEditJob]    = useState(null);
  const [deleteId,   setDeleteId]   = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [jobsRes, statsRes] = await Promise.allSettled([
        recruitmentApi.listJobs({ page, search, status: statusFilter || undefined }),
        recruitmentApi.getStats(),
      ]);

      if (jobsRes.status === 'fulfilled' && jobsRes.value.success) {
        setJobs(jobsRes.value.data);
        setPagination(jobsRes.value.pagination);
      }
      if (statsRes.status === 'fulfilled' && statsRes.value.success) {
        setStats(statsRes.value.data);
      }
    } catch (err) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const handleDelete = async () => {
    try {
      await recruitmentApi.deleteJob(deleteId);
      toast.success('Job deleted');
      setDeleteId(null);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Delete failed');
    }
  };

  return (
    <div className="space-y-6">

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="💼" label="Open Jobs"         value={stats.openJobs}          color="indigo" />
          <StatCard icon="📋" label="Total Applications" value={stats.totalApplications} color="violet" />
          <StatCard icon="🗓️" label="Interviews Today"  value={stats.interviewsToday}   color="amber" />
          <StatCard icon="🤝" label="Offers Accepted"   value={stats.offersAccepted}     color="emerald" />
        </div>
      )}

      {/* Header + filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
        <SectionHeader
          title="Job Postings"
          subtitle="Manage all active and draft job listings"
          action={<Btn onClick={() => setShowCreate(true)}>+ Post Job</Btn>}
        />

        {/* Search + status filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Search by title, department, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            value={statusFilter}
            onChange={e => setStatus(e.target.value)}
          >
            {FILTERS.map(f => <option key={f} value={f}>{f || 'All Statuses'}</option>)}
          </select>
        </div>
      </div>

      {/* Job list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : jobs.length === 0 ? (
          <Empty icon="💼" title="No jobs found" description="Create your first job posting to start hiring." action={<Btn onClick={() => setShowCreate(true)}>Post a Job</Btn>} />
        ) : (
          <>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>Job</span>
              <span>Type</span>
              <span>Salary</span>
              <span>Openings</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {jobs.map(job => (
              <div
                key={job.id}
                className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors items-center"
              >
                {/* Title + meta */}
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm">{job.title}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {job.department && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">{job.department}</span>
                    )}
                    {job.location && (
                      <span className="text-xs text-gray-400">· {job.location}</span>
                    )}
                    {job.isRemote && (
                      <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded-md">Remote</span>
                    )}
                  </div>
                  {job.expiresAt && (
                    <p className="text-xs text-amber-500 mt-0.5">Expires {fmtDate(job.expiresAt)}</p>
                  )}
                </div>

                <span className="text-sm text-gray-600 dark:text-gray-300">{job.employmentType}</span>

                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {job.salaryMin && job.salaryMax
                    ? `${fmtSalary(job.salaryMin)} – ${fmtSalary(job.salaryMax)}`
                    : job.salaryMin ? `From ${fmtSalary(job.salaryMin)}`
                    : '—'}
                </span>

                <span className="text-sm text-gray-600 dark:text-gray-300">{job.openings}</span>

                <JobStatusBadge status={job.status} />

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Btn size="sm" variant="ghost" onClick={() => onViewApplications(job.id, job.title)}>
                    Applications
                  </Btn>
                  <Btn size="sm" variant="ghost" onClick={() => setEditJob(job)}>Edit</Btn>
                  <Btn size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => setDeleteId(job.id)}>
                    Delete
                  </Btn>
                </div>
              </div>
            ))}

            <div className="px-6 pb-4">
              <Pagination pagination={pagination} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      {showCreate && <JobFormModal onClose={() => setShowCreate(false)} onSaved={load} />}
      {editJob    && <JobFormModal job={editJob} onClose={() => setEditJob(null)} onSaved={load} />}
      {deleteId   && (
        <Confirm
          message="Are you sure you want to delete this job? This cannot be undone."
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
};
