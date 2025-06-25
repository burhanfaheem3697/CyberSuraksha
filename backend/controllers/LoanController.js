const LoanRequest = require('../models/LoanRequest');
const User = require('../models/User');
const VirtualID = require('../models/VirtualID');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');

// User creates a loan request
exports.userCreatesLoanRequest = async (req, res) => {
  try {
    const { purpose, partnerId } = req.body;
    const userId = req.user.userId; // req.user set by auth middleware
    if (!partnerId) {
      return res.status(400).json({ message: 'partnerId is required to create a loan request.' });
    }
    // Create a new VirtualID for this user and partner
    const virtualIdString = 'VID-' + crypto.randomBytes(6).toString('hex');
    const newVirtualID = new VirtualID({
      virtualId: virtualIdString,
      userId,
      partnerId,
      purpose,
    });
    await newVirtualID.save();
    // Attach to user
    await User.findByIdAndUpdate(userId, { $push: { virtualIds: newVirtualID._id } });
    // Create the loan request
    const loanRequest = new LoanRequest({
      userId,
      virtualId: newVirtualID._id,
      purpose,
      status: 'PENDING',
    });
    await loanRequest.save();
    res.status(201).json({ message: 'Loan request created', loanRequest });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Partner reviews a loan request (placeholder for review logic)
exports.partnerReviewsLoanRequest = async (req, res) => {
  try {
    const { loanRequestId, status } = req.body; // status: UNDER_REVIEW or COMPLETED
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