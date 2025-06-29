const Consent = require('../models/Consent');

// Middleware to validate sandbox access
async function sandboxAccessMiddleware(req, res, next) {
  try {
    const { virtualId, partnerId, contractId } = req.body;
    if (!virtualId || !partnerId || !contractId) {
      return res.status(403).json({ reason: 'Missing required fields.' });
    }

    // Find the consent document
    const consent = await Consent.findOne({
      virtualUserId: virtualId,
      partnerId: partnerId,
      status: 'APPROVED',
    });

    if (!consent) {
      return res.status(403).json({ reason: 'Consent not found or not approved.' });
    }

    // Check if consent has expired
    if (consent.expiresAt && new Date(consent.expiresAt) < new Date()) {
      return res.status(403).json({ reason: 'Consent has expired.' });
    }

    // Check partnerId matches
    if (String(consent.partnerId) !== String(partnerId)) {
      return res.status(403).json({ reason: 'Partner ID mismatch.' });
    }

    // Store allowed fields (dataFields) in req.allowedFields
    req.allowedFields = consent.dataFields;
    next();
  } catch (err) {
    return res.status(403).json({ reason: 'Error validating consent.', error: err.message });
  }
}

module.exports = sandboxAccessMiddleware; 