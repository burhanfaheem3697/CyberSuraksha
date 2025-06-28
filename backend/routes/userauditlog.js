const express = require('express');
const router = express.Router();
const UserAuditLogController = require('../controllers/UserAuditLogController');
const authMiddleware = require('../middleware/authMiddleware');

// GET /userauditlog/my
router.get('/my', authMiddleware, UserAuditLogController.getLogsForUser);

module.exports = router; 