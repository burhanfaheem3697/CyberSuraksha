const express = require('express');
const router = express.Router();
const ConsentController = require('../controllers/ConsentController');
const partnerAuthMiddleware = require('../middleware/partnerAuthMiddleware')
const authMiddleware = require('../middleware/authMiddleware')
const bankAuthMiddleware = require('../middleware/bankAuthMiddleware')

//POST /consent/create-consent-request
router.post('/create-consent-request',partnerAuthMiddleware,ConsentController.createConsentRequest);

// GET /consent/consents-approved (requires partner auth)
router.get('/consents-approved',partnerAuthMiddleware,ConsentController.viewApprovedConsents);

// GET /consent/view-consents (requires auth middleware)
router.get('/view-consents', authMiddleware, ConsentController.viewConsents);

// POST /consent/approve/:id (requires user auth)
router.post('/approve/:id', authMiddleware, ConsentController.userApprovesConsent);

// POST /consent/revoke/:id (requires user auth)
router.post('/revoke/:id', authMiddleware, ConsentController.revokeConsent);

// GET /consent/user/:id (requires user auth)
// router.get('/user/:id', authMiddleware, ...);

// GET /consent/partner/:id (requires partner auth)
// router.get('/partner/:id', partnerAuth, ...);

// GET /consent/approved-for-bank (for bank to see all approved consents)
router.get('/approved-for-bank',bankAuthMiddleware, ConsentController.viewAllApprovedConsentsForBank);

module.exports = router; 