const Consent = require('../models/Consent');
const PolicyRule = require('../models/PolicyRule');
const AuditLog = require('../models/AuditLog');

// Partner submits a consent request
exports.receiveConsentRequestFromPartner = async (req, res) => {
  try {
    const { virtualUserId, partnerId, purpose, dataFields, duration } = req.body;
    const consent = new Consent({
      virtualUserId,
      partnerId,
      purpose,
      dataFields,
      duration,
      status: 'PENDING',
    });
    await consent.save();
    res.status(201).json({ message: 'Consent request received', consent });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Validate consent request against policy rules
exports.validateWithPolicyLayer = async (req, res) => {
  try {
    const { purpose, dataFields } = req.body;
    const policy = await PolicyRule.findOne({ purpose });
    if (!policy) {
      return res.status(400).json({ message: 'No policy rule found for this purpose' });
    }
    // Check if all requested fields are allowed
    const notAllowed = dataFields.filter(f => !policy.allowedFields.includes(f));
    if (notAllowed.length > 0) {
      return res.status(400).json({ message: 'Some fields are not allowed', notAllowed });
    }
    // Additional checks (retention, trustScore, etc.) can be added here
    res.json({ message: 'Policy validation passed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Validate consent with privacy sandbox (placeholder)
exports.validateWithPrivacySandbox = async (req, res) => {
  try {
    // Placeholder for privacy sandbox logic
    res.json({ message: 'Privacy sandbox validation passed (placeholder)' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Forward consent request to user dashboard (placeholder)
exports.forwardToUserDashboard = async (req, res) => {
  try {
    // Placeholder: In real app, notify user via dashboard/notification
    res.json({ message: 'Consent request forwarded to user dashboard (placeholder)' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// User approves consent
exports.userApprovesConsent = async (req, res) => {
  try {
    const consentId = req.params.id;
    const consent = await Consent.findById(consentId);
    if (!consent) {
      return res.status(404).json({ message: 'Consent not found' });
    }
    consent.status = 'APPROVED';
    consent.approvedAt = new Date();
    // Set expiry based on duration
    if (consent.duration) {
      consent.expiresAt = new Date(Date.now() + consent.duration * 24 * 60 * 60 * 1000);
    }
    await consent.save();
    // Log the approval
    await AuditLog.create({
      virtualUserId: consent.virtualUserId,
      partnerId: consent.partnerId,
      action: 'CONSENT_APPROVED',
      purpose: consent.purpose,
      scopes: consent.dataFields,
      timestamp: new Date(),
      status: 'SUCCESS',
      context: { consentId: consent._id }
    });
    res.json({ message: 'Consent approved', consent });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Send consent to bank (placeholder)
exports.sendConsentToBank = async (req, res) => {
  try {
    // Placeholder: In real app, send consent info to bank system
    res.json({ message: 'Consent sent to bank (placeholder)' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 