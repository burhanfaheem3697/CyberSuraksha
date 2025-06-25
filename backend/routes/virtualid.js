const express = require('express');
const router = express.Router();
const VirtualIdController = require('../controllers/VirtualIdController');

// POST /virtualid/generate (requires auth)
// router.post('/generate', authMiddleware, VirtualIdController.issueVirtualIdForConsent);

// POST /virtualid/revoke (requires auth)
// router.post('/revoke', authMiddleware, VirtualIdController.rotateOrRevokeId);

module.exports = router; 