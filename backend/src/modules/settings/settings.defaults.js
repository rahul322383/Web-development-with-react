'use strict';

module.exports = {
    company: {
        company_name: '',
        company_email: '',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        date_format: 'DD/MM/YYYY',
        language: 'en',
        fiscal_year_start: 'April',
    },

    employee: {
        employee_code_prefix: 'EMP',
        auto_generate_employee_id: true,
        probation_period_days: 90,
        allow_profile_edit: true,
    },

    attendance: {
        grace_period: 10,
        late_mark_minutes: 30,
        half_day_minutes: 240,
        geo_fencing_enabled: false,
        face_recognition_required: false,
        overtime_enabled: false,
    },

    leave: {
        carry_forward_enabled: true,
        max_carry_forward_days: 10,
        sandwich_leave_enabled: false,
        leave_approval_levels: 1,
        negative_leave_allowed: false,
    },

    payroll: {
        salary_cycle: 'monthly',
        tax_enabled: true,
        pf_enabled: true,
        esi_enabled: false,
        bonus_enabled: false,
        auto_generate_payslip: true,
    },

    notification: {
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        birthday_reminders: true,
        attendance_alerts: true,
    },

    security: {
        two_factor_auth: false,
        password_expiry_days: 90,
        max_login_attempts: 5,
        session_timeout_minutes: 30,
    },

    appearance: {
        theme: 'light',
        compact_mode: false,
        sidebar_collapsed: false,
        primary_color: '#4F46E5',
    },

    shift: {
        default_shift: 'General',
        night_shift_allowance: false,
        rotational_shift_enabled: false,
        week_off_days: ['Saturday', 'Sunday'],
    },

    geo: {
        gps_tracking_enabled: false,
        allowed_radius_meters: 200,
        work_from_home_enabled: true,
    },

    document: {
        max_upload_size_mb: 10,
        allowed_file_types: ['pdf', 'jpg', 'png'],
        document_expiry_alert_days: 30,
    },

    appraisal: {
        appraisal_cycle: 'yearly',
        self_review_enabled: true,
        manager_review_enabled: true,
        rating_scale_max: 5,
    },

    recruitment: {
        auto_assign_interviewer: false,
        candidate_resume_required: true,
        offer_letter_approval_required: true,
    },

    expense: {
        expense_approval_levels: 1,
        max_claim_amount: 50000,
        receipt_required: true,
    },

    ai: {
        ai_resume_screening: false,
        auto_leave_prediction: false,
        chatbot_enabled: false,
    },

    integration: {
        slack_enabled: false,
        google_calendar_sync: false,
        zoom_integration: false,
    },

    localization: {
        country: 'India',
        holiday_calendar: 'IN',
        currency_symbol: '₹',
    },

    analytics: {
        dashboard_refresh_interval: 5,
        allow_data_export: true,
        chart_theme: 'modern',
    },

    workflow: {
        multi_level_approval: false,
        auto_escalation_enabled: false,
        approval_timeout_days: 3,
    },

    system: {
        maintenance_mode: false,
        debug_logging: false,
        api_rate_limit: 100,
    },
};