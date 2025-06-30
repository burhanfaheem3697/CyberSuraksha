const express = require('express');
const router = express.Router();
const UserBankDataController = require('../controllers/UserBankDataController');
const bankAuthMiddleware = require('../middleware/bankAuthMiddleware');

// GET /userbankdata/test-all (FOR TESTING ONLY - no auth)
router.get('/test-all', UserBankDataController.getAllUserBankData);

// POST /userbankdata/fetch-by-virtual-id (requires bank auth)
router.post('/fetch-by-virtual-id', bankAuthMiddleware, UserBankDataController.fetchUserDataByVirtualId);

module.exports = router;