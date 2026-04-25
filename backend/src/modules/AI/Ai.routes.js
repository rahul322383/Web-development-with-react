'use strict';

const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const { handleChat, clearChatHistory } = require('./ai.controller');

const router = express.Router();

// All AI routes require a valid JWT
router.use(authenticate);

// POST /api/ai/chat  — send a message to the AI assistant
router.post('/chat', handleChat);

// DELETE /api/ai/chat/history  — clear conversation history
router.delete('/chat/history', clearChatHistory);

module.exports = router;