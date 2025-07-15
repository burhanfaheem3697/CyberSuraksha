const express = require('express');
const router = express.Router();
const ConsentDraftController = require('../controllers/ConsentDraftController');
const partnerAuthMiddleware = require('../middleware/partnerAuthMiddleware');

// All routes require partner authentication
router.use(partnerAuthMiddleware);

// Create a new consent draft
router.post('/create', ConsentDraftController.createConsentDraft);

// Validate a consent draft
router.post('/validate/:id', ConsentDraftController.validateConsentDraft);

// Finalize a consent draft and create a consent
router.post('/finalize/:id', ConsentDraftController.finalizeConsentDraft);

// Get all drafts for a partner
router.get('/partner', ConsentDraftController.getPartnerDrafts);

// Get a specific draft
router.get('/:id', ConsentDraftController.getDraft);

// Update a draft
router.put('/:id', ConsentDraftController.updateDraft);

// Delete a draft
router.delete('/:id', ConsentDraftController.deleteDraft);

module.exports = router;