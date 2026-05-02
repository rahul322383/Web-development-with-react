
'use strict';

const aiService = require('./Ai.servics');
const logger = require('../../config/logger');

// ─────────────────────────────────────────────────────────────
// CONVERSATION STORE (replace with Redis in production)
// ─────────────────────────────────────────────────────────────

const conversationStore = new Map();
const MAX_HISTORY = 10;

const getHistory = (userId) =>
    conversationStore.get(String(userId)) || [];

const appendHistory = (userId, role, content) => {
    const history = getHistory(userId);

    history.push({
        role,
        content,
        timestamp: new Date().toISOString(),
    });

    if (history.length > MAX_HISTORY) {
        history.splice(0, history.length - MAX_HISTORY);
    }

    conversationStore.set(String(userId), history);
};

const clearHistory = (userId) =>
    conversationStore.delete(String(userId));

// ─────────────────────────────────────────────────────────────
// SAFE LOGGER HELPERS (FIXES [object Object] ISSUE)
// ─────────────────────────────────────────────────────────────

const logInfo = (event, data = {}) => {
    logger.info({
        event,
        ...data,
    });
};

const logError = (event, error, extra = {}) => {
    logger.error({
        event,
        message: error?.message,
        stack: error?.stack,
        name: error?.name,
        ...extra,
    });
};

// ─────────────────────────────────────────────────────────────
// CHAT CONTROLLER
// ─────────────────────────────────────────────────────────────

const handleChat = async (req, res) => {
    try {
        const { message } = req.body;
        const user = req.user;

        // ── AUTH CHECK ───────────────────────────────
        if (!user?.id) {
            logError('AI_AUTH_ERROR', new Error('Unauthorized access attempt'), {
                ip: req.ip,
            });

            return res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
        }

        // ── VALIDATION ───────────────────────────────
        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Message is required',
            });
        }

        if (message.trim().length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Message too long (max 500 chars)',
            });
        }

        // ── ENRICH USER DATA (SAFE FALLBACK) ─────────
        if (user.managerId === undefined) {
            const { User } = require('../../database/initModels');

            const fullUser = await User.findByPk(user.id, {
                attributes: ['managerId', 'department'],
            });

            user.managerId = fullUser?.managerId || null;
            user.department = fullUser?.department || null;
        }

        // ── HISTORY ───────────────────────────────────
        appendHistory(user.id, 'user', message.trim());
        const history = getHistory(user.id);

        // ── AI CALL ───────────────────────────────────
        const result = await aiService.chat(
            user,
            message.trim(),
            history
        );

        // ── SAVE AI RESPONSE ─────────────────────────
        if (result?.success && result?.reply) {
            appendHistory(user.id, 'assistant', result.reply);
        }

        // ── LOG SUCCESS (STRUCTURED) ─────────────────
        logInfo('AI_CHAT_SUCCESS', {
            userId: user.id,
            action: result.action,
            success: result.success,
        });

        // ── RESPONSE ──────────────────────────────────
        return res.status(200).json({
            success: result.success,
            reply: result.reply,
            action: result.action,
            data: result.data || null,
        });

    } catch (error) {
        // ── LOG FULL ERROR (FIXED) ───────────────────
        logError('AI_CHAT_ERROR', error, {
            userId: req?.user?.id,
            path: req?.path,
            method: req?.method,
        });

        return res.status(500).json({
            success: false,
            message:
                process.env.NODE_ENV === 'development'
                    ? error.message
                    : 'Something went wrong... Please try again.',
        });
    }
};

// ─────────────────────────────────────────────────────────────
// CHAT HISTORY
// ─────────────────────────────────────────────────────────────

const getChatHistory = (req, res) => {
    try {
        const history = getHistory(req.user.id);

        logInfo('AI_HISTORY_FETCHED', {
            userId: req.user.id,
            count: history.length,
        });

        return res.status(200).json({
            success: true,
            data: {
                history,
                count: history.length,
            },
        });
    } catch (error) {
        logError('AI_HISTORY_ERROR', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to fetch chat history',
        });
    }
};

// ─────────────────────────────────────────────────────────────
// CLEAR HISTORY
// ─────────────────────────────────────────────────────────────

const clearChatHistory = (req, res) => {
    try {
        clearHistory(req.user.id);

        logInfo('AI_HISTORY_CLEARED', {
            userId: req.user.id,
        });

        return res.status(200).json({
            success: true,
            message: 'Conversation cleared',
        });
    } catch (error) {
        logError('AI_CLEAR_HISTORY_ERROR', error);

        return res.status(500).json({
            success: false,
            message: 'Failed to clear history',
        });
    }
};

module.exports = {
    handleChat,
    getChatHistory,
    clearChatHistory,
};