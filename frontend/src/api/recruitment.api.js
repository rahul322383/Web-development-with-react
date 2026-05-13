// recruitment.api.js
// All calls use your existing axios instance (with JWT interceptor + refresh logic)

import api from './axios'; // your existing axios instance

// ─────────────────────────────────────────────────────────────────────────────
// JOBS (authenticated)
// ─────────────────────────────────────────────────────────────────────────────

export const recruitmentApi = {

  // ── Jobs ──────────────────────────────────────────────────────────────────

  listJobs: (params = {}) =>
    api.get('/recruitment', { params }).then(r => r.data),

  getJob: (id) =>
    api.get(`/recruitment/jobs/${id}`).then(r => r.data),

  createJob: (data) =>
    api.post('/recruitment', data).then(r => r.data),

  updateJob: (id, data) =>
    api.patch(`/recruitment/${id}`, data).then(r => r.data),

  deleteJob: (id) =>
    api.delete(`/recruitment/${id}`).then(r => r.data),

  // ── Applications ──────────────────────────────────────────────────────────

  listApplications: (params = {}) =>
    api.get('/recruitment/applications', { params }).then(r => r.data),

  getApplication: (id) =>
    api.get(`/recruitment/applications/${id}`).then(r => r.data),

  updateApplicationStatus: (id, data) =>
    api.patch(`/recruitment/applications/${id}/status`, data).then(r => r.data),

  // ── Interviews ────────────────────────────────────────────────────────────

  scheduleInterview: (data) =>
    api.post('/recruitment/interviews', data).then(r => r.data),

  submitFeedback: (id, data) =>
    api.patch(`/recruitment/interviews/${id}/feedback`, data).then(r => r.data),

  // ── Offers ────────────────────────────────────────────────────────────────

  makeOffer: (data) =>
    api.post('/recruitment/offers', data).then(r => r.data),

  acceptOffer: (id) =>
    api.patch(`/recruitment/offers/${id}/accept`).then(r => r.data),

  rejectOffer: (id) =>
    api.patch(`/recruitment/offers/${id}/reject`).then(r => r.data),

  // ── Stats ─────────────────────────────────────────────────────────────────

  getStats: () =>
    api.get('/recruitment/stats').then(r => r.data),

  // ── Public (careers portal — no auth needed) ──────────────────────────────

  listPublishedJobs: (params = {}) =>
    api.get('/recruitment/careers', { params }).then(r => r.data),

  getPublicJob: (id) =>
    api.get(`/recruitment/careers/${id}`).then(r => r.data),

  // FormData because resume is a file
  applyToJob: (id, formData) =>
    api.post(`/recruitment/careers/${id}/apply`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data),
};
