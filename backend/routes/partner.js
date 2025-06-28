const express = require('express');
const router = express.Router();
const PartnerController = require('../controllers/PartnerController');
const partnerAuthMiddleware = require('../middleware/partnerAuthMiddleware')


// POST /partner/register
router.post('/register', PartnerController.registerPartner);



// GET /partner/list
router.get('/list', PartnerController.listPartners);

// POST /partner/login
router.post('/login', PartnerController.loginPartner);



module.exports = router; 