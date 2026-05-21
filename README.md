# HRMS Platform

<div align="center">

**Enterprise Human Resource Management Platform for Modern Organisations**

*Production-grade, multi-module HR ecosystem covering recruitment, onboarding, workforce management, payroll, compliance, analytics, employee engagement, AI automation, and enterprise workflow orchestration.*

![Platform](https://img.shields.io/badge/Platform-Enterprise%20SaaS-1a56db?style=for-the-badge)
![Stack](https://img.shields.io/badge/Stack-Node.js%20%7C%20React%20%7C%20Sequelize-16a34a?style=for-the-badge)
![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20Refresh%20Rotation-7c3aed?style=for-the-badge)
![Payments](https://img.shields.io/badge/Payments-Razorpay-0891b2?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-f59e0b?style=for-the-badge)

</div>

---

## Executive Overview

HRMS Platform is a commercially architected, full-stack Human Resource Management System designed to serve the complete employee lifecycle — from first interview to final settlement. It consolidates every HR, payroll, compliance, learning, and people-operations workflow into a unified, permission-controlled platform built for scale.

The platform is engineered to the same standards as commercial SaaS products — multi-tenant ready, event-driven, real-time capable, and enforcing role-based access control at every layer of the stack simultaneously. It ships with 25+ integrated modules, a Razorpay-powered subscription billing engine, a Socket.io real-time event bus, a custom RBAC permission engine governing 120+ granular permissions, and a document e-signature system with cryptographic token verification.

Built for startups, SMBs, and enterprise organisations seeking a self-hosted or cloud-deployable alternative to legacy HRMS vendors.

---

## Enterprise Architecture

| Layer | Technology & Design |
|---|---|
| **Frontend** | React 18, React Router v6, TanStack Query, Tailwind CSS, Sonner, Lucide Icons |
| **Backend** | Node.js, Express.js, RESTful API design, modular service architecture |
| **ORM & Database** | Sequelize v6, MySQL 8 / PostgreSQL 14, soft deletes, composite indexes |
| **Authentication** | JWT access + refresh token rotation, bcrypt hashing, device fingerprinting |
| **Real-time Engine** | Socket.io — live notifications, audit events, session alerts |
| **Payment Engine** | Razorpay Subscriptions API, webhook-driven lifecycle, auto invoice generation |
| **File Storage** | S3-compatible CDN integration for document and asset uploads |
| **Permission Engine** | Custom RBAC — 5 roles, 120+ permissions, enforced at route + service + UI layers |
| **Observability** | Tamper-evident audit log system, access logging, structured error reporting |
| **Session Security** | Refresh token rotation, reuse detection, full session revocation on compromise |

---

## Core Platform Capabilities

- **Multi-tenant SaaS-ready** — company-scoped data isolation, per-company subscription and settings
- **Event-driven architecture** — every significant action emits an event consumed by notifications, audit logs, and automation
- **Hierarchical settings engine** — 80+ configuration keys scoped at global → company → department → role → user level
- **Three-layer permission enforcement** — backend route middleware, service-layer validation, and frontend component gating run independently
- **Zero-trust document access** — every document view, download, approval, and signature is individually logged with IP and user agent
- **Webhook-first billing** — subscription lifecycle (charges, failures, pauses, cancellations) handled entirely via Razorpay webhooks with no manual reconciliation
- **Template-driven document generation** — HTML templates with variable substitution generate offer letters, contracts, and certificates on demand
- **Cryptographic e-signing** — HMAC-signed, time-limited tokens dispatched per signee; signatures captured with IP, timestamp, and user agent for legal audit trail

---

## Complete Enterprise Module Suite

### 01 · Authentication & Security
Stateless JWT authentication with short-lived access tokens and long-lived hashed refresh tokens. Implements automatic token rotation with reuse detection — any attempt to reuse a revoked refresh token immediately invalidates all active sessions and dispatches a real-time security alert. Device fingerprinting captures IP address and user-agent on every session refresh. Supports configurable password expiry, maximum login attempt lockout, session timeout, and two-factor authentication toggle per company.

---

### 02 · Employee Management
Centralised employee directory with full profile management, manager hierarchy, department assignment, and designation tracking. Auto-generated employee codes with configurable prefix, probation period management, and role-based profile visibility. Supports manager-to-employee relationship trees for approval routing, reporting line display, and organisational chart construction.

---

### 03 · Attendance & Shift Management
Precise daily check-in/check-out with grace period, late-mark threshold, and half-day calculation. Geo-fencing with configurable radius, face recognition flags, and work-from-home mode. Shift engine supports general, rotational, and night shifts with bulk assignment capability, automated shift assignment on employee registration, and a shift history audit trail. Overtime tracking with summary reporting for HR and Finance roles.

---

### 04 · Leave Management
Full leave lifecycle — application, multi-level approval, rejection, and cancellation — with carry-forward rules, sandwich leave detection, and negative leave configuration. Real-time leave balance tracking per employee with year-end balance reset. HR and managers receive a dedicated approval queue with contextual employee data. Configurable approval levels with automatic routing based on manager hierarchy.

---

### 05 · Payroll & Compliance
End-to-end payroll processing with itemised salary breakdowns including PF, ESI, tax, HRA, bonus, and deduction components. Supports monthly and weekly salary cycles with payroll locking to prevent post-approval edits. Auto-generated payslips, year-end summaries, Form 16 generation, and full payroll export for statutory filing. Finance-role-gated approval workflow with audit trail on every processing event.

---

### 06 · Expense Management
Employee expense submission with receipt attachment, category tagging, and configurable maximum claim amounts. Dual-layer approval — manager review followed by finance review — with independent pending queues per role. Receipt mandatory toggle, approval levels, and finance override capability. Full expense history per employee with export for Finance and HR.

---

### 07 · Recruitment & Applicant Tracking System
Complete ATS covering job posting, candidate pipeline management, multi-stage progression, interview scheduling, multi-interviewer panel coordination, structured feedback submission, and offer letter generation. Candidate resume requirement enforcement, offer letter approval workflow, auto-interviewer assignment toggle, and public careers page integration. All pipeline activity is role-gated with granular stage-movement permissions.

---

### 08 · Performance Management & KPI / OKR Tracking
Holistic performance management covering KPI and OKR creation with target value, actual value, unit, weight, and progress tracking. Review cycle engine supports quarterly, half-yearly, annual, probation, and custom cycles with configurable deadlines per review type. Self-appraisals, manager feedback, and 360° peer reviews with anonymity option all feed into a unified review record. Goal management with category, priority, due date, and manager approval. Promotion recommendation and approval workflows linked directly to review outcomes.

---

### 09 · Asset Management
Full IT asset inventory with type-specific fields for laptops, mobiles, SIM cards, tablets, monitors, peripherals, and accessories. Asset assignment with employee acknowledgement capture, expected return date, and condition grading at both assignment and return. Damage reporting with severity classification (minor through total loss), repair cost tracking, employee fault determination, and automatic asset status transitions enforced within atomic database transactions.

---

### 10 · Learning Management System
Course builder with module-level content delivery across video, document, rich text, quiz, and external link formats. Quiz engine supports single choice, multiple choice, true/false, and short answer question types with per-question scoring, attempt limits, shuffle mode, and configurable passing threshold. Progress tracked at individual module level with automatic completion detection. Certificate issuance with sequential numbering, unique verification codes, and a public verification endpoint. HR can bulk-enrol entire teams in a single operation.

---

### 11 · Helpdesk & IT Support Ticketing
Employee-facing ticketing with category-based SLA policies defining separate response and resolution hour targets by priority level. Automatic real-time SLA breach detection on every ticket fetch. Full ticket lifecycle from open through to closed with reopen tracking. Internal notes visible only to IT staff. Activity timeline logs every status change, assignment, and comment. Satisfaction rating collected after resolution. Analytics dashboard showing breach counts and average resolution time.

---

### 12 · Document Management & E-Sign
Centralised document repository with category classification, versioning, approval workflows, and expiry tracking with automated daily marking via cron. Template engine generates offer letters, NDAs, appointment letters, experience certificates, and custom documents from HTML templates with typed variable substitution. E-signature requests dispatched via HMAC-signed, time-limited tokens — signees sign without requiring a platform account. Signatures captured with drawn, typed, or uploaded options alongside IP address, timestamp, and user agent for legal audit purposes.

---

### 13 · Billing & Subscription Engine
Company-level subscription management powered by Razorpay. Plan catalogue with monthly and yearly billing cycles, free trial periods, per-plan feature flags, and employee seat limits. Checkout verifies payment signature cryptographically on the backend, then activates the subscription and generates a GST-inclusive invoice atomically. Recurring charges, failures, pauses, resumes, and cancellations handled via Razorpay webhooks with no manual reconciliation. Full invoice history and payment transaction log per company.

---

### 14 · Notifications & Alerts
Real-time in-app notification delivery via Socket.io with per-user channels. Configurable notification types — email, push, and SMS — with individual toggle control. Event-driven dispatch from every module including document approvals, ticket updates, e-sign requests, course enrolments, certificate issuance, subscription changes, and security alerts. Birthday reminder engine and attendance alert system built in.

---

### 15 · Audit Logs & Observability
Tamper-evident, structured audit log capturing every significant platform action — actor identity, event type, affected resource, IP address, user agent, and timestamp. Role-gated visibility for Admin, HR, and Manager. Filterable by user, module, date range, and event type. Exportable for compliance and forensic purposes. Document-level access logs maintain a separate per-document trail of every interaction.

---

### 16 · Settings Engine
Hierarchical configuration system with 20 categories and 80+ keys spanning company identity, payroll rules, attendance thresholds, leave policies, security parameters, appearance preferences, AI feature toggles, third-party integration switches, workflow automation, and system administration. Settings are scoped at five levels with each independently readable and writable based on the requesting user's role. A dedicated capabilities endpoint informs the frontend of exactly which categories a user can view and edit — eliminating hardcoded role checks on the client.

---

### 17 · Reports & Analytics
Role-gated reporting suite covering headcount trends, attrition analysis, leave utilisation, payroll cost summaries, expense breakdowns, and recruitment funnel metrics. Finance-specific payroll reports and HR-specific employee reports are independently gated. Configurable dashboard refresh interval and chart theme selection per company. Full data export for Admin, HR, and Finance roles.

---

### 18 · AI & Automation Layer
Configurable AI features toggleable per company without code changes. AI resume screening scores and ranks candidates against job requirements. Leave prediction engine forecasts upcoming patterns for workforce planning. Embedded AI chatbot widget serves authenticated users for HR policy queries and self-service workflows.

---

### 19 · Third-Party Integrations
Native integration toggles for Slack (notifications and alerts), Google Calendar (leave and meeting sync), and Zoom (interview scheduling). Integration status managed via the company settings panel. Extensible integration architecture supports additional connectors without core platform modification.

---

### 20 · Onboarding & Offboarding
Structured onboarding task management with completion tracking per employee. Exit initiation workflow with approval gates, full-and-final settlement calculation, FnF approval, and export for Finance. Employee transfer and promotion workflows with effective date management. All lifecycle events recorded in the audit trail.

---

### 21 · Organisational Structure
Manager hierarchy supporting multi-level reporting lines used across approval routing, performance reviews, leave approvals, and organisational chart rendering. Department-level grouping with a dedicated department dashboard for HR and management roles. Company-level multi-entity support with fully scoped data isolation between companies.

---

### 22 · Workforce Planning & Succession
Promotion tracking pipeline linked to performance review outcomes. Headcount reporting by department, role, and seniority. Manager hierarchy visualisation supporting succession planning analysis. Attrition trend data surfaced through the analytics layer for proactive workforce planning decisions.

---

### 23 · Employee Engagement
Satisfaction rating collection at ticket resolution. Birthday reminder automation. Notification preference management giving employees control over their communication channels. Certificate and achievement tracking through the LMS. Self-service profile management and document access empowering employees without HR dependency for routine tasks.

---

### 24 · Knowledge Base & Learning
LMS course catalogue functions as an internal knowledge base. Courses are categorised by type — technical, soft skills, compliance, leadership, onboarding, and product — with level indicators (beginner, intermediate, advanced). Published courses are publicly accessible to enrolled employees. Certificates with expiry dates support recurring compliance training cycles.

---

### 25 · API Ecosystem
Every platform capability is exposed through a versioned RESTful API. All endpoints are protected by JWT authentication and the role-based permission engine. Webhook endpoints support Razorpay payment events with HMAC signature verification. Public token-based endpoints (e-sign, certificate verification) operate without authentication. The API surface covers 150+ endpoints across all modules, enabling frontend replacement, mobile app development, or third-party system integration without backend changes.

---

## RBAC & Permission System

The platform enforces a five-tier role hierarchy — **Admin, HR, Manager, Finance,** and **Employee** — through a custom RBAC engine that operates at three independent layers simultaneously.

**Backend route middleware** evaluates the actor's role against a named permission before the request reaches the controller. **Service-layer validation** performs a second independent check at the business logic level — ensuring no direct service call can bypass route-level guards. **Frontend navigation and component rendering** consults the same permission model to show, hide, or disable UI elements without exposing unauthorised data through the API.

The permission map declares 120+ named permissions each mapped to an explicit array of authorised roles. Every module's routes reference named permissions rather than hardcoded role strings, making the entire permission model auditable from a single file.

| Role | Platform Access |
|---|---|
| **Admin** | Unrestricted access across all modules, settings scopes, billing, user management, system configuration, and audit |
| **HR** | Full people operations — hiring, onboarding, leave, payroll processing, performance cycles, document management, LMS administration |
| **Finance** | Payroll approval and export, expense finance review, FnF settlement, year-end reports, payroll analytics |
| **Manager** | Team attendance and leave approval, performance reviews and goal tracking for direct reports, ticket assignment, asset return |
| **Employee** | Self-service — own attendance, leave, payslips, expenses, courses, tickets, documents, e-sign, and profile |

---

## Security & Compliance

The platform is designed with a security-first posture at every architectural boundary.

**Session Security** — Refresh tokens are hashed with bcrypt before storage. Token rotation issues a new refresh token on every session refresh and revokes the previous one. Any reuse of a revoked token is treated as a session compromise: all active sessions are immediately revoked and a real-time security alert is dispatched to the user.

**Device Fingerprinting** — IP address and user-agent are captured and validated on every refresh token exchange. Simultaneous IP and user-agent mismatch triggers automatic full session revocation.

**Webhook Integrity** — All inbound Razorpay webhook payloads are verified against an HMAC-SHA256 signature before any processing begins. Invalid signatures are rejected at the entry point.

**E-Sign Audit Trail** — Every e-signature event captures the signee's IP address, user-agent, timestamp, and signature data. Tokens are single-use, time-limited (7 days), and cryptographically random (32-byte hex).

**Document Access Logging** — Every document interaction — view, download, approval, rejection, deletion, and signature — is individually logged with actor identity, IP, and timestamp.

**Configurable Security Policies** — Two-factor authentication, password expiry days, maximum login attempts, and session timeout are all configurable per company from the settings engine without code changes.

---

## Multi-Tenant SaaS Readiness

Every data entity in the platform carries a `companyId` scope. All queries filter by the requesting user's company — preventing cross-company data leakage at the database query level, not just at the application layer. Subscription plans, settings, notifications, documents, tickets, assets, and all other resources are fully isolated per company.

The billing engine supports independent subscription lifecycles per company — each company can subscribe to, upgrade, pause, or cancel its plan without affecting any other tenant. Settings are scoped hierarchically within each company's context, allowing company-level defaults to be overridden at department, role, or individual user level.

---

## Scalability & Engineering Design

**Transactional integrity** — all multi-step operations execute within database transactions to guarantee atomicity. Subscription activation, invoice generation, quiz submission, certificate issuance, and asset assignment all commit or roll back as single units.

**Soft deletes** — all primary entities use Sequelize's `paranoid` mode, preserving data integrity for audit and reporting while allowing logical deletion from active views.

**Repository pattern** — every module separates data access, business logic, and HTTP handling into distinct layers, enabling independent testing and replacement of each layer without affecting the others.

**Event-driven notifications** — the notification and audit systems are decoupled from business logic via Socket.io events, preventing notification failures from affecting core operations.

**Cron-ready automation** — expiry checking for documents, SLA breach detection for tickets, and leave balance resets are designed as standalone callable functions ready for cron scheduling without application restart.

---

## Analytics & Business Intelligence

The analytics layer provides structured insight across all platform dimensions. HR dashboards surface headcount growth, department distribution, attrition rate, and tenure analysis. Finance dashboards expose payroll cost trends, expense category breakdowns, and outstanding FnF liabilities. Recruitment analytics show pipeline conversion rates, time-to-hire, and offer acceptance ratios. Performance analytics aggregate KPI achievement rates, review completion percentages, and promotion pipeline depth. All analytics are role-gated — Finance sees payroll data, HR sees people data, and Managers see their team's data only.

---

## Technology Stack

| Category | Technology |
|---|---|
| **Frontend Framework** | React 18 |
| **Routing** | React Router v6 |
| **State & Data Fetching** | TanStack Query (React Query) |
| **Styling** | Tailwind CSS |
| **Toast Notifications** | Sonner |
| **Icons** | Lucide React |
| **Backend Framework** | Node.js + Express.js |
| **ORM** | Sequelize v6 |
| **Primary Database** | MySQL 8 / PostgreSQL 14 |
| **Authentication** | JSON Web Tokens + bcrypt |
| **Real-time** | Socket.io |
| **Payment Gateway** | Razorpay Subscriptions API |
| **File Storage** | S3-compatible object storage |
| **Validation** | Joi |
| **Cryptography** | Node.js built-in `crypto` module |

---

## Product Positioning

HRMS Platform is built for three distinct customer profiles.

**Startups** gain an immediately deployable, self-hosted HR system that eliminates the need for multiple SaaS subscriptions — one platform covers hiring, payroll, attendance, leave, documents, and employee engagement from day one.

**SMBs** benefit from enterprise-grade features — multi-level approvals, SLA-backed helpdesk, LMS with certifications, and a full recruitment ATS — without the enterprise price tag or implementation overhead.

**Enterprise organisations** gain a customisable, self-hosted platform with multi-tenant isolation, hierarchical settings, an auditable permission engine, and the ability to extend or replace any module without disrupting the broader system.

---

## License

This project is licensed under the **MIT License** — free to use, modify, and distribute with attribution.

---

<div align="center">

*Built with Node.js · Express · Sequelize · React · Razorpay · Socket.io*

</div>