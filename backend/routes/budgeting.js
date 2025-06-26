const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const partnerAuthMiddleware = require('../middleware/partnerAuthMiddleware');
const BudgetingController = require('../controllers/BudgetingController');

// GET /budgeting/view-budgeting-requests (requires partner auth)
router.get('/view-budgeting-requests', partnerAuthMiddleware, BudgetingController.viewBudgetingRequests);

// POST /budgeting/budgeting-request (requires user auth)
router.post('/budgeting-request', authMiddleware, BudgetingController.userCreatesBudgetingRequest);

// POST /budgeting/review-budgeting-request (requires partner auth)
router.post('/review-budgeting-request', partnerAuthMiddleware, BudgetingController.partnerReviewsBudgetingRequest);

// POST /budgeting/approve-budgeting-request (requires partner auth)
router.post('/approve-budgeting-request', partnerAuthMiddleware, BudgetingController.partnerApproveBudgetingRequest);

// POST /budgeting/status-updater (open or scheduled, placeholder)
router.post('/status-updater', BudgetingController.statusUpdater);

module.exports = router; 