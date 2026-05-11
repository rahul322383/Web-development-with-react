// RecruitmentModals.jsx — interview scheduling, feedback, and offer modals

import React, { useState } from 'react';
import { toast } from 'sonner';
import { recruitmentApi } from '../api/recruitment.api';
import { Modal, Input, Textarea, Select, Btn, fmtSalary } from './recruitment.ui';

// ─────────────────────────────────────────────────────────────────────────────
// SCHEDULE INTERVIEW
// ─────────────────────────────────────────────────────────────────────────────

export const ScheduleInterviewModal = ({ applicationId, onClose, onSaved }) => {
  const [form, setForm] = useState({
    interviewerId: '', round: '', scheduledAt: '', meetLink: '',
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: undefined }));
  };

  const submit = async () => {
    const errs = {};
    if (!form.interviewerId) errs.interviewerId = 'Interviewer ID is required';
    if (!form.round.trim())  errs.round         = 'Round name is required';
    if (!form.scheduledAt)   errs.scheduledAt   = 'Date & time is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      await recruitmentApi.scheduleInterview({
        applicationId,
        interviewerId: Number(form.interviewerId),
        round:         form.round,
        scheduledAt:   form.scheduledAt,
        meetLink:      form.meetLink || undefined,
      });
      toast.success('Interview scheduled');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to schedule interview');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Schedule Interview" onClose={onClose}>
      <div className="space-y-4">
        <Input
          label="Interviewer User ID"
          required
          type="number"
          value={form.interviewerId}
          onChange={set('interviewerId')}
          placeholder="e.g. 12"
          error={errors.interviewerId}
        />
        <Input
          label="Round Name"
          required
          value={form.round}
          onChange={set('round')}
          placeholder="e.g. Technical Round 1"
          error={errors.round}
        />
        <Input
          label="Date & Time"
          required
          type="datetime-local"
          value={form.scheduledAt}
          onChange={set('scheduledAt')}
          error={errors.scheduledAt}
        />
        <Input
          label="Meet / Video Link"
          value={form.meetLink}
          onChange={set('meetLink')}
          placeholder="https://meet.google.com/..."
        />
        <div className="flex justify-end gap-3 pt-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn loading={saving} onClick={submit}>Schedule</Btn>
        </div>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SUBMIT INTERVIEW FEEDBACK
// ─────────────────────────────────────────────────────────────────────────────

export const FeedbackModal = ({ interviewId, onClose, onSaved }) => {
  const [form, setForm] = useState({ feedback: '', rating: '', result: 'Passed' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: undefined }));
  };

  const submit = async () => {
    const errs = {};
    if (!form.feedback.trim()) errs.feedback = 'Feedback is required';
    if (!form.rating)          errs.rating   = 'Rating is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      await recruitmentApi.submitFeedback(interviewId, {
        feedback: form.feedback,
        rating:   Number(form.rating),
        result:   form.result,
      });
      toast.success('Feedback submitted');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to submit feedback');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Submit Interview Feedback" onClose={onClose}>
      <div className="space-y-4">
        <Textarea
          label="Feedback"
          required
          rows={4}
          value={form.feedback}
          onChange={set('feedback')}
          placeholder="Share your assessment of the candidate..."
          error={errors.feedback}
        />

        {/* Star rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            {[1,2,3,4,5].map(n => (
              <button
                key={n}
                onClick={() => { setForm(p => ({...p, rating: n})); setErrors(p => ({...p, rating: undefined})); }}
                className={`w-10 h-10 rounded-lg text-lg transition-all ${Number(form.rating) >= n ? 'bg-amber-400 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'}`}
              >
                ★
              </button>
            ))}
          </div>
          {errors.rating && <p className="text-red-500 text-xs mt-1">{errors.rating}</p>}
        </div>

        <Select label="Result" required value={form.result} onChange={set('result')}>
          {['Passed','Failed','No Show'].map(o => <option key={o}>{o}</option>)}
        </Select>

        <div className="flex justify-end gap-3 pt-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn loading={saving} onClick={submit}>Submit Feedback</Btn>
        </div>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAKE OFFER
// ─────────────────────────────────────────────────────────────────────────────

export const MakeOfferModal = ({ applicationId, candidateName, jobTitle, onClose, onSaved }) => {
  const [form, setForm] = useState({ salary: '', joiningDate: '', expiresAt: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    setErrors(p => ({ ...p, [k]: undefined }));
  };

  const submit = async () => {
    const errs = {};
    if (!form.salary || isNaN(Number(form.salary))) errs.salary = 'Valid salary is required';
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      await recruitmentApi.makeOffer({
        applicationId,
        salary:      Number(form.salary),
        joiningDate: form.joiningDate || undefined,
        expiresAt:   form.expiresAt   || undefined,
        notes:       form.notes       || undefined,
      });
      toast.success('Offer sent');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Failed to send offer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Make Offer" onClose={onClose}>
      <div className="space-y-4">
        {/* Summary card */}
        <div className="rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4">
          <p className="text-xs text-indigo-500 font-medium uppercase tracking-wide mb-1">Offer for</p>
          <p className="font-semibold text-gray-900 dark:text-white">{candidateName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{jobTitle}</p>
        </div>

        <Input
          label="Offered Salary (₹)"
          required
          type="number"
          value={form.salary}
          onChange={set('salary')}
          placeholder="e.g. 1200000"
          min={0}
          error={errors.salary}
        />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Joining Date" type="date" value={form.joiningDate} onChange={set('joiningDate')} />
          <Input label="Offer Expires" type="date" value={form.expiresAt}  onChange={set('expiresAt')}  />
        </div>
        <Textarea label="Notes" rows={3} value={form.notes} onChange={set('notes')} placeholder="Any additional terms..." />

        {/* Salary preview */}
        {form.salary && !isNaN(Number(form.salary)) && (
          <div className="text-center py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
            <p className="text-xs text-emerald-600 font-medium">Offered CTC</p>
            <p className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{fmtSalary(form.salary)}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="success" loading={saving} onClick={submit}>Send Offer</Btn>
        </div>
      </div>
    </Modal>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE APPLICATION STATUS
// ─────────────────────────────────────────────────────────────────────────────

const APP_STATUSES = [
  'Applied','Screening','Shortlisted','Interview Scheduled',
  'Interviewed','Selected','Rejected','Offer Sent','Offer Accepted','Joined',
];

export const UpdateStatusModal = ({ applicationId, currentStatus, onClose, onSaved }) => {
  const [status, setStatus]   = useState(currentStatus);
  const [notes, setNotes]     = useState('');
  const [saving, setSaving]   = useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await recruitmentApi.updateApplicationStatus(applicationId, { status, notes });
      toast.success('Status updated');
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title="Update Application Status" onClose={onClose}>
      <div className="space-y-4">
        <Select label="New Status" required value={status} onChange={e => setStatus(e.target.value)}>
          {APP_STATUSES.map(s => <option key={s}>{s}</option>)}
        </Select>
        <Textarea
          label="Notes (optional)"
          rows={3}
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Reason or additional context..."
        />
        <div className="flex justify-end gap-3 pt-2">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn loading={saving} onClick={submit}>Update Status</Btn>
        </div>
      </div>
    </Modal>
  );
};
