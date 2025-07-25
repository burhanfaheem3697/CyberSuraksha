const LoanRequest = require('../models/LoanRequest');
const User = require('../models/User');
const VirtualID = require('../models/VirtualID');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');
const UserAuditLog = require('../models/UserAuditLog')
const PartnerAuditLog = require('../models/PartnerAuditLog');

// User creates a loan request
exports.userCreatesLoanRequest = async (req, res) => {
  try {
    const { purpose, partnerId } = req.body;
    const userId = req.user.id; // req.user set by auth middleware
    if (!partnerId) {
      return res.status(400).json({ message: 'partnerId is required to create a loan request.' });
    }
    // Create a new VirtualID for this user and partner
    const newVirtualID = new VirtualID({
      userId,
      partnerId,
      purpose,
    });
    await newVirtualID.save();
    if (!newVirtualID._id) {
      return res.status(500).json({ message: 'Failed to create virtual ID' });
    }
    // Attach to user
    await User.findByIdAndUpdate(userId, { $push: { virtualIds: newVirtualID._id } });
    // Create the loan request
    const loanRequest = new LoanRequest({
      partner_id: partnerId,
      virtualId: newVirtualID._id,
      purpose,
      status: 'PENDING',
    });
    await loanRequest.save();
    // Log the creation
    await AuditLog.create({
      virtualUserId: newVirtualID._id,
      partnerId: partnerId,
      action: 'LOAN_REQUEST_CREATED',
      purpose: purpose,
      scopes: [],
      timestamp: new Date(),
      status: 'SUCCESS',
      context: { loanRequestId: loanRequest._id }
    });
    await UserAuditLog.create({
      virtualUserId: newVirtualID._id,
      action: 'LOAN_REQUEST_CREATED',
      details: {
        partnerId,
        purpose,
        loanRequestId: loanRequest._id
      },
      status: 'SUCCESS',
      context: { loanRequestId: loanRequest._id }
    });
    await PartnerAuditLog.create({
      virtualUserId: newVirtualID._id,
      action: 'LOAN_REQUEST_CREATED',
      details: {
        partnerId,
        purpose,
        loanRequestId: loanRequest._id
      },
      status: 'SUCCESS',
      context: { loanRequestId: loanRequest._id }
    });
    res.status(201).json({ message: 'Loan request created', loanRequest });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// View all loan requests (for this partner)
exports.viewLoanRequests = async (req, res) => {
  try {
    const partnerId = req.partner._id;
    // Find all loan requests associated with this partner's virtual IDs
    const loanRequests = await LoanRequest.find({ 
      partner_id: partnerId })
    res.json({ loanRequests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Partner reviews a loan request (placeholder for review logic)
exports.partnerReviewsLoanRequest = async (req, res) => {
  try {
    const { loanRequestId, status } = req.body; // status: UNDER_REVIEW or APPROVED
    const loanRequest = await LoanRequest.findById(loanRequestId);
    if (!loanRequest) {
      return res.status(404).json({ message: 'Loan request not found' });
    }
    loanRequest.status = status;
    await loanRequest.save();
    // Log the review
    await AuditLog.create({
      virtualUserId: loanRequest.virtualId,
      partnerId: req.partner ? req.partner._id : null,
      action: 'LOAN_REQUEST_REVIEWED',
      purpose: loanRequest.purpose,
      scopes: [],
      timestamp: new Date(),
      status: 'SUCCESS',
      context: { loanRequestId, newStatus: status }
    });
    await UserAuditLog.create({
      virtualUserId: loanRequest.virtualId,
      action: 'LOAN_REQUEST_REVIEWED',
      details: {
        partnerId: req.partner ? req.partner._id : null,
        purpose: loanRequest.purpose,
        loanRequestId,
        newStatus: status
      },
      status: 'SUCCESS',
      context: { loanRequestId, newStatus: status }
    });
    await PartnerAuditLog.create({
      virtualUserId: loanRequest.virtualId,
      action: 'LOAN_REQUEST_REVIEWED',
      details: {
        partnerId: req.partner ? req.partner._id : null,
        purpose: loanRequest.purpose,
        loanRequestId,
        newStatus: status
      },
      status: 'SUCCESS',
      context: { loanRequestId, newStatus: status }
    });
    res.json({ message: 'Loan request status updated', loanRequest });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Status updater (placeholder for scheduled/automated updates)
exports.statusUpdater = async (req, res) => {
  try {
    // Placeholder: In real app, update statuses based on business logic
    res.json({ message: 'Status updater executed (placeholder)' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Partner approves a loan request
exports.partnerApproveLoanRequest = async (req, res) => {
  try {
    const { loanRequestId } = req.body;
    const partnerId = req.partner._id;
    const loanRequest = await LoanRequest.findById(loanRequestId);
    if (!loanRequest) {
      return res.status(404).json({ message: 'Loan request not found' });
    }
    loanRequest.status = 'APPROVED';
    await loanRequest.save();
    // Log the approval
    await AuditLog.create({
      virtualUserId: loanRequest.virtualId,
      partnerId,
      action: 'LOAN_REQUEST_APPROVED',
      purpose: loanRequest.purpose,
      scopes: [],
      timestamp: new Date(),
      status: 'SUCCESS',
      context: { loanRequestId, newStatus: 'APPROVED' }
    });
    await UserAuditLog.create({
      virtualUserId: loanRequest.virtualId,
      action: 'LOAN_REQUEST_APPROVED',
      details: {
        partnerId,
        purpose: loanRequest.purpose,
        loanRequestId,
        newStatus: 'APPROVED'
      },
      status: 'SUCCESS',
      context: { loanRequestId, newStatus: 'APPROVED' }
    });
    await PartnerAuditLog.create({
      virtualUserId: loanRequest.virtualId,
      action: 'LOAN_REQUEST_APPROVED',
      details: {
        partnerId,
        purpose: loanRequest.purpose,
        loanRequestId,
        newStatus: 'APPROVED'
      },
      status: 'SUCCESS',
      context: { loanRequestId, newStatus: 'APPROVED' }
    });
    res.json({ message: 'Loan request approved', loanRequest });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 