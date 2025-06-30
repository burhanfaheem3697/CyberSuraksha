const Consent = require('../models/Consent');
const PolicyRule = require('../models/PolicyRule');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User')
const BankAuditLog = require('../models/BankAuditLog');
const Partner = require('../models/Partner');
const { evaluateConsentRequest } = require('../../aiService/decisionEngine');
const { classifyPurpose } = require('../../aiService/llmPurposeClassifier');
const UserAuditLog = require('../models/UserAuditLog')
const PartnerAuditLog = require('../models/PartnerAuditLog');

// Helper to get userId from virtualUserId
async function getUserIdFromVirtualId(virtualUserId) {
  const virtualIdDoc = await require('../models/VirtualID').findById(virtualUserId);
  return virtualIdDoc ? virtualIdDoc.userId : null;
}

// Partner submits a consent request
exports.createConsentRequest = async (req, res) => {
  try {
    const { virtualUserId, rawPurpose, dataFields, duration,dataResidency,crossBorder,quantumSafe,anonymization } = req.body;
    const partnerId = req.partner.partnerId; // req.partner set by partner auth middleware
    // Fetch partner info for AI validation
    const partner = await Partner.findById(partnerId);
    if (!partner) {
      return res.status(400).json({ message: 'Invalid partner ID' });
    }
    // Classify the raw purpose
    const classification = await classifyPurpose(req.body);
    const main_category = classification.main_category;

    // Prepare AI validation input
    const aiRequest = {
      partnerName: partner.name,
      partnerId: partnerId,
      purpose: main_category,
      fieldsRequested: dataFields,
      requestedDurationDays: duration,
      partnerTrustScore: partner.trustScore,
      dataResidency,
      crossBorder,
      quantumSafe,
      anonymization,
      rawPurpose,
      timestamp: Date.now(),
    };
    // Run AI validation
    const aiResult = await evaluateConsentRequest(aiRequest);
    if (!aiResult.approved) {
      
      await UserAuditLog.create({
        virtualUserId,
        action: 'CONSENT_REJECTED',
        details: {
          partnerId,
          purpose: main_category,
          dataFields,
          reason: aiResult.reason,
          rawPurpose,
          main_category,
          sub_category: classification.sub_category,
          requires_sensitive_data: classification.requires_sensitive_data,
          justification: classification.justification
        },
        status: 'REJECTED',
        context: { source: aiResult.source }
      });
      await PartnerAuditLog.create({
        virtualUserId,
        action: 'CONSENT_REJECTED',
        details: {
          partnerId,
          purpose: main_category,
          dataFields,
          reason: aiResult.reason,
          rawPurpose,
          main_category,
          sub_category: classification.sub_category,
          requires_sensitive_data: classification.requires_sensitive_data,
          justification: classification.justification
        },
        status: 'REJECTED',
        context: { source: aiResult.source }
      });
      return res.status(403).json({
        status: "REJECTED",
        source: aiResult.source,
        reason: aiResult.reason,
        main_category,
        sub_category: classification.sub_category,
        justification: classification.justification
      });
    }
    // If approved, save consent
    const consent = new Consent({
      virtualUserId,
      partnerId,
      purpose: main_category,
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
      purpose: main_category,
      scopes: dataFields,
      timestamp: new Date(),
      status: 'SUCCESS',
      context: { consentId: consent._id }
    });
    await UserAuditLog.create({
      virtualUserId,
      action: 'CONSENT_CREATED',
      details: {
        partnerId,
        purpose: main_category,
        dataFields,
        rawPurpose,
        main_category,
        sub_category: classification.sub_category,
        requires_sensitive_data: classification.requires_sensitive_data,
        justification: classification.justification
      },
      status: 'SUCCESS',
      context: { consentId: consent._id }
    });
    await PartnerAuditLog.create({
      virtualUserId,
      action: 'CONSENT_CREATED',
      details: {
        partnerId,
        purpose: main_category,
        dataFields,
        rawPurpose,
        main_category,
        sub_category: classification.sub_category,
        requires_sensitive_data: classification.requires_sensitive_data,
        justification: classification.justification
      },
      status: 'SUCCESS',
      context: { consentId: consent._id }
    });
    // Log to BankAuditLog as well
    await BankAuditLog.create({
      virtualUserId: virtualUserId,
      partnerId,
      action: 'CONSENT_CREATED',
      purpose: main_category,
      scopes: dataFields,
      timestamp: new Date(),
      status: 'SUCCESS',
      context: {
        consentId: consent._id,
        rawPurpose,
        main_category,
        sub_category: classification.sub_category,
        requires_sensitive_data: classification.requires_sensitive_data,
        justification: classification.justification
      }
    });
    res.status(201).json({ message: 'Consent request created', consent, main_category, sub_category: classification.sub_category, justification: classification.justification });
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



// Validate consent with privacy sandbox (placeholder)
exports.validateWithPrivacySandbox = async (req, res) => {
  try {
    // Placeholder for privacy sandbox logic
    res.json({ message: 'Privacy sandbox validation passed (placeholder)' });
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
    await UserAuditLog.create({
      virtualUserId: consent.virtualUserId,
      action: 'CONSENT_APPROVED',
      details: {
        partnerId: consent.partnerId,
        purpose: consent.purpose,
        dataFields: consent.dataFields,
        approvedAt: consent.approvedAt,
      },
      status: 'SUCCESS',
      context: { consentId: consent._id }
    });
    await PartnerAuditLog.create({
      virtualUserId: consent.virtualUserId,
      action: 'CONSENT_APPROVED',
      details: {
        partnerId: consent.partnerId,
        purpose: consent.purpose,
        dataFields: consent.dataFields,
        approvedAt: consent.approvedAt,
      },
      status: 'SUCCESS',
      context: { consentId: consent._id }
    });
    // Log to BankAuditLog as well
    await BankAuditLog.create({
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
    await UserAuditLog.create({
      virtualUserId: consent.virtualUserId,
      action: 'CONSENT_REVOKED',
      details: {
        partnerId: consent.partnerId,
        purpose: consent.purpose,
        dataFields: consent.dataFields,
        revokedAt: consent.revokedAt,
        revokeReason: consent.revokeReason,
      },
      status: 'SUCCESS',
      context: { consentId: consent._id }
    });
    await PartnerAuditLog.create({
      virtualUserId: consent.virtualUserId,
      action: 'CONSENT_REVOKED',
      details: {
        partnerId: consent.partnerId,
        purpose: consent.purpose,
        dataFields: consent.dataFields,
        revokedAt: consent.revokedAt,
        revokeReason: consent.revokeReason,
      },
      status: 'SUCCESS',
      context: { consentId: consent._id }
    });
    // Log to BankAuditLog as well
    await BankAuditLog.create({
      virtualUserId: consent.virtualUserId,
      partnerId: consent.partnerId,
      action: 'CONSENT_REVOKED',
      purpose: consent.purpose,
      scopes: consent.dataFields,
      timestamp: new Date(),
      status: 'SUCCESS',
      context: { consentId: consent._id, revokeReason },
    });
    // Emit socket.io event to contract room(s)
    try {
      const Contract = require('../models/Contract');
      const contracts = await Contract.find({ consentId: consent._id });
      const io = req.app.get('io');
      if (io && contracts.length > 0) {
        contracts.forEach(contract => {
          io.to(`contract_${contract._id}`).emit('consent_revoked', { contractId: contract._id.toString() });
        });
      }
    } catch (err) {
      console.error('Socket.io emit error:', err);
    }
    res.json({ message: 'Consent revoked', consent });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// View all approved consents (for bank to see what data to send)
exports.viewAllApprovedConsentsForBank = async (req, res) => {
  try {
    const consents = await Consent.find({ status: 'APPROVED' });
    res.json({ consents });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 