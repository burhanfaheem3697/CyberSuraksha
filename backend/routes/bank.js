const express = require('express');
const router = express.Router();
const BankController = require('../controllers/BankController');
const bankAuthMiddleware = require('../middleware/bankAuthMiddleware')

// POST /bank/login (placeholder)
router.post('/login',BankController.loginBank);

// GET /bank/pending-consents (requires bank auth)
router.get('/pending-consents',bankAuthMiddleware,BankController.viewConsentRequests);

// POST /bank/upload-data (requires bank auth)
router.post('/upload-data',bankAuthMiddleware,BankController.sendBankDataToPartner);

// POST /bank/register
router.post('/register',BankController.registerBank);

module.exports = router; 