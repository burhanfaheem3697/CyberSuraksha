const UserBankData = require('../models/UserBankData');
const AuditLog = require('../models/AuditLog');
const Consent = require('../models/Consent');
const VirtualID = require('../models/VirtualID'); // ✅ Add this line
const Contract = require('../models/Contract');
const jwt = require('jsonwebtoken');
const { Types } = require('mongoose');
const { logDataRoomAccess, logDataRoomInteraction } = require('../utils/auditLogger');
const { maskFields } = require('../utils/fieldMasker');

exports.getDataRoom = async (req, res) => {
  try {
    const { virtualId, allowedFields } = req;
    const { contractId } = req.params;

    // Extract partnerId from token
    let partnerId = null;
    const token = req.cookies && req.cookies.partnerToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        partnerId = decoded.id || decoded.partnerId;
      } catch (err) {
        console.error('[getDataRoom] JWT verification failed:', err);
      }
    }

    

    if (!virtualId) {
      console.error('[getDataRoom] virtualId missing in request');
      return res.status(400).json({ error: 'virtualId missing in request' });
    }

    let objectId;
    if (req.virtualId instanceof Types.ObjectId) {
      objectId = req.virtualId;
    } else {
      try {
        objectId = new Types.ObjectId(req.virtualId);
      } catch (e) {
        console.error('[getDataRoom] Invalid virtualId format:', req.virtualId, e);
        return res.status(400).json({ error: 'Invalid virtualId format', details: e.message });
      }
    }

    let bankData;
try {
  const virtual = await VirtualID.findById(objectId).lean();
  if (!virtual || !virtual.userId) {
    console.warn('[getDataRoom] No virtual ID entry or missing userId');
    return res.status(404).json({ error: 'Invalid virtual ID or user not found' });
  }

  bankData = await UserBankData.findOne({ user_id: virtual.userId }).lean();
} catch (dbErr) {
  console.error('[getDataRoom] DB error while fetching UserBankData:', dbErr);
  return res.status(500).json({ error: 'Database error', details: dbErr.message });
}

    if (!bankData) {
      console.warn(`[getDataRoom] Bank data not found for user_id: ${virtualId}`);
      return res.status(404).json({ error: `Bank data not found for user_id: ${virtualId}` });
    }

    // Filter only allowed fields
    const filtered = {};
    allowedFields.forEach(field => {
      if (bankData.hasOwnProperty(field)) {
        filtered[field] = bankData[field];
      }
    });

    // Use the proper masking utility
    const fieldsToMask = [
      'income',
      'credit_score',
      'txn_summary',
      'employer',
      'last_updated'
    ];
    const masked = maskFields(filtered, fieldsToMask);

    // Consent metadata
    let expiresIn = null;
    let revoked = false;
    if (req.contract && req.contract.consentId) {
      try {
        const consent = await Consent.findById(req.contract.consentId).lean();
        if (consent) {
          expiresIn = consent.expiresAt ? new Date(consent.expiresAt).getTime() - Date.now() : null;
          revoked = consent.status === 'REVOKED';
        }
      } catch (consentErr) {
        console.error('[getDataRoom] Error fetching consent:', consentErr);
      }
    }

    res.json({ 
      data: masked, 
      consent: { expiresIn, revoked },
      contract: req.contract 
    });

    // Audit log
    await logDataRoomAccess(partnerId, objectId, contractId, masked, Date.now());
    
    // Log data room entry
    await logDataRoomInteraction(partnerId, objectId, contractId, 'ENTERED_DATA_ROOM', {
      description: 'Partner entered the data room',
      dataFields: Object.keys(masked)
    }, Date.now());
  } catch (err) {
    console.error('[getDataRoom] Unexpected error:', err);
    res.status(500).json({ error: 'Error fetching data room data', details: err.message });
  }
};

// New function to log user interactions
exports.logInteraction = async (req, res) => {
  try {
    const { action, details } = req.body;
    const { contractId } = req.params;
    
    // Extract partnerId from token
    let partnerId = null;
    const token = req.cookies && req.cookies.partnerToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        partnerId = decoded.id || decoded.partnerId;
      } catch (err) {
        console.error('[logInteraction] JWT verification failed:', err);
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    if (!partnerId) {
      return res.status(401).json({ error: 'Partner ID not found' });
    }

    // Get virtualId from contract
    const contract = await Contract.findById(contractId).lean();
    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    const virtualId = contract.virtualUserId;

    // Log the interaction
    await logDataRoomInteraction(partnerId, virtualId, contractId, action, details, Date.now());

    res.json({ message: 'Interaction logged successfully' });
  } catch (err) {
    console.error('[logInteraction] Error:', err);
    res.status(500).json({ error: 'Error logging interaction', details: err.message });
  }
};

// New function to get detailed interaction logs
exports.getInteractionLogs = async (req, res) => {
  try {
    const { contractId } = req.params;
    
    // Extract partnerId from token
    let partnerId = null;
    const token = req.cookies && req.cookies.partnerToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        partnerId = decoded.id || decoded.partnerId;
      } catch (err) {
        console.error('[getInteractionLogs] JWT verification failed:', err);
        return res.status(401).json({ error: 'Unauthorized' });
      }
    }

    if (!partnerId) {
      return res.status(401).json({ error: 'Partner ID not found' });
    }

    // Convert IDs to ObjectId type using 'new'
    const partnerObjectId = new Types.ObjectId(partnerId);
    const contractObjectId = new Types.ObjectId(contractId);

    // Get all logs for this contract and partner
    const logs = await AuditLog.find({
      partnerId: partnerObjectId,
      'context.contractId': contractObjectId
    })
    .sort({ timestamp: -1 })
    .limit(20); // Get last 20 interactions

    res.json({ logs });
  } catch (err) {
    console.error('[getInteractionLogs] Error:', err);
    res.status(500).json({ error: 'Error fetching interaction logs', details: err.message });
  }
}; 