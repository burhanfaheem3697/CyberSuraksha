const Contract = require('../models/Contract');
const BankAuditLog = require('../models/BankAuditLog');
const UserAuditLog = require('../models/UserAuditLog')
const PartnerAuditLog = require('../models/PartnerAuditLog');

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
    const partnerId = req.partner.partnerId;
    if (!partnerId) return res.status(401).json({ message: 'Unauthorized: partnerId missing' });
    const contractsForPartner = await Contract.find({ partnerId }).sort({ createdAt: -1 }).populate('bankId', 'name');
    res.json({ contracts: contractsForPartner });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 