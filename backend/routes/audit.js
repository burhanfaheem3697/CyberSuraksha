const express = require('express');
const router = express.Router();
const AuditController = require('../controllers/AuditController');
const authMiddleware = require('../middleware/authMiddleware')
const partnerAuthMiddleware = require('../middleware/partnerAuthMiddleware')

// GET /audit/partner/:id (requires partner auth)
router.get('/partner', partnerAuthMiddleware, AuditController.getLogsForPartner);

// GET /audit/user/:id (requires user auth)
router.get('/user', authMiddleware, AuditController.getLogsForUser);

module.exports = router; 