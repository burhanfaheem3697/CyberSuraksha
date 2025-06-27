const express = require('express');
const router = express.Router();
const ContractController = require('../controllers/ContractController');
const bankAuthMiddleware = require('../middleware/bankAuthMiddleware');
const partnerAuthMiddleware = require('../middleware/partnerAuthMiddleware');

// POST /contract/create (requires bank auth)
router.post('/create', bankAuthMiddleware, ContractController.createContract);

// GET /contract/bank (requires bank auth)
router.get('/bank', bankAuthMiddleware, ContractController.viewAllContractsForBank);

// GET /contract/partner (requires partner auth)
router.get('/partner', partnerAuthMiddleware, ContractController.viewAllContractsForPartner);

module.exports = router; 