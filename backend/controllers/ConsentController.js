const Consent = require('../models/Consent');
const PolicyRule = require('../models/PolicyRule');
const AuditLog = require('../models/AuditLog');
const User = require('../models/User')
const BankAuditLog = require('../models/BankAuditLog');
const Partner = require('../models/Partner');
const { evaluateConsentRequest } = require('../../aiService/decisionEngine');
const { classifyPurpose } = require('../../aiService/llmPurposeClassifier');
const UserAuditLog = require('../models/UserAuditLog')
const { logConsentOnChain } = require("../utils/blockchainService");
const { registerDataHash, verifyDataHash } = require('../services/blockchainService');
const PartnerAuditLog = require('../models/PartnerAuditLog');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../blockChain/.env') });
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });

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
    console.log(aiRequest);
    // Run AI validation
    const aiResult = await evaluateConsentRequest(aiRequest);
    console.log(aiResult);
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
      console.log("User Audit Log created");
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
      console.log("Partner Audit Log created");

      return res.status(403).json({
        status: "REJECTED",
        source: aiResult.source,
        reason: aiResult.reason,
        main_category,
        sub_category: classification.sub_category,
        justification: classification.justification
      });
    }
    console.log("Consent Approved");
    // If approved, save consent
    const consent = new Consent({
      virtualUserId,
      partnerId,
      purpose: main_category,
      dataFields,
      duration,
      status: 'PENDING',
    });
    console.log("Consent Created");

    // try {
    //   const txHash = await logConsentOnChain(partnerId, main_category);
    //   consent.txHash = txHash;
    //   console.log("Blockchain transaction initiated:", txHash);
    // } catch (blockchainError) {
    //   console.error("Blockchain error:", blockchainError);
    //   // Continue without blockchain if there's an error
    //   consent.txHash = "blockchain-error";
    // }
    
    // Save consent after blockchain attempt
    await consent.save();
    console.log("Consent saved to database");
    
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
    
    // Create response with blockchain information
    // const explorerBaseUrl = process.env.EXPLORER_BASE_URL || "https://www.oklink.com/amoy/tx/";
    // const blockchainData = consent.txHash && !consent.txHash.startsWith('blockchain-') 
    //   ? {
    //       txHash: consent.txHash,
    //       explorerUrl: `${explorerBaseUrl}${consent.txHash}`,
    //       status: 'confirmed'
    //     } 
    //   : {
    //       status: consent.txHash ? 'error' : 'pending',
    //       txHash: consent.txHash || null,
    //       explorerUrl: null
    //     };
    res.status(201).json({ 
      message: 'Consent request created', 
      consent, 
      main_category, 
      sub_category: classification.sub_category, 
      justification: classification.justification
    });
  } catch (err) {
    console.error("Error in createConsentRequest:", err);
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
    const userId = req.user.id; // req.user is set by auth middleware
    // Fetch the user's virtualIds from the User model
    const user = await User.findById(userId).select('virtualIds');

    if (!user) {
      return res.status(404).json({ message: `User not found ${userId}` });
    }
    const consents = await Consent.find({ virtualUserId: { $in: user.virtualIds } })
      .populate('partnerId', 'name email');
    
    // Add blockchain explorer URLs for all consents
    const explorerBaseUrl = process.env.EXPLORER_BASE_URL || "https://www.oklink.com/amoy/tx/";
    const enrichedConsents = consents.map(consent => {
      const consentObj = consent.toObject();
      if (consentObj.txHash) {
        consentObj.blockchain = {
          txHash: consentObj.txHash,
          explorerUrl: !consentObj.txHash.startsWith('blockchain-') ? `${explorerBaseUrl}${consentObj.txHash}` : null,
          status: consentObj.txHash.startsWith('blockchain-') ? 'error' : 'confirmed'
        };
      }
      return consentObj;
    });
    
    res.json({ consents: enrichedConsents });
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

    // Canonicalize the structured data to be shared
    const structuredData = {
      virtualUserId: consent.virtualUserId.toString(),
      partnerId: consent.partnerId.toString(),
      purpose: consent.purpose,
      dataFields: consent.dataFields,
      duration: consent.duration,
      dataResidency: consent.dataResidency,
      crossBorder: consent.crossBorder,
      quantumSafe: consent.quantumSafe,
      anonymization: consent.anonymization,
      approvedAt: consent.approvedAt,
    };

    // Hash and register on-chain
    try {
      const { hash, txHash } = await registerDataHash(structuredData);
      consent.documentHash = hash;
      consent.documentTxHash = txHash;
    } catch (err) {
      console.error('Error registering document hash on-chain:', err);
      consent.documentHash = null;
      consent.documentTxHash = null;
    }

    // Log consent to blockchain (legacy txHash for ConsentRegistry)
    try {
      const txHash = await logConsentOnChain(consent.partnerId.toString(), consent.purpose);
      consent.txHash = txHash;
    } catch (err) {
      console.error('Blockchain error:', err);
      // Continue even if blockchain fails
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
      context: { consentId: consent._id, txHash: consent.txHash, documentHash: consent.documentHash, documentTxHash: consent.documentTxHash }
    });
    await UserAuditLog.create({
      virtualUserId: consent.virtualUserId,
      action: 'CONSENT_APPROVED',
      details: {
        partnerId: consent.partnerId,
        purpose: consent.purpose,
        dataFields: consent.dataFields,
        approvedAt: consent.approvedAt,
        txHash: consent.txHash,
        documentHash: consent.documentHash,
        documentTxHash: consent.documentTxHash
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
        txHash: consent.txHash,
        documentHash: consent.documentHash,
        documentTxHash: consent.documentTxHash
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
      context: { consentId: consent._id, txHash: consent.txHash, documentHash: consent.documentHash, documentTxHash: consent.documentTxHash }
    });

    // Return txHash and blockchain explorer URL in the response
    const explorerBaseUrl = process.env.EXPLORER_BASE_URL || "https://www.oklink.com/amoy/tx/";

    res.json({
      message: 'Consent approved',
      consent,
      blockchain: {
        txHash: consent.txHash,
        explorerUrl: consent.txHash && !consent.txHash.startsWith('blockchain-') ? `${explorerBaseUrl}${consent.txHash}` : null,
        status: consent.txHash ? (consent.txHash.startsWith('blockchain-') ? 'error' : 'confirmed') : 'pending',
        documentHash: consent.documentHash,
        documentTxHash: consent.documentTxHash,
        documentExplorerUrl: consent.documentTxHash ? `${explorerBaseUrl}${consent.documentTxHash}` : null
      }
    });
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

// Verify consent on blockchain
exports.verifyConsentOnBlockchain = async (req, res) => {
  try {
    const { txHash } = req.params;
    
    if (!txHash || txHash.startsWith('blockchain-')) {
      return res.status(400).json({ 
        verified: false, 
        message: 'Invalid transaction hash' 
      });
    }
    
    // In a real app, you would verify the transaction on the blockchain here
    // For now, we'll just check if we have a record with this txHash
    const consent = await Consent.findOne({ txHash })
      .populate('partnerId', 'name');
      
    if (!consent) {
      return res.status(404).json({
        verified: false,
        message: 'No consent record found with this transaction hash'
      });
    }
    
    // Return verification info
    const explorerBaseUrl = process.env.EXPLORER_BASE_URL || "https://www.oklink.com/amoy/tx/";
    
    res.json({
      verified: true,
      message: 'Consent verified on blockchain',
      consent: {
        purpose: consent.purpose,
        partnerName: consent.partnerId?.name || 'Unknown Partner',
        status: consent.status,
        timestamp: consent.approvedAt,
        expiresAt: consent.expiresAt
      },
      blockchain: {
        txHash,
        explorerUrl: `${explorerBaseUrl}${txHash}`,
        network: process.env.BLOCKCHAIN_NETWORK || 'Amoy Testnet'
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 