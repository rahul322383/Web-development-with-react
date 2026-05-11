// // pages/CareersPage.jsx — public job board (no auth required)

// import React, { useState, useEffect, useCallback, useRef } from 'react';
// import { toast } from 'sonner';
// import { recruitmentApi } from '../api/recruitment.api';
// import {
//   PageLoader, Empty, Pagination, fmtSalary, fmtDate,
//   Modal, Input, Textarea, Btn, Spinner,
// } from './recruitment.ui';

// // ─────────────────────────────────────────────────────────────────────────────
// // Apply Form (inside a modal)
// // ─────────────────────────────────────────────────────────────────────────────

// const EMPTY_FORM = {
//   firstName: '', lastName: '', email: '', phone: '',
//   linkedinUrl: '', portfolioUrl: '', experienceYears: '',
//   currentCompany: '', currentCtc: '', expectedCtc: '',
//   noticePeriod: '', skills: '', city: '', coverLetter: '', source: 'portal',
// };

// const ApplyModal = ({ job, onClose }) => {
//   const [form,     setForm]     = useState(EMPTY_FORM);
//   const [resume,   setResume]   = useState(null);
//   const [saving,   setSaving]   = useState(false);
//   const [errors,   setErrors]   = useState({});
//   const [done,     setDone]     = useState(false);
//   const fileRef = useRef();

//   const set = (k) => (e) => {
//     setForm(p => ({ ...p, [k]: e.target.value }));
//     setErrors(p => ({ ...p, [k]: undefined }));
//   };

//   const validate = () => {
//     const errs = {};
//     if (!form.firstName.trim()) errs.firstName = 'Required';
//     if (!form.lastName.trim())  errs.lastName  = 'Required';
//     if (!form.email.trim())     errs.email     = 'Required';
//     else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
//     return errs;
//   };

//   const submit = async () => {
//     const errs = validate();
//     if (Object.keys(errs).length) { setErrors(errs); return; }

//     setSaving(true);
//     try {
//       const fd = new FormData();
//       Object.entries(form).forEach(([k, v]) => {
//         if (v !== '') fd.append(k, v);
//       });
//       if (resume) fd.append('resume', resume);

//       await recruitmentApi.applyToJob(job.id, fd);
//       setDone(true);
//     } catch (err) {
//       const msg = err?.response?.data?.message ?? 'Application failed';
//       if (msg.includes('already applied')) {
//         toast.error('You have already applied for this job.');
//       } else {
//         toast.error(msg);
//       }
//     } finally {
//       setSaving(false);
//     }
//   };

//   if (done) {
//     return (
//       <Modal title="Application Submitted 🎉" onClose={onClose}>
//         <div className="text-center py-6">
//           <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
//           <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You're all set!</h3>
//           <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
//             Your application for <strong>{job.title}</strong> has been received. We'll be in touch soon.
//           </p>
//           <Btn onClick={onClose}>Close</Btn>
//         </div>
//       </Modal>
//     );
//   }

//   return (
//     <Modal title={`Apply — ${job.title}`} onClose={onClose} wide>
//       <div className="space-y-5">
//         <p className="text-sm text-gray-500 dark:text-gray-400">Fields marked <span className="text-red-500">*</span> are required.</p>

//         {/* Name */}
//         <div className="grid grid-cols-2 gap-4">
//           <Input label="First Name" required value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
//           <Input label="Last Name"  required value={form.lastName}  onChange={set('lastName')}  error={errors.lastName}  />
//         </div>

//         {/* Contact */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <Input label="Email" required type="email" value={form.email} onChange={set('email')} error={errors.email} />
//           <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
//         </div>

//         {/* Experience */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <Input label="Current Company" value={form.currentCompany} onChange={set('currentCompany')} />
//           <Input label="Years of Experience" type="number" min={0} value={form.experienceYears} onChange={set('experienceYears')} />
//         </div>

