const express = require('express');
const router = express.Router();
const PartnerController = require('../controllers/PartnerController');
const authMiddleware = require('../middleware/authMiddleware.js');

// POST /partner/register
router.post('/register', PartnerController.registerPartner);

// GET /partner/loan-requests (requires partner auth)
router.get('/loan-requests',authMiddleware,PartnerController.viewLoanRequests);

// POST /partner/create-consent-request (requires partner auth)
router.post('/create-consent-request',authMiddleware,PartnerController.createConsentRequest);

// GET /partner/consents-approved (requires partner auth)
router.get('/consents-approved',authMiddleware,PartnerController.viewApprovedConsents);

// GET /partner/list
router.get('/list', PartnerController.listPartners);

// POST /partner/login
router.post('/login', PartnerController.loginPartner);

module.exports = router; 