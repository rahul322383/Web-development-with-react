'use strict';

/**
 * src/modules/notification/notificationPreferences.js
 *
 * Reads and writes per-user notification channel preferences
 * from the existing `settings` table (key/value store per user).
 *
 * Preference key format:  notif_pref_{EVENT_TYPE}
 * Value format (JSON):    { email: true, sms: false, in_app: true }
 *
 * Example stored row:
 *   user_id = 5
 *   key     = "notif_pref_PAYROLL"
 *   value   = '{"email":true,"sms":true,"in_app":true}'
 */

const { Setting } = require('../../database/initModels');

// ─── Defaults (all on) ────────────────────────────────────────────────────────
const DEFAULT_PREFS = { email: true, sms: false, in_app: true };

// Event types that map to a preference key
const PREF_EVENTS = [
    'PAYROLL', 'LEAVE', 'ATTENDANCE', 'EXPENSE',
    'APPROVAL', 'SECURITY', 'SYSTEM', 'ANNOUNCEMENT',
];

const prefKey = (eventType) => `notif_pref_${eventType.toUpperCase()}`;


const getPreferences = async (userId) => {
    const rows = await Setting.findAll({
        where: {
            userId,
            key: PREF_EVENTS.map(prefKey),
        },
    });

    const map = {};
    PREF_EVENTS.forEach(evt => { map[evt] = { ...DEFAULT_PREFS }; });

    rows.forEach(row => {
        const evt = row.key.replace('notif_pref_', '');
        try {
            map[evt] = { ...DEFAULT_PREFS, ...JSON.parse(row.value) };
        } catch {
            map[evt] = { ...DEFAULT_PREFS };
        }
    });

    return map;
};


const getChannelPrefs = async (userId, eventType) => {
    // Normalise — "PAYROLL_PROCESSED" → "PAYROLL"
    const group = eventType.split('_')[0];

    const row = await Setting.findOne({
        where: { userId, key: prefKey(group) },
    });

    if (!row) return { ...DEFAULT_PREFS };

    try {
        return { ...DEFAULT_PREFS, ...JSON.parse(row.value) };
    } catch {
        return { ...DEFAULT_PREFS };
    }
};


const setPreferences = async (userId, eventType, prefs) => {
    const group = eventType.split('_')[0].toUpperCase();
    const key = prefKey(group);
    const existing = await Setting.findOne({ where: { userId, key } });
    const current = existing ? JSON.parse(existing.value || '{}') : {};
    const merged = { ...DEFAULT_PREFS, ...current, ...prefs };

    await Setting.upsert({ userId, key, value: JSON.stringify(merged) });
    return merged;
};

/**
 * setAllPreferences
 * Bulk update — sets the same channel prefs for all event types at once.
 */
const setAllPreferences = async (userId, prefs) => {
    await Promise.all(
        PREF_EVENTS.map(evt => setPreferences(userId, evt, prefs)),
    );
};

module.exports = {
    getPreferences,
    getChannelPrefs,
    setPreferences,
    setAllPreferences,
    DEFAULT_PREFS,
    PREF_EVENTS,
};