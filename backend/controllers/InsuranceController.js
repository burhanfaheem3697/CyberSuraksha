const InsuranceRequest = require('../models/InsuranceRequest');
const User = require('../models/User');
const VirtualID = require('../models/VirtualID');
const AuditLog = require('../models/AuditLog');

// User creates an insurance request
exports.userCreatesInsuranceRequest = async (req, res) => {
  try {
    const { insuranceType, coverageAmount, tenureYears, purpose, partnerId } = req.body;
    const userId = req.user.userId; // req.user set by auth middleware
    if (!partnerId) {
      return res.status(400).json({ message: 'partnerId is required to create an insurance request.' });
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
    // Create the insurance request
    const insuranceRequest = new InsuranceRequest({
      partner_id: partnerId,
      virtualId: newVirtualID._id,
      insuranceType,
      coverageAmount,
      tenureYears,
      purpose,
      status: 'PENDING',
    });
    await insuranceRequest.save();
    // Log the creation
    await AuditLog.create({
      virtualUserId: newVirtualID._id,
      partnerId: partnerId,
      action: 'INSURANCE_REQUEST_CREATED',
      purpose: purpose,
      scopes: [],
      timestamp: new Date(),
      status: 'SUCCESS',
      context: { insuranceRequestId: insuranceRequest._id }
    });
    res.status(201).json({ message: 'Insurance request created', insuranceRequest });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// View all insurance requests (for this partner)
exports.viewInsuranceRequests = async (req, res) => {
  try {
    const partnerId = req.partner.partnerId;
    const insuranceRequests = await InsuranceRequest.find({ partner_id: partnerId });
    res.json({ insuranceRequests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Partner reviews an insurance request
exports.partnerReviewsInsuranceRequest = async (req, res) => {
  try {
    const { insuranceRequestId, status } = req.body; // status: UNDER_REVIEW or APPROVED
    const insuranceRequest = await InsuranceRequest.findById(insuranceRequestId);
    if (!insuranceRequest) {
      return res.status(404).json({ message: 'Insurance request not found' });
    }
    insuranceRequest.status = status;
    await insuranceRequest.save();
    // Log the review
    await AuditLog.create({
      virtualUserId: insuranceRequest.virtualId,
      partnerId: req.partner ? req.partner._id : null,
      action: 'INSURANCE_REQUEST_REVIEWED',
      purpose: insuranceRequest.purpose,
      scopes: [],
      timestamp: new Date(),
      status: 'SUCCESS',
      context: { insuranceRequestId, newStatus: status }
    });
    res.json({ message: 'Insurance request status updated', insuranceRequest });
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

// Partner approves an insurance request
exports.partnerApproveInsuranceRequest = async (req, res) => {
  try {
    const { insuranceRequestId } = req.body;
    const partnerId = req.partner.partnerId;
    const insuranceRequest = await InsuranceRequest.findById(insuranceRequestId);
    if (!insuranceRequest) {
      return res.status(404).json({ message: 'Insurance request not found' });
    }
    insuranceRequest.status = 'APPROVED';
    await insuranceRequest.save();
    // Log the approval
    await AuditLog.create({
      virtualUserId: insuranceRequest.virtualId,
      partnerId,
      action: 'INSURANCE_REQUEST_APPROVED',
      purpose: insuranceRequest.purpose,
      scopes: [],
      timestamp: new Date(),
      status: 'SUCCESS',
      context: { insuranceRequestId, newStatus: 'APPROVED' }
    });
    res.json({ message: 'Insurance request approved', insuranceRequest });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 