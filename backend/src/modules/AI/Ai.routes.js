'use strict';

const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth.middleware');

const {
    handleChat,
    getChatHistory,
    clearChatHistory,
    searchPolicy,
} = require('./Ai.controller');

// All AI routes require authentication
router.use(authenticate);

// ── Chat ─────────────────────────────────────────────────────────────────────
router.post('/chat', handleChat);
router.get('/chat/history', getChatHistory);
router.delete('/chat/history', clearChatHistory);

// ── Policy search ─────────────────────────────────────────────────────────────
// GET /ai/policy?q=leave+policy
router.get('/policy', searchPolicy);

module.exports = router;