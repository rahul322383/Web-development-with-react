'use strict';

// ─────────────────────────────────────────────────────────────────────────────
// IMPORTS
// ─────────────────────────────────────────────────────────────────────────────
const aiService = require('./Ai.services');
const logger = require('../../config/logger');

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION STORE
// In development  → in-memory Map (fine for a single process)
// In production   → swap the three helpers below to use Redis:
//
//   const redis = require('../../config/redis');   // ioredis client
//
//   const getHistory = async (userId) => {
//       const raw = await redis.get(`chat:${userId}`);
//       return raw ? JSON.parse(raw) : [];
//   };
//   const saveHistory = async (userId, history) => {
//       await redis.setex(`chat:${userId}`, 86400, JSON.stringify(history)); // 24h TTL
//   };
//   const clearHistory = async (userId) => redis.del(`chat:${userId}`);
//
// ─────────────────────────────────────────────────────────────────────────────
const conversationStore = new Map();
const MAX_HISTORY = 10;

const getHistory = (userId) =>
    conversationStore.get(String(userId)) || [];

const saveHistory = (userId, history) =>
    conversationStore.set(String(userId), history);

const clearHistory = (userId) =>
    conversationStore.delete(String(userId));

const appendHistory = (userId, role, content) => {
    const history = getHistory(userId);
    history.push({ role, content, timestamp: new Date().toISOString() });
    if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
    saveHistory(userId, history);
};

// ─────────────────────────────────────────────────────────────────────────────
// SAFE LOGGER HELPERS
// ─────────────────────────────────────────────────────────────────────────────
const logInfo = (event, data = {}) => logger.info({ event, ...data });

const logError = (event, error, extra = {}) => logger.error({
    event,
    message: error?.message,
    stack: error?.stack,
    name: error?.name,
    ...extra,
});

// ─────────────────────────────────────────────────────────────────────────────
// RATE LIMIT STORE (in-memory; use Redis sliding window in production)
// Allows MAX_REQUESTS per WINDOW_MS per user
// ─────────────────────────────────────────────────────────────────────────────
const MAX_REQUESTS = 20;
const WINDOW_MS = 60 * 1000; // 1 minute
const rateLimitMap = new Map();

const checkRateLimit = (userId) => {
    const key = String(userId);
    const now = Date.now();
    const data = rateLimitMap.get(key) || { count: 0, resetAt: now + WINDOW_MS };

    if (now > data.resetAt) {
        data.count = 0;
        data.resetAt = now + WINDOW_MS;
    }

    data.count++;
    rateLimitMap.set(key, data);

    return data.count <= MAX_REQUESTS;
};

// ─────────────────────────────────────────────────────────────────────────────
// ENRICH USER (fetch managerId + department if not on token)
// ─────────────────────────────────────────────────────────────────────────────
const enrichUser = async (user) => {
    if (user.managerId !== undefined && user.department !== undefined) return user;

    const { User } = require('../../database/initModels');
    const full = await User.findByPk(user.id, {
        attributes: ['managerId', 'department', 'designation', 'role', 'name'],
    });

    user.managerId = full?.managerId ?? null;
    user.department = full?.department ?? null;
    user.designation = full?.designation ?? null;
    user.role = full?.role ?? user.role ?? 'Employee';
    user.name = full?.name ?? user.name ?? 'Employee';
    return user;
};

// ─────────────────────────────────────────────────────────────────────────────
// CHAT  —  POST /ai/chat
// ─────────────────────────────────────────────────────────────────────────────
const handleChat = async (req, res) => {
    try {
        const { message } = req.body;
        const user = req.user;

        // ── Auth ───────────────────────────────────────────────────────────
        if (!user?.id) {
            logError('AI_AUTH_ERROR', new Error('Unauthorized'), { ip: req.ip });
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        // ── Rate limit ─────────────────────────────────────────────────────
        if (!checkRateLimit(user.id)) {
            return res.status(429).json({
                success: false,
                message: 'Too many requests. Please wait a moment.',
            });
        }

        // ── Validation ─────────────────────────────────────────────────────
        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }
        if (message.trim().length > 500) {
            return res.status(400).json({ success: false, message: 'Message too long (max 500 chars)' });
        }

        // ── Enrich user ────────────────────────────────────────────────────
        await enrichUser(user);

        // ── History ────────────────────────────────────────────────────────
        appendHistory(user.id, 'user', message.trim());
        const history = getHistory(user.id);

        // ── AI call ────────────────────────────────────────────────────────
        const result = await aiService.chat(user, message.trim(), history);

        // ── Save assistant reply ───────────────────────────────────────────
        if (result?.success && result?.reply) {
            appendHistory(user.id, 'assistant', result.reply);
        }

        logInfo('AI_CHAT_SUCCESS', { userId: user.id, action: result.action, success: result.success });

        return res.status(200).json({
            success: result.success,
            reply: result.reply,
            action: result.action,
            data: result.data || null,
        });

    } catch (error) {
        logError('AI_CHAT_ERROR', error, {
            userId: req?.user?.id,
            path: req?.path,
            method: req?.method,
        });

        return res.status(500).json({
            success: false,
            message: process.env.NODE_ENV === 'development'
                ? error.message
                : 'Something went wrong. Please try again.',
        });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// HISTORY  —  GET /ai/chat/history
// ─────────────────────────────────────────────────────────────────────────────
const getChatHistory = (req, res) => {
    try {
        const history = getHistory(req.user.id);
        logInfo('AI_HISTORY_FETCHED', { userId: req.user.id, count: history.length });
        return res.status(200).json({
            success: true,
            data: { history, count: history.length },
        });
    } catch (error) {
        logError('AI_HISTORY_ERROR', error);
        return res.status(500).json({ success: false, message: 'Failed to fetch chat history' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// CLEAR HISTORY  —  DELETE /ai/chat/history
// ─────────────────────────────────────────────────────────────────────────────
const clearChatHistory = (req, res) => {
    try {
        clearHistory(req.user.id);
        logInfo('AI_HISTORY_CLEARED', { userId: req.user.id });
        return res.status(200).json({ success: true, message: 'Conversation cleared' });
    } catch (error) {
        logError('AI_CLEAR_HISTORY_ERROR', error);
        return res.status(500).json({ success: false, message: 'Failed to clear history' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// POLICY SEARCH  —  GET /ai/policy?q=...
// Standalone REST endpoint for policy docs (no AI round-trip needed)
// ─────────────────────────────────────────────────────────────────────────────
const searchPolicy = (req, res) => {
    try {
        const query = req.query.q || '';
        if (!query.trim()) {
            return res.status(400).json({ success: false, message: 'Query parameter q is required' });
        }
        // Delegate to service via chat to keep audit trail
        return res.status(200).json({
            success: true,
            message: 'Use POST /ai/chat with "search policy for <topic>" to query HR policies.',
        });
    } catch (error) {
        logError('AI_POLICY_SEARCH_ERROR', error);
        return res.status(500).json({ success: false, message: 'Policy search failed' });
    }
};

module.exports = {
    handleChat,
    getChatHistory,
    clearChatHistory,
    searchPolicy,
};