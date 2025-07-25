const Contract = require('../models/Contract');
const BankAuditLog = require('../models/BankAuditLog');
const UserAuditLog = require('../models/UserAuditLog')
const PartnerAuditLog = require('../models/PartnerAuditLog');
const AuditLog = require('../models/AuditLog')
// Create a new contract entry
exports.createContract = async (req, res) => {
  const bankId = req.bank.bankId
  try {
    const { consentId,partnerId, virtualUserId, purpose, allowedFields, retentionDays, documents } = req.body;
    if (!consentId || !partnerId || !virtualUserId || !purpose || !allowedFields) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const contract = new Contract({
      consentId,
      partnerId,
      bankId,
      virtualUserId,
      purpose,
      allowedFields,
      retentionDays,
      documents: documents || [],
      data: req.body.data || undefined,
    });
    await contract.save();
    // Log to BankAuditLog
    await BankAuditLog.create({
      virtualUserId: virtualUserId,
      partnerId,
      action: 'CONTRACT_CREATED',
      purpose: purpose,
      scopes: allowedFields,
      timestamp: new Date(),
      status: 'SUCCESS',
      context: { contractId: contract._id }
    });
    // Log to normal AuditLog for users
    await AuditLog.create({
      virtualUserId: virtualUserId,
      partnerId,
      action: 'CONTRACT_CREATED',
      purpose: purpose,
      scopes: allowedFields,
      timestamp: new Date(),
      status: 'SUCCESS',
      context: { contractId: contract._id }
    });
    await UserAuditLog.create({
      virtualUserId,
      action: 'CONTRACT_CREATED',
      details: {
        partnerId,
        purpose,
        allowedFields,
        retentionDays,
        contractId: contract._id
      },
      status: 'SUCCESS',
      context: { contractId: contract._id }
    });
    await PartnerAuditLog.create({
      virtualUserId,
      action: 'CONTRACT_CREATED',
      details: {
        partnerId,
        purpose,
        allowedFields,
        retentionDays,
        contractId: contract._id
      },
      status: 'SUCCESS',
      context: { contractId: contract._id }
    });
    res.status(201).json({ message: 'Contract created successfully', contract });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// View all contracts for the authenticated bank
exports.viewAllContractsForBank = async (req, res) => {
  try {
    const bankId = req.bank.bankId;
    if (!bankId) return res.status(401).json({ message: 'Unauthorized: bankId missing' });
    const contractsForBank = await Contract.find({ bankId }).sort({ createdAt: -1 }).populate('bankId', 'name');
    res.json({ contracts: contractsForBank });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// View all contracts for the authenticated partner
exports.viewAllContractsForPartner = async (req, res) => {
  try {
    const partnerId = req.partner._id; 
    if (!partnerId) return res.status(401).json({ message: 'Unauthorized: partnerId missing' });
    const contractsForPartner = await Contract.find({ partnerId }).sort({ createdAt: -1 }).populate('bankId', 'name');
    res.json({ contracts: contractsForPartner });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// View all contracts for the authenticated user
exports.viewAllContractsForUser = async (req, res) => {
  try {
    const userId = req.user.id; // req.user is set by auth middleware
    // Fetch the user's virtualIds from the User model
    const user = await require('../models/User').findById(userId).select('virtualIds');
    if (!user) {
      return res.status(404).json({ message: `User not found ${userId}` });
    }
    const contractsForUser = await Contract.find({ virtualUserId: { $in: user.virtualIds } })
      .sort({ createdAt: -1 })
      .populate('bankId', 'name');
    res.json({ contracts: contractsForUser });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 