const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const LoanController = require('../controllers/LoanController');
const authMiddleware = require('../middleware/authMiddleware')
// POST /user/register
router.post('/register', UserController.registerUser);

// POST /user/login
router.post('/login',authMiddleware, UserController.loginUser);

// GET /user/consents (requires auth middleware)
router.get('/consents', authMiddleware, UserController.viewConsents);

// POST /user/loan-request (requires auth middleware)
router.post('/loan-request', authMiddleware, LoanController.userCreatesLoanRequest);

// GET /user/dashboard (placeholder)
router.get('/dashboard', (req, res) => res.json({ message: 'User dashboard (placeholder)' }));

module.exports = router; 