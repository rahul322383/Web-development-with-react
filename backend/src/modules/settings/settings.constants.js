'use strict';

const ALLOWED_SETTINGS = {
    // 1. Company
    company: [
        'company_name', 'company_email', 'timezone', 'currency',
        'date_format', 'language', 'fiscal_year_start',
    ],

    // 2. Employee
    employee: [
        'employee_code_prefix', 'auto_generate_employee_id',
        'probation_period_days', 'allow_profile_edit',
    ],

    // 3. Attendance
    attendance: [
        'grace_period', 'late_mark_minutes', 'half_day_minutes',
        'geo_fencing_enabled', 'face_recognition_required', 'overtime_enabled',
    ],

    // 4. Leave
    leave: [
        'carry_forward_enabled', 'max_carry_forward_days', 'sandwich_leave_enabled',
        'leave_approval_levels', 'negative_leave_allowed',
    ],

    // 5. Payroll
    payroll: [
        'salary_cycle', 'tax_enabled', 'pf_enabled', 'esi_enabled',
        'bonus_enabled', 'auto_generate_payslip',
    ],

    // 6. Notification
    notification: [
        'email_notifications', 'push_notifications', 'sms_notifications',
        'birthday_reminders', 'attendance_alerts',
    ],

    // 7. Security
    security: [
        'two_factor_auth', 'password_expiry_days', 'max_login_attempts',
        'session_timeout_minutes',
    ],

    // 8. Appearance
    appearance: [
        'theme', 'compact_mode', 'sidebar_collapsed', 'primary_color',
    ],

    // 9. Shift
    shift: [
        'default_shift', 'night_shift_allowance', 'rotational_shift_enabled',
        'week_off_days',
    ],

    // 10. Geo
    geo: [
        'gps_tracking_enabled', 'allowed_radius_meters', 'work_from_home_enabled',
    ],

    // 11. Document
    document: [
        'max_upload_size_mb', 'allowed_file_types', 'document_expiry_alert_days',
    ],

    // 12. Appraisal
    appraisal: [
        'appraisal_cycle', 'self_review_enabled', 'manager_review_enabled',
        'rating_scale_max',
    ],

    // 13. Recruitment
    recruitment: [
        'auto_assign_interviewer', 'candidate_resume_required',
        'offer_letter_approval_required',
    ],

    // 14. Expense
    expense: [
        'expense_approval_levels', 'max_claim_amount', 'receipt_required',
    ],

    // 15. AI
    ai: [
        'ai_resume_screening', 'auto_leave_prediction', 'chatbot_enabled',
    ],

    // 16. Integration
    integration: [
        'slack_enabled', 'google_calendar_sync', 'zoom_integration',
    ],

    // 17. Localization
    localization: [
        'country', 'holiday_calendar', 'currency_symbol',
    ],

    // 18. Analytics
    analytics: [
        'dashboard_refresh_interval', 'allow_data_export', 'chart_theme',
    ],

    // 19. Workflow
    workflow: [
        'multi_level_approval', 'auto_escalation_enabled', 'approval_timeout_days',
    ],

    // 20. System
    system: [
        'maintenance_mode', 'debug_logging', 'api_rate_limit',
    ],
};

module.exports = { ALLOWED_SETTINGS };