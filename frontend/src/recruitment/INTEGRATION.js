// INTEGRATION.md — how to wire the recruitment frontend into your existing app
// ─────────────────────────────────────────────────────────────────────────────

// 1. COPY the folder structure into your src/
//
//  src/
//   api/
//     recruitment.api.js          ← the API layer
//   components/
//     recruitment.ui.jsx          ← shared UI primitives
//     JobFormModal.jsx            ← create/edit job modal
//     RecruitmentModals.jsx       ← interview/feedback/offer/status modals
//   pages/
//     JobsPage.jsx                ← HR job management page
//     ApplicationsPage.jsx        ← applicant pipeline page
//     CareersPage.jsx             ← public job board
//   RecruitmentModule.jsx         ← root wrapper (tabs)


// 2. ADD TO YOUR ROUTER (e.g. App.jsx or AppRoutes.jsx)
//
// import { RecruitmentModule, CareersPage } from './RecruitmentModule';
//
// <Route path="/recruitment/*" element={<RecruitmentModule />} />
// <Route path="/careers"        element={<CareersPage />} />      ← no auth needed


// 3. ADD TO YOUR SIDEBAR / NAV
//
// { label: 'Recruitment', path: '/recruitment', icon: '💼', roles: ['Admin','HR','Manager'] }
// { label: 'Careers',     path: '/careers',     icon: '🌐', public: true }


// 4. PERMISSIONS ALREADY IN YOUR permissions.js (nothing to add)
//
//  VIEW_JOBS               Admin, HR, Manager
//  CREATE_JOB              Admin, HR
//  UPDATE_JOB              Admin, HR, Manager
//  DELETE_JOB              Admin, HR
//  VIEW_CANDIDATES         Admin, HR, Manager
//  MANAGE_CANDIDATES       Admin, HR
//  MOVE_CANDIDATE_STAGE    Admin, HR, Manager
//  SCHEDULE_INTERVIEW      Admin, HR, Manager
//  SUBMIT_INTERVIEW_FEEDBACK Admin, HR, Manager
//  MAKE_OFFER              Admin, HR
//  REJECT_CANDIDATE        Admin, HR, Manager


// 5. DEPENDENCIES NEEDED (already in your project)
//
//  axios      ← your existing axios instance
//  sonner     ← toast (already used in ProfilePage)
//  react      ← already present


// 6. API BASE URLs USED
//
//  GET/POST/PATCH/DELETE  /api/v1/recruitment/...
//  GET/POST               /api/v1/recruitment/careers/...    ← public, no auth header needed


// 7. FILE UPLOAD
//
//  Resume upload on CareersPage uses multipart/form-data
//  The axios interceptor sets Content-Type automatically when FormData is passed
//  Cloudinary handles the actual storage on the backend


// 8. OPTIONAL: add /recruitment to your existing dashboard quick-links
//
//  { label: 'Open Positions', value: stats.openJobs, link: '/recruitment' }
