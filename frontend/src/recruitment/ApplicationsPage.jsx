// pages/ApplicationsPage.jsx — HR/Manager applicant pipeline view

import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { recruitmentApi } from '../api/recruitment.api';
import {
  AppStatusBadge, PageLoader, Empty, SectionHeader, Btn,
  Pagination, fmtDate, Confirm,
} from './recruitment.ui';
import {
  ScheduleInterviewModal, FeedbackModal,
  MakeOfferModal, UpdateStatusModal,
} from './RecruitmentModals';

const STATUSES = [
  '', 'Applied', 'Screening', 'Shortlisted', 'Interview Scheduled',
  'Interviewed', 'Selected', 'Rejected', 'Offer Sent', 'Offer Accepted', 'Joined',
];

export const ApplicationsPage = ({ jobId, jobTitle, onBack }) => {
  const [apps,       setApps]       = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [selected,   setSelected]   = useState(null);

  // Active modal
  const [modal, setModal] = useState(null); // 'status' | 'interview' | 'feedback' | 'offer'

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recruitmentApi.listApplications({
        page,
        search,
        status: statusFilter || undefined,
        jobId:  jobId || undefined,
      });
      if (res.success) {
        setApps(res.data);
        setPagination(res.pagination);
      }
    } catch {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, jobId]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const openModal = (app, type) => { setSelected(app); setModal(type); };
  const closeModal = () => { setModal(null); setSelected(null); };
  const afterSave  = () => { closeModal(); load(); };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
        <SectionHeader
          title={jobTitle ? `Applications — ${jobTitle}` : 'All Applications'}
          subtitle={`${pagination?.total ?? 0} total applicants`}
          action={onBack && <Btn variant="secondary" onClick={onBack}>← Back to Jobs</Btn>}
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            placeholder="Search candidate name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
            value={statusFilter}
            onChange={e => setStatus(e.target.value)}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
        </div>
      </div>

      {/* Applications list */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : apps.length === 0 ? (
          <Empty icon="📋" title="No applications yet" description="Applications submitted via the careers portal will appear here." />
        ) : (
          <>
            {/* Table header */}
            <div className="hidden lg:grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              <span>Candidate</span>
              <span>Job</span>
              <span>Applied</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {apps.map(app => {
              const c = app.candidate ?? {};
              return (
                <div
                  key={app.id}
                  className="grid grid-cols-1 lg:grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-6 py-4 border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-700/20 transition-colors items-center"
                >
                  {/* Candidate */}
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 font-bold text-sm shrink-0">
                      {(c.firstName?.[0] ?? '?')}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                        {c.firstName} {c.lastName}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{c.email}</p>
                      {c.resumeUrl && (
                        <a
                          href={c.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-indigo-500 hover:underline"
                        >
                          View Resume ↗
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Job */}
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    {app.job?.title ?? '—'}
                    {app.job?.department && (
                      <span className="text-xs text-gray-400 ml-1">· {app.job.department}</span>
                    )}
                  </div>

                  <span className="text-sm text-gray-500">{fmtDate(app.appliedAt)}</span>

                  <AppStatusBadge status={app.status} />

                  {/* Action menu */}
                  <div className="flex flex-wrap gap-1">
                    <Btn size="sm" variant="ghost" onClick={() => openModal(app, 'status')}>
                      Move Stage
                    </Btn>
                    {['Shortlisted','Interview Scheduled','Interviewed'].includes(app.status) && (
                      <Btn size="sm" variant="ghost" onClick={() => openModal(app, 'interview')}>
                        Schedule Interview
                      </Btn>
                    )}
                    {app.status === 'Interviewed' && (
                      <Btn size="sm" variant="ghost" onClick={() => openModal(app, 'feedback')}>
                        Feedback
                      </Btn>
                    )}
                    {app.status === 'Selected' && (
                      <Btn size="sm" variant="success" onClick={() => openModal(app, 'offer')}>
                        Make Offer
                      </Btn>
                    )}
                  </div>
                </div>
              );
            })}

            <div className="px-6 pb-4">
              <Pagination pagination={pagination} onChange={setPage} />
            </div>
          </>
        )}
      </div>

      {/* ── Modals ─────────────────────────────────────────────────────── */}
      {modal === 'status' && selected && (
        <UpdateStatusModal
          applicationId={selected.id}
          currentStatus={selected.status}
          onClose={closeModal}
          onSaved={afterSave}
        />
      )}
      {modal === 'interview' && selected && (
        <ScheduleInterviewModal
          applicationId={selected.id}
          onClose={closeModal}
          onSaved={afterSave}
        />
      )}
      {modal === 'feedback' && selected && (
        <FeedbackModal
          interviewId={
            // Use the most recent pending interview for this application
            selected.interviews?.find(i => i.result === 'Pending')?.id ?? null
          }
          onClose={closeModal}
          onSaved={afterSave}
        />
      )}
      {modal === 'offer' && selected && (
        <MakeOfferModal
          applicationId={selected.id}
          candidateName={`${selected.candidate?.firstName ?? ''} ${selected.candidate?.lastName ?? ''}`}
          jobTitle={selected.job?.title ?? ''}
          onClose={closeModal}
          onSaved={afterSave}
        />
      )}
    </div>
  );
};
