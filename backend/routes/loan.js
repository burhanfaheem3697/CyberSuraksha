const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware')
const partnerAuthMiddleware = require('../middleware/partnerAuthMiddleware')
const LoanController = require('../controllers/LoanController')


// GET /partner/loan-requests (requires partner auth)
router.get('/view-loan-requests',partnerAuthMiddleware,LoanController.viewLoanRequests);

// POST /loan/loan-request (requires auth middleware)
router.post('/loan-request', authMiddleware, LoanController.userCreatesLoanRequest);

module.exports = router; 