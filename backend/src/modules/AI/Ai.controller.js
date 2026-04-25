'use strict';

const aiService = require('./Ai.servics');
const logger = require('../../config/logger');

// In-memory conversation history per user (keyed by userId)
// For production, move this to Redis with TTL
const conversationStore = new Map();

const MAX_HISTORY = 10; // max messages to keep per user

const getHistory = (userId) => conversationStore.get(String(userId)) || [];

const appendHistory = (userId, role, content) => {
    const history = getHistory(userId);
    history.push({ role, content });
    // Keep only last MAX_HISTORY messages
    if (history.length > MAX_HISTORY) history.splice(0, history.length - MAX_HISTORY);
    conversationStore.set(String(userId), history);
};

const clearHistory = (userId) => conversationStore.delete(String(userId));

// POST /api/ai/chat
const handleChat = async (req, res) => {
    try {
        const { message } = req.body;
        const user = req.user;
  

        if (!user || !user.id) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        if (message.trim().length > 500) {
            return res.status(400).json({ success: false, message: 'Message too long (max 500 chars)' });
        }

        // Ensure managerId exists
        if (!user.managerId) {
            const { User } = require('../../database/initModels');
            const fullUser = await User.findByPk(user.id, { attributes: ['managerId'] });
            user.managerId = fullUser?.managerId || null;
        }

        // ✅ FIXED ORDER
        appendHistory(user.id, 'user', message.trim());
        const history = getHistory(user.id);

        let result;
        try {
            result = await aiService.chat(user, message.trim(), history);
        } catch (err) {
            console.error("AI SERVICE ERROR:", err);
            throw err;
        }

        // ✅ Only store valid replies
        if (result.success && result.reply) {
            appendHistory(user.id, 'assistant', result.reply);
        }

        return res.status(result.success ? 200 : 400).json({
            success: result.success,
            reply: result.reply,
            action: result.action,
            data: result.data || null,
        });

    } catch (error) {
        logger.error({ event: 'AI_CONTROLLER_ERROR', error: error.message, stack: error.stack });

        return res.status(500).json({
            success: false,
            message: error.message, // 👈 show real error temporarily
        });
    }
};

// DELETE /api/ai/chat/history  — clear conversation for the logged-in user
const clearChatHistory = (req, res) => {
    clearHistory(req.user.id);
    return res.status(200).json({ success: true, message: 'Conversation cleared' });
};

module.exports = { handleChat, clearChatHistory };