//         {/* CTC */}
//         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//           <Input label="Current CTC (₹)" type="number" min={0} value={form.currentCtc}  onChange={set('currentCtc')}  />
//           <Input label="Expected CTC (₹)" type="number" min={0} value={form.expectedCtc} onChange={set('expectedCtc')} />
//           <Input label="Notice Period" value={form.noticePeriod} onChange={set('noticePeriod')} placeholder="e.g. 30 days" />
//         </div>

//         {/* Misc */}
//         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//           <Input label="City" value={form.city} onChange={set('city')} />
//           <Input label="LinkedIn URL" type="url" value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/..." />
//         </div>
//         <Input label="Portfolio / Website" type="url" value={form.portfolioUrl} onChange={set('portfolioUrl')} placeholder="https://..." />
//         <Input label="Skills (comma-separated)" value={form.skills} onChange={set('skills')} placeholder="React, Node.js, SQL" />

//         {/* Cover letter */}
//         <Textarea label="Cover Letter" rows={4} value={form.coverLetter} onChange={set('coverLetter')} placeholder="Tell us why you're the perfect fit..." />

//         {/* Resume upload */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resume (PDF / DOC, max 5 MB)</label>
//           <div
//             className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors"
//             onClick={() => fileRef.current?.click()}
//           >
//             {resume ? (
//               <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
//                 <span>📄</span>
//                 <span className="font-medium">{resume.name}</span>
//                 <button
//                   className="ml-2 text-red-400 hover:text-red-600"
//                   onClick={e => { e.stopPropagation(); setResume(null); }}
//                 >✕</button>
//               </div>
//             ) : (
//               <div className="text-gray-400 text-sm">
//                 <div className="text-2xl mb-1">📎</div>
//                 <p>Click to upload resume</p>
//               </div>
//             )}
//           </div>
//           <input
//             ref={fileRef}
//             type="file"
//             accept=".pdf,.doc,.docx"
//             className="hidden"
//             onChange={e => setResume(e.target.files[0] ?? null)}
//           />
//         </div>

//         <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
//           <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
//           <Btn loading={saving} onClick={submit}>Submit Application</Btn>
//         </div>
//       </div>
//     </Modal>
//   );
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // Job Detail (expanded view)
// // ─────────────────────────────────────────────────────────────────────────────

// const JobDetail = ({ job, onClose, onApply }) => (
//   <Modal title={job.title} onClose={onClose} wide>
//     <div className="space-y-5">
//       {/* Meta tags */}
//       <div className="flex flex-wrap gap-2">
//         {job.department && <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">{job.department}</span>}
//         {job.location   && <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">📍 {job.location}</span>}
//         {job.isRemote   && <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs text-blue-600">🌐 Remote</span>}
//         <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">{job.employmentType}</span>
//         <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">{job.experienceLevel}</span>
//       </div>

//       {/* Salary */}
//       {(job.salaryMin || job.salaryMax) && (
//         <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-3 text-sm">
//           <span className="text-emerald-600 font-semibold">
//             {job.salaryMin && job.salaryMax
//               ? `${fmtSalary(job.salaryMin, job.currency)} – ${fmtSalary(job.salaryMax, job.currency)}`
//               : `From ${fmtSalary(job.salaryMin || job.salaryMax, job.currency)}`}
//           </span>
//           <span className="text-gray-400 text-xs ml-2">per year</span>
//         </div>
//       )}

//       {job.description     && <div><h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">About the Role</h4><p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{job.description}</p></div>}
//       {job.responsibilities && <div><h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Responsibilities</h4><p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{job.responsibilities}</p></div>}
//       {job.requirements    && <div><h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Requirements</h4><p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{job.requirements}</p></div>}

//       {/* Skills */}
//       {job.skills?.length > 0 && (
//         <div>
//           <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Skills</h4>
//           <div className="flex flex-wrap gap-2">
//             {job.skills.map(s => (
//               <span key={s} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-medium">{s}</span>
//             ))}
//           </div>
//         </div>
//       )}

