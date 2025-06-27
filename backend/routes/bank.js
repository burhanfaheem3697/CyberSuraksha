const express = require('express');
const router = express.Router();
const BankController = require('../controllers/BankController');
const bankAuthMiddleware = require('../middleware/bankAuthMiddleware')

// POST /bank/login (placeholder)
router.post('/login',BankController.loginBank);


// POST /bank/register
router.post('/register',BankController.registerBank);



module.exports = router; 