const express = require('express');
const router = express.Router();
const ConsentController = require('../controllers/ConsentController');

// POST /consent/incoming
router.post('/incoming', ConsentController.receiveConsentRequestFromPartner);

// POST /consent/approve/:id (requires user auth)
// router.post('/approve/:id', authMiddleware, ConsentController.userApprovesConsent);

// GET /consent/user/:id (requires user auth)
// router.get('/user/:id', authMiddleware, ...);

// GET /consent/partner/:id (requires partner auth)
// router.get('/partner/:id', partnerAuth, ...);

module.exports = router; 