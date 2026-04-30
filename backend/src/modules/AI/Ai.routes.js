'use strict';

const express = require('express');
const router = express.Router();
const authenticate = require('../../middleware/auth.middleware');
const { handleChat, getChatHistory, clearChatHistory } = require('./Ai.controller');

router.use(authenticate);

router.post('/chat', handleChat);
router.get('/chat/history', getChatHistory);    // ✅ NEW
router.delete('/chat/history', clearChatHistory);

module.exports = router;