const express = require('express');
const router = express.Router();
const partnerAuthMiddleware = require('../middleware/partnerAuthMiddleware');
const bankAuthMiddleware = require('../middleware/bankAuthMiddleware');
const { executeModelOnContract, executeModelForContract } = require('../controllers/ExecutionController');

// Partner-initiated execution (typically in raw view mode)
router.post('/:contractId', partnerAuthMiddleware, executeModelOnContract);

// Bank-initiated execution for clean room use cases (contract + model must match)
router.post('/', bankAuthMiddleware, executeModelForContract);

module.exports = router;
