const Consent = require('../models/Consent');
const PolicyRule = require('../models/PolicyRule');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User')
// Partner submits a consent request
exports.createConsentRequest = async (req, res) => {
  try {
    const { virtualUserId, purpose, dataFields, duration } = req.body;
    const partnerId = req.partner.partnerId; // req.partner set by partner auth middleware
    const consent = new Consent({
      virtualUserId,
      partnerId,
      purpose,
      dataFields,
      duration,
      status: 'PENDING',
    });
    await consent.save();
    // Log the creation
    await AuditLog.create({
      virtualUserId: virtualUserId,
      partnerId: partnerId,
      action: 'CONSENT_CREATED',
      purpose: purpose,
      scopes: dataFields,
      timestamp: new Date(),
      status: 'SUCCESS',
      context: { consentId: consent._id }
    });
    res.status(201).json({ message: 'Consent request created', consent });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// View all approved consents for this partner
exports.viewApprovedConsents = async (req, res) => {
  try {
    const partnerId = req.partner.partnerId;
    const consents = await Consent.find({ partnerId, status: 'APPROVED' })
      .populate('partnerId', 'name');
    res.json({ consents });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// View user's consents
exports.viewConsents = async (req, res) => {
  try {
    const userId = req.user.userId; // req.user is set by auth middleware
    // Fetch the user's virtualIds from the User model
    const user = await User.findById(userId).select('virtualIds');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const consents = await Consent.find({ virtualUserId: { $in: user.virtualIds } })
      .populate('partnerId', 'name email');
    res.json({ consents });
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

// User revokes consent
exports.revokeConsent = async (req, res) => {
  try {
    const consentId = req.params.id;
    const { revokeReason } = req.body;
    const consent = await Consent.findById(consentId);
    if (!consent) {
      return res.status(404).json({ message: 'Consent not found' });
    }
    consent.status = 'REVOKED';
    consent.revokedAt = new Date();
    if (revokeReason) consent.revokeReason = revokeReason;
    await consent.save();
    // Log the revocation
    await AuditLog.create({
      virtualUserId: consent.virtualUserId,
      partnerId: consent.partnerId,
      action: 'CONSENT_REVOKED',
      purpose: consent.purpose,
      scopes: consent.dataFields,
      timestamp: new Date(),
      status: 'SUCCESS',
      context: { consentId: consent._id, revokeReason },
    });
    res.json({ message: 'Consent revoked', consent });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 