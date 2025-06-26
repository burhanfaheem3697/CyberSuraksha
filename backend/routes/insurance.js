const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const partnerAuthMiddleware = require('../middleware/partnerAuthMiddleware');
const InsuranceController = require('../controllers/InsuranceController');

// GET /insurance/view-insurance-requests (requires partner auth)
router.get('/view-insurance-requests', partnerAuthMiddleware, InsuranceController.viewInsuranceRequests);

// POST /insurance/insurance-request (requires user auth)
router.post('/insurance-request', authMiddleware, InsuranceController.userCreatesInsuranceRequest);

// POST /insurance/review-insurance-request (requires partner auth)
router.post('/review-insurance-request', partnerAuthMiddleware, InsuranceController.partnerReviewsInsuranceRequest);

// POST /insurance/approve-insurance-request (requires partner auth)
router.post('/approve-insurance-request', partnerAuthMiddleware, InsuranceController.partnerApproveInsuranceRequest);

// POST /insurance/status-updater (open or scheduled, placeholder)
router.post('/status-updater', InsuranceController.statusUpdater);

module.exports = router; 