//       {job.expiresAt && (
//         <p className="text-xs text-amber-500">⚠ Application deadline: {fmtDate(job.expiresAt)}</p>
//       )}

//       <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
//         <Btn onClick={onApply}>Apply Now →</Btn>
//       </div>
//     </div>
//   </Modal>
// );

// // ─────────────────────────────────────────────────────────────────────────────
// // Careers Page
// // ─────────────────────────────────────────────────────────────────────────────

// export const CareersPage = () => {
//   const [jobs,       setJobs]       = useState([]);
//   const [pagination, setPagination] = useState(null);
//   const [loading,    setLoading]    = useState(true);
//   const [page,       setPage]       = useState(1);
//   const [search,     setSearch]     = useState('');
//   const [detail,     setDetail]     = useState(null);  // job to show in detail modal
//   const [applyJob,   setApplyJob]   = useState(null);  // job to apply to

//   const load = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await recruitmentApi.listPublishedJobs({ page, search: search || undefined });
//       if (res.success) {
//         setJobs(res.data);
//         setPagination(res.pagination);
//       }
//     } catch {
//       toast.error('Failed to load jobs');
//     } finally {
//       setLoading(false);
//     }
//   }, [page, search]);

//   useEffect(() => { load(); }, [load]);
//   useEffect(() => { setPage(1); }, [search]);

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
//       {/* Hero */}
//       <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white py-16 px-4 text-center">
//         <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">We're Hiring</h1>
//         <p className="text-white/70 text-lg mb-8">Find your next opportunity. Grow with us.</p>
//         <div className="max-w-xl mx-auto">
//           <input
//             className="w-full px-5 py-3.5 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
//             placeholder="Search jobs by title or department..."
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//           />
//         </div>
//       </div>

//       {/* Job listing */}
//       <div className="max-w-4xl mx-auto px-4 py-10">
//         {loading ? (
//           <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
//         ) : jobs.length === 0 ? (
//           <Empty icon="🔍" title="No openings found" description="Check back soon or try a different search term." />
//         ) : (
//           <div className="space-y-4">
//             <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{pagination?.total ?? 0} open position{pagination?.total !== 1 ? 's' : ''}</p>

//             {jobs.map(job => (
//               <div
//                 key={job.id}
//                 className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer"
//                 onClick={() => setDetail(job)}
//               >
//                 <div className="flex items-start justify-between gap-4">
//                   <div className="flex-1 min-w-0">
//                     <h2 className="font-bold text-gray-900 dark:text-white text-lg leading-snug">{job.title}</h2>
//                     <div className="flex flex-wrap gap-2 mt-2">
//                       {job.department  && <span className="text-xs text-gray-500 dark:text-gray-400">{job.department}</span>}
//                       {job.location    && <span className="text-xs text-gray-400">· 📍 {job.location}</span>}
//                       {job.isRemote    && <span className="text-xs text-blue-500">· 🌐 Remote</span>}
//                       <span className="text-xs text-gray-400">· {job.employmentType}</span>
//                       <span className="text-xs text-gray-400">· {job.experienceLevel}</span>
//                     </div>

//                     {/* Skills preview */}
//                     {job.skills?.length > 0 && (
//                       <div className="flex flex-wrap gap-1.5 mt-3">
//                         {job.skills.slice(0, 5).map(s => (
//                           <span key={s} className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs">{s}</span>
//                         ))}
//                         {job.skills.length > 5 && (
//                           <span className="text-xs text-gray-400 self-center">+{job.skills.length - 5} more</span>
//                         )}
//                       </div>
//                     )}
//                   </div>

//                   <div className="text-right shrink-0">
//                     {(job.salaryMin || job.salaryMax) && (
//                       <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
//                         {job.salaryMin && job.salaryMax
//                           ? `${fmtSalary(job.salaryMin, job.currency)} – ${fmtSalary(job.salaryMax, job.currency)}`
//                           : `From ${fmtSalary(job.salaryMin || job.salaryMax, job.currency)}`}
//                       </p>
//                     )}
//                     <p className="text-xs text-gray-400 mt-1">{job.openings} opening{job.openings !== 1 ? 's' : ''}</p>
//                     {job.expiresAt && (
//                       <p className="text-xs text-amber-500 mt-1">Closes {fmtDate(job.expiresAt)}</p>
//                     )}
//                   </div>
//                 </div>

