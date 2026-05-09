'use strict';

const ALLOWED_SETTINGS = {
    appearance: [
        'theme',
        'sidebar_collapsed',
        'compact_mode',
    ],

    attendance: [
        'grace_period',
        'late_mark_minutes',
        'half_day_minutes',
    ],

    payroll: [
        'tax_enabled',
        'pf_enabled',
        'salary_cycle',
    ],

    notification: [
        'email_notifications',
        'push_notifications',
    ],
};

module.exports = {
    ALLOWED_SETTINGS,
};