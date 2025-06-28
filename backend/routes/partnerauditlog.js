const express = require('express');
const router = express.Router();
const PartnerAuditLogController = require('../controllers/PartnerAuditLogController');
const partnerAuthMiddleware = require('../middleware/partnerAuthMiddleware')



router.get('/my', partnerAuthMiddleware, PartnerAuditLogController.getLogsForPartner);

module.exports = router;