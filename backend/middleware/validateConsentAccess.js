const Contract = require('../models/Contract');
const Consent = require('../models/Consent');
const jwt = require('jsonwebtoken');

async function validateConsentAccess(req, res, next) {
  try {
    const { contractId } = req.params;
    if (!contractId) {
      return res.status(400).json({ error: 'Missing contractId' });
    }

    // Get JWT token from cookie
    const token = req.cookies && req.cookies.partnerToken;
    if (!token) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }
    let partnerId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      partnerId = decoded.id || decoded.partnerId;
    } catch (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Load contract and consent
    const contract = await Contract.findById(contractId).lean();
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }
    const consent = await Consent.findById(contract.consentId).lean();
    if (!consent) {
      return res.status(404).json({ error: 'Consent not found' });
    }

    // Check consent status and expiry
    if (consent.status === 'REVOKED') {
      return res.status(403).json({ error: 'Consent revoked' });
    }
    if (consent.status !== 'APPROVED') {
      return res.status(403).json({ error: 'Consent not approved' });
    }
    if (consent.expiresAt && new Date(consent.expiresAt) < Date.now()) {
      return res.status(403).json({ error: 'Consent expired' });
    }

    // Check partnerId matches
    if (String(consent.partnerId) !== String(partnerId)) {
      return res.status(403).json({ error: 'Partner not authorized for this consent' });
    }

    // Attach allowedFields and virtualId to req
    req.allowedFields = consent.dataFields;
    req.virtualId = consent.virtualUserId;
    req.contract = contract;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Error validating consent access', details: err.message });
  }
}

module.exports = validateConsentAccess; 