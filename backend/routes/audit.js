const express = require('express');
const router = express.Router();
const AuditController = require('../controllers/AuditController');

// GET /audit/partner/:id (requires partner auth)
// router.get('/partner/:id', partnerAuth, AuditController.getLogsForPartner);

// GET /audit/user/:id (requires user auth)
// router.get('/user/:id', authMiddleware, AuditController.getLogsForUser);

module.exports = router; 