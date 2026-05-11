// RecruitmentModule.jsx
// Drop this into your existing router:
//   <Route path="/recruitment/*" element={<RecruitmentModule />} />
//   <Route path="/careers"        element={<CareersPage />} />     ← public

import React, { useState } from 'react';
import { JobsPage }          from './JobsPage';
import { ApplicationsPage }  from './ApplicationsPage';
export { CareersPage }       from './CareersPage';

// ─────────────────────────────────────────────────────────────────────────────
// Tab navigation (uses simple state — integrates with your existing sidebar)
// ─────────────────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'jobs',         label: '💼 Job Postings' },
  { id: 'applications', label: '📋 All Applications' },
];

export const RecruitmentModule = () => {
  const [tab,           setTab]           = useState('jobs');
  const [selectedJob,   setSelectedJob]   = useState(null); // { id, title }

  const handleViewApplications = (jobId, jobTitle) => {
    setSelectedJob({ id: jobId, title: jobTitle });
    setTab('applications');
  };

  const handleBackToJobs = () => {
    setSelectedJob(null);
    setTab('jobs');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl mb-6 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); if (t.id !== 'applications') setSelectedJob(null); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Page content */}
      {tab === 'jobs' && (
        <JobsPage onViewApplications={handleViewApplications} />
      )}

      {tab === 'applications' && (
        <ApplicationsPage
          jobId={selectedJob?.id}
          jobTitle={selectedJob?.title}
          onBack={selectedJob ? handleBackToJobs : undefined}
        />
      )}
    </div>
  );
};

export default RecruitmentModule;
