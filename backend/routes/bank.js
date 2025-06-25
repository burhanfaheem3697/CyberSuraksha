const express = require('express');
const router = express.Router();
const BankController = require('../controllers/BankController');
const authMiddleware = require('../middleware/authMiddleware.js');

// POST /bank/login (placeholder)
router.post('/login',BankController.loginBank);

// GET /bank/pending-consents (requires bank auth)
router.get('/pending-consents', BankController.viewConsentRequests);

// POST /bank/upload-data (requires bank auth)
router.post('/upload-data', BankController.sendBankDataToPartner);

// POST /bank/register
router.post('/register', BankController.registerBank);

module.exports = router; 