//                 <div className="flex justify-end mt-4">
//                   <Btn
//                     size="sm"
//                     onClick={e => { e.stopPropagation(); setApplyJob(job); }}
//                   >
//                     Apply Now
//                   </Btn>
//                 </div>
//               </div>
//             ))}

//             <Pagination pagination={pagination} onChange={setPage} />
//           </div>
//         )}
//       </div>

//       {/* Detail modal */}
//       {detail && (
//         <JobDetail
//           job={detail}
//           onClose={() => setDetail(null)}
//           onApply={() => { setApplyJob(detail); setDetail(null); }}
//         />
//       )}

//       {/* Apply modal */}
//       {applyJob && (
//         <ApplyModal
//           job={applyJob}
//           onClose={() => setApplyJob(null)}
//         />
//       )}
//     </div>
//   );
// };

// pages/CareersPage.jsx — public job board (no auth required)

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { recruitmentApi } from '../api/recruitment.api';
import {
  PageLoader, Empty, Pagination, fmtSalary, fmtDate,
  Modal, Input, Textarea, Btn, Spinner,
} from './recruitment.ui';

// ─────────────────────────────────────────────────────────────────────────────
// Apply Form (inside a modal)
// ─────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = {
  firstName: '', lastName: '', email: '', phone: '',
  linkedinUrl: '', portfolioUrl: '', experienceYears: '',
  currentCompany: '', currentCtc: '', expectedCtc: '',
  noticePeriod: '', skills: '', city: '', coverLetter: '', source: 'portal',
};

const ApplyModal = ({ job, onClose }) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [resume, setResume] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const fileRef = useRef();

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.firstName.trim()) errs.firstName = 'Required';
    if (!form.lastName.trim()) errs.lastName = 'Required';
    if (!form.email.trim()) errs.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    return errs;
  };

  const submit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const fd = new FormData();

      // ── FIX 1 & 2: properly format skills array & numeric fields ──
      const numericFields = [
        'experienceYears',
        'currentCtc',
        'expectedCtc',
      ];

      Object.entries(form).forEach(([k, v]) => {
        if (v === '') return; // skip empty strings

        // 1) transform skills string → JSON array
        if (k === 'skills') {
          const skillsArray = v
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
          fd.append('skills', JSON.stringify(skillsArray));
          return;
        }

        // 2) convert known numeric fields to Number
        if (numericFields.includes(k)) {
          fd.append(k, Number(v));
          return;
        }

        fd.append(k, v);
      });

      // attach resume file
      if (resume) fd.append('resume', resume);

      await recruitmentApi.applyToJob(job.id, fd);
      setDone(true);
    } catch (err) {
      const msg = err?.response?.data?.message ?? 'Application failed';
      if (msg.includes('already applied')) {
        toast.error('You have already applied for this job.');
      } else {
        toast.error(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  if (done) {
    return (
      <Modal title="Application Submitted 🎉" onClose={onClose}>
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-3xl mx-auto mb-4">✅</div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">You're all set!</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
            Your application for <strong>{job.title}</strong> has been received. We'll be in touch soon.
          </p>
          <Btn onClick={onClose}>Close</Btn>
        </div>
      </Modal>
    );
  }

  return (
    <Modal title={`Apply — ${job.title}`} onClose={onClose} wide>
      <div className="space-y-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">Fields marked <span className="text-red-500">*</span> are required.</p>

        {/* Name */}
        <div className="grid grid-cols-2 gap-4">
          <Input label="First Name" required value={form.firstName} onChange={set('firstName')} error={errors.firstName} />
          <Input label="Last Name" required value={form.lastName} onChange={set('lastName')} error={errors.lastName} />
        </div>

        {/* Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Email" required type="email" value={form.email} onChange={set('email')} error={errors.email} />
          <Input label="Phone" type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
        </div>

        {/* Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Current Company" value={form.currentCompany} onChange={set('currentCompany')} />
          <Input label="Years of Experience" type="number" min={0} value={form.experienceYears} onChange={set('experienceYears')} />
        </div>

        {/* CTC */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Current CTC (₹)" type="number" min={0} value={form.currentCtc} onChange={set('currentCtc')} />
          <Input label="Expected CTC (₹)" type="number" min={0} value={form.expectedCtc} onChange={set('expectedCtc')} />
          <Input label="Notice Period" value={form.noticePeriod} onChange={set('noticePeriod')} placeholder="e.g. 30 days" />
        </div>

        {/* Misc */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="City" value={form.city} onChange={set('city')} />
          <Input label="LinkedIn URL" type="url" value={form.linkedinUrl} onChange={set('linkedinUrl')} placeholder="https://linkedin.com/in/..." />
        </div>
        <Input label="Portfolio / Website" type="url" value={form.portfolioUrl} onChange={set('portfolioUrl')} placeholder="https://..." />
        <Input label="Skills (comma-separated)" value={form.skills} onChange={set('skills')} placeholder="React, Node.js, SQL" />

        {/* Cover letter */}
        <Textarea label="Cover Letter" rows={4} value={form.coverLetter} onChange={set('coverLetter')} placeholder="Tell us why you're the perfect fit..." />

        {/* Resume upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resume (PDF / DOC, max 5 MB)</label>
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 transition-colors"
            onClick={() => fileRef.current?.click()}
          >
            {resume ? (
              <div className="flex items-center justify-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                <span>📄</span>
                <span className="font-medium">{resume.name}</span>
                <button
                  className="ml-2 text-red-400 hover:text-red-600"
                  onClick={e => { e.stopPropagation(); setResume(null); }}
                >✕</button>
              </div>
            ) : (
              <div className="text-gray-400 text-sm">
                <div className="text-2xl mb-1">📎</div>
                <p>Click to upload resume</p>
              </div>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={e => setResume(e.target.files[0] ?? null)}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn loading={saving} onClick={submit}>Submit Application</Btn>
        </div>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Job Detail (expanded view) — FIX 3 applied
// ─────────────────────────────────────────────────────────────────────────────

const JobDetail = ({ job, onClose, onApply }) => {
  // Helper to render text that might be a JSON array or plain string
  const renderListOrText = (label, data) => {
    if (!data) return null;
    // If the data is an array (already parsed from JSON), render as <ul>
    if (Array.isArray(data)) {
      return (
        <div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{label}</h4>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            {data.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }
    // Fallback to original string rendering
    return (
      <div>
        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">{label}</h4>
        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{data}</p>
      </div>
    );
  };

  return (
    <Modal title={job.title} onClose={onClose} wide>
      <div className="space-y-5">
        {/* Meta tags */}
        <div className="flex flex-wrap gap-2">
          {job.department && <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">{job.department}</span>}
          {job.location && <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">📍 {job.location}</span>}
          {job.isRemote && <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full text-xs text-blue-600">🌐 Remote</span>}
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">{job.employmentType}</span>
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs text-gray-600 dark:text-gray-300">{job.experienceLevel}</span>
        </div>

        {/* Salary */}
        {(job.salaryMin || job.salaryMax) && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-xl p-3 text-sm">
            <span className="text-emerald-600 font-semibold">
              {job.salaryMin && job.salaryMax
                ? `${fmtSalary(job.salaryMin, job.currency)} – ${fmtSalary(job.salaryMax, job.currency)}`
                : `From ${fmtSalary(job.salaryMin || job.salaryMax, job.currency)}`}
            </span>
            <span className="text-gray-400 text-xs ml-2">per year</span>
          </div>
        )}

        {/* Description */}
        {job.description && (
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">About the Role</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{job.description}</p>
          </div>
        )}

        {/* Responsibilities – now handles arrays */}
        {renderListOrText('Responsibilities', job.responsibilities)}

        {/* Requirements – now handles arrays */}
        {renderListOrText('Requirements', job.requirements)}

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div>
            <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Skills</h4>
            <div className="flex flex-wrap gap-2">
              {job.skills.map(s => (
                <span key={s} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {job.expiresAt && (
          <p className="text-xs text-amber-500">⚠ Application deadline: {fmtDate(job.expiresAt)}</p>
        )}

        <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
          <Btn onClick={onApply}>Apply Now →</Btn>
        </div>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Careers Page
// ─────────────────────────────────────────────────────────────────────────────

export const CareersPage = () => {
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState(null);  // job to show in detail modal
  const [applyJob, setApplyJob] = useState(null);  // job to apply to

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await recruitmentApi.listPublishedJobs({ page, search: search || undefined });
      if (res.success) {
        setJobs(res.data);
        setPagination(res.pagination);
      }
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [search]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-700 via-purple-700 to-pink-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">We're Hiring</h1>
        <p className="text-white/70 text-lg mb-8">Find your next opportunity. Grow with us.</p>
        <div className="max-w-xl mx-auto">
          <input
            className="w-full px-5 py-3.5 rounded-2xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
            placeholder="Search jobs by title or department..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Job listing */}
      <div className="max-w-4xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-20"><Spinner className="w-10 h-10" /></div>
        ) : jobs.length === 0 ? (
          <Empty icon="🔍" title="No openings found" description="Check back soon or try a different search term." />
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{pagination?.total ?? 0} open position{pagination?.total !== 1 ? 's' : ''}</p>

            {jobs.map(job => (
              <div
                key={job.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all cursor-pointer"
                onClick={() => setDetail(job)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900 dark:text-white text-lg leading-snug">{job.title}</h2>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {job.department && <span className="text-xs text-gray-500 dark:text-gray-400">{job.department}</span>}
                      {job.location && <span className="text-xs text-gray-400">· 📍 {job.location}</span>}
                      {job.isRemote && <span className="text-xs text-blue-500">· 🌐 Remote</span>}
                      <span className="text-xs text-gray-400">· {job.employmentType}</span>
                      <span className="text-xs text-gray-400">· {job.experienceLevel}</span>
                    </div>

                    {/* Skills preview */}
                    {job.skills?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {job.skills.slice(0, 5).map(s => (
                          <span key={s} className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-xs">{s}</span>
                        ))}
                        {job.skills.length > 5 && (
                          <span className="text-xs text-gray-400 self-center">+{job.skills.length - 5} more</span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0">
                    {(job.salaryMin || job.salaryMax) && (
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        {job.salaryMin && job.salaryMax
                          ? `${fmtSalary(job.salaryMin, job.currency)} – ${fmtSalary(job.salaryMax, job.currency)}`
                          : `From ${fmtSalary(job.salaryMin || job.salaryMax, job.currency)}`}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{job.openings} opening{job.openings !== 1 ? 's' : ''}</p>
                    {job.expiresAt && (
                      <p className="text-xs text-amber-500 mt-1">Closes {fmtDate(job.expiresAt)}</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Btn
                    size="sm"
                    onClick={e => { e.stopPropagation(); setApplyJob(job); }}
                  >
                    Apply Now
                  </Btn>
                </div>
              </div>
            ))}

            <Pagination pagination={pagination} onChange={setPage} />
          </div>
        )}
      </div>

      {/* Detail modal */}
      {detail && (
        <JobDetail
          job={detail}
          onClose={() => setDetail(null)}
          onApply={() => { setApplyJob(detail); setDetail(null); }}
        />
      )}

      {/* Apply modal */}
      {applyJob && (
        <ApplyModal
          job={applyJob}
          onClose={() => setApplyJob(null)}
        />
      )}
    </div>
  );
};