const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const LoanController = require('../controllers/LoanController');
const authMiddleware = require('../middleware/authMiddleware')
// POST /user/register
router.post('/register', UserController.registerUser);

// POST /user/login
router.post('/login', UserController.loginUser);





// GET /user/dashboard (placeholder)
router.get('/dashboard', (req, res) => res.json({ message: 'User dashboard (placeholder)' }));

module.exports = router; 