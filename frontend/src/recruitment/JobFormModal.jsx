// JobFormModal.jsx — create / edit a job posting

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { recruitmentApi } from '../api/recruitment.api';
import { Modal, Input, Textarea, Select, Btn } from './recruitment.ui';

const EMPTY = {
  title: '', department: '', location: '', employmentType: 'Full-Time',
  experienceLevel: 'Mid', salaryMin: '', salaryMax: '', currency: 'INR',
  description: '', responsibilities: '', requirements: '',
  skills: '', openings: 1, status: 'Draft', isRemote: false, expiresAt: '',
};

export const JobFormModal = ({ job, onClose, onSaved }) => {
  const isEdit = Boolean(job);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (job) {
      setForm({
        title:           job.title           ?? '',
        department:      job.department      ?? '',
        location:        job.location        ?? '',
        employmentType:  job.employmentType  ?? 'Full-Time',
        experienceLevel: job.experienceLevel ?? 'Mid',
        salaryMin:       job.salaryMin       ?? '',
        salaryMax:       job.salaryMax       ?? '',
        currency:        job.currency        ?? 'INR',
        description:     job.description     ?? '',
        responsibilities:job.responsibilities ?? '',
        requirements:    job.requirements    ?? '',
        skills:          Array.isArray(job.skills) ? job.skills.join(', ') : '',
        openings:        job.openings        ?? 1,
        status:          job.status          ?? 'Draft',
        isRemote:        job.isRemote        ?? false,
        expiresAt:       job.expiresAt ? job.expiresAt.split('T')[0] : '',
      });
    }
  }, [job]);

  const set = (k) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [k]: val }));
    setErrors((p) => ({ ...p, [k]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (form.salaryMin && form.salaryMax && Number(form.salaryMin) > Number(form.salaryMax))
      errs.salaryMax = 'Max salary must be ≥ min salary';
    return errs;
  };

  const submit = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    try {
      const payload = {
        ...form,
        salaryMin:  form.salaryMin  !== '' ? Number(form.salaryMin)  : undefined,
        salaryMax:  form.salaryMax  !== '' ? Number(form.salaryMax)  : undefined,
        openings:   Number(form.openings),
        skills:     form.skills.split(',').map(s => s.trim()).filter(Boolean),
        expiresAt:  form.expiresAt || undefined,
      };

      if (isEdit) {
        await recruitmentApi.updateJob(job.id, payload);
        toast.success('Job updated');
      } else {
        await recruitmentApi.createJob(payload);
        toast.success('Job created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message ?? 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={isEdit ? 'Edit Job' : 'Post New Job'} onClose={onClose} wide>
      <div className="space-y-5">

        {/* Title + Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Job Title" required value={form.title} onChange={set('title')} error={errors.title} placeholder="e.g. Senior React Developer" />
          <Input label="Department" value={form.department} onChange={set('department')} placeholder="e.g. Engineering" />
        </div>

        {/* Location + Remote */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Location" value={form.location} onChange={set('location')} placeholder="e.g. Bengaluru" />
          <div className="flex items-center gap-3 pt-6">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={form.isRemote} onChange={set('isRemote')} />
              <div className="w-10 h-6 rounded-full bg-gray-300 dark:bg-gray-600 peer-checked:bg-indigo-600 transition-colors" />
              <div className="absolute left-0.5 top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
            </label>
            <span className="text-sm text-gray-700 dark:text-gray-300">Remote Position</span>
          </div>
        </div>

        {/* Employment Type + Experience Level */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Employment Type" value={form.employmentType} onChange={set('employmentType')}>
            {['Full-Time','Part-Time','Contract','Internship','Freelance'].map(o => <option key={o}>{o}</option>)}
          </Select>
          <Select label="Experience Level" value={form.experienceLevel} onChange={set('experienceLevel')}>
            {['Entry','Mid','Senior','Lead','Manager','Executive'].map(o => <option key={o}>{o}</option>)}
          </Select>
        </div>

        {/* Salary range */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Min Salary" type="number" value={form.salaryMin} onChange={set('salaryMin')} min={0} placeholder="e.g. 800000" />
          <Input label="Max Salary" type="number" value={form.salaryMax} onChange={set('salaryMax')} min={0} placeholder="e.g. 1500000" error={errors.salaryMax} />
          <Select label="Currency" value={form.currency} onChange={set('currency')}>
            {['INR','USD','EUR','GBP'].map(o => <option key={o}>{o}</option>)}
          </Select>
        </div>

        {/* Openings + Status + Expires */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input label="Openings" type="number" value={form.openings} onChange={set('openings')} min={1} />
          <Select label="Status" value={form.status} onChange={set('status')}>
            {['Draft','Published','Paused','Closed'].map(o => <option key={o}>{o}</option>)}
          </Select>
          <Input label="Expires At" type="date" value={form.expiresAt} onChange={set('expiresAt')} />
        </div>

        {/* Skills */}
        <Input
          label="Skills (comma-separated)"
          value={form.skills}
          onChange={set('skills')}
          placeholder="React, Node.js, TypeScript"
        />

        {/* Description */}
        <Textarea label="Job Description" rows={4} value={form.description} onChange={set('description')} placeholder="Describe the role..." />
        <Textarea label="Responsibilities" rows={3} value={form.responsibilities} onChange={set('responsibilities')} placeholder="Key responsibilities..." />
        <Textarea label="Requirements" rows={3} value={form.requirements} onChange={set('requirements')} placeholder="Must-have qualifications..." />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn loading={saving} onClick={submit}>
            {isEdit ? 'Save Changes' : 'Post Job'}
          </Btn>
        </div>
      </div>
    </Modal>
  );
};
