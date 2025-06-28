const BudgetingRequest = require('../models/BudgetingRequest');
const User = require('../models/User');
const VirtualID = require('../models/VirtualID');
const UserAuditLog = require('../models/UserAuditLog')
const PartnerAuditLog = require('../models/PartnerAuditLog');

// User creates a budgeting request
exports.userCreatesBudgetingRequest = async (req, res) => {
  try {
    const { categories, totalPlannedAmount, duration, purpose, partnerId, notes } = req.body;
    const userId = req.user.userId; // req.user set by auth middleware
    if (!partnerId) {
      return res.status(400).json({ message: 'partnerId is required to create a budgeting request.' });
    }
    // Create a new VirtualID for this user and partner
    const newVirtualID = new VirtualID({
      userId,
      partnerId,
      purpose,
    });
    await newVirtualID.save();
    // Attach to user
    await User.findByIdAndUpdate(userId, { $push: { virtualIds: newVirtualID._id } });
    // Create the budgeting request
    const budgetingRequest = new BudgetingRequest({
      partner_id: partnerId,
      virtualId: newVirtualID._id,
      categories,
      totalPlannedAmount,
      duration,
      purpose,
      notes,
      status: 'PENDING',
    });
    await budgetingRequest.save();
    // Log the creation
    await UserAuditLog.create({
      virtualUserId: newVirtualID._id,
      action: 'BUDGETING_REQUEST_CREATED',
      details: {
        partnerId,
        purpose,
        budgetingRequestId: budgetingRequest._id
      },
      status: 'SUCCESS',
      context: { budgetingRequestId: budgetingRequest._id }
    });
    await PartnerAuditLog.create({
      virtualUserId: newVirtualID._id,
      action: 'BUDGETING_REQUEST_CREATED',
      details: {
        partnerId,
        purpose,
        budgetingRequestId: budgetingRequest._id
      },
      status: 'SUCCESS',
      context: { budgetingRequestId: budgetingRequest._id }
    });
    res.status(201).json({ message: 'Budgeting request created', budgetingRequest });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// View all budgeting requests (for this partner)
exports.viewBudgetingRequests = async (req, res) => {
  try {
    const partnerId = req.partner.partnerId;
    const budgetingRequests = await BudgetingRequest.find({ partner_id: partnerId });
    res.json({ budgetingRequests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Partner reviews a budgeting request
exports.partnerReviewsBudgetingRequest = async (req, res) => {
  try {
    const { budgetingRequestId, status } = req.body; // status: UNDER_REVIEW or APPROVED
    const budgetingRequest = await BudgetingRequest.findById(budgetingRequestId);
    if (!budgetingRequest) {
      return res.status(404).json({ message: 'Budgeting request not found' });
    }
    budgetingRequest.status = status;
    await budgetingRequest.save();
    // Log the review
    await UserAuditLog.create({
      virtualUserId: budgetingRequest.virtualId,
      action: 'BUDGETING_REQUEST_REVIEWED',
      details: {
        partnerId: req.partner ? req.partner._id : null,
        purpose: budgetingRequest.purpose,
        budgetingRequestId,
        newStatus: status
      },
      status: 'SUCCESS',
      context: { budgetingRequestId, newStatus: status }
    });
    await PartnerAuditLog.create({
      virtualUserId: budgetingRequest.virtualId,
      action: 'BUDGETING_REQUEST_REVIEWED',
      details: {
        partnerId: req.partner ? req.partner._id : null,
        purpose: budgetingRequest.purpose,
        budgetingRequestId,
        newStatus: status
      },
      status: 'SUCCESS',
      context: { budgetingRequestId, newStatus: status }
    });
    res.json({ message: 'Budgeting request status updated', budgetingRequest });
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

// Partner approves a budgeting request
exports.partnerApproveBudgetingRequest = async (req, res) => {
  try {
    const { budgetingRequestId } = req.body;
    const partnerId = req.partner.partnerId;
    const budgetingRequest = await BudgetingRequest.findById(budgetingRequestId);
    if (!budgetingRequest) {
      return res.status(404).json({ message: 'Budgeting request not found' });
    }
    budgetingRequest.status = 'APPROVED';
    await budgetingRequest.save();
    // Log the approval
    await UserAuditLog.create({
      virtualUserId: budgetingRequest.virtualId,
      action: 'BUDGETING_REQUEST_APPROVED',
      details: {
        partnerId,
        purpose: budgetingRequest.purpose,
        budgetingRequestId,
        newStatus: 'APPROVED'
      },
      status: 'SUCCESS',
      context: { budgetingRequestId, newStatus: 'APPROVED' }
    });
    await PartnerAuditLog.create({
      virtualUserId: budgetingRequest.virtualId,
      action: 'BUDGETING_REQUEST_APPROVED',
      details: {
        partnerId,
        purpose: budgetingRequest.purpose,
        budgetingRequestId,
        newStatus: 'APPROVED'
      },
      status: 'SUCCESS',
      context: { budgetingRequestId, newStatus: 'APPROVED' }
    });
    res.json({ message: 'Budgeting request approved', budgetingRequest });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 