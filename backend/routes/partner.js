const express = require('express');
const router = express.Router();
const PartnerController = require('../controllers/PartnerController');
const partnerAuthMiddleware = require('../middleware/partnerAuthMiddleware')
const sandboxAccessMiddleware = require('../middleware/sandboxAccessMiddleware');
const { getSandboxedBankData } = require('../controllers/UserBankDataController');
const validateConsentAccess = require('../middleware/validateConsentAccess');
const UserBankData = require('../models/UserBankData');
const AuditLog = require('../models/AuditLog');
const { getDataRoom, logInteraction, getInteractionLogs } = require('../controllers/PartnerDataRoomController');

// POST /partner/register
router.post('/register', PartnerController.registerPartner);



// GET /partner/list
router.get('/list', PartnerController.listPartners);

// POST /partner/login
router.post('/login', PartnerController.loginPartner);

// POST /partner/data-access
router.post('/data-access', sandboxAccessMiddleware, getSandboxedBankData);

// GET /partner/data-room/:contractId
router.get('/data-room/:contractId', validateConsentAccess, getDataRoom);

// POST /partner/log-interaction/:contractId
router.post('/log-interaction/:contractId', partnerAuthMiddleware, logInteraction);

// GET /partner/interaction-logs/:contractId
router.get('/interaction-logs/:contractId', partnerAuthMiddleware, getInteractionLogs);

module.exports = router; 