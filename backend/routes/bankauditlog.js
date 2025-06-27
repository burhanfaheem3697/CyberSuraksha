const express = require('express');
const router = express.Router();
const BankAuditLogController = require('../controllers/BankAuditLogController');
const bankAuthMiddleware = require('../middleware/bankAuthMiddleware');

// Get all bank audit logs
router.get('/all',bankAuthMiddleware,BankAuditLogController.getAllLogs);


module.exports = router; 