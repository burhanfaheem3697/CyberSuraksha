const AuditLog = require('../models/AuditLog');
const VirtualID = require('../models/VirtualID')
// Log an action (generic logger)
exports.logAction = async (req, res) => {
  try {
    const { virtualUserId, partnerId, action, purpose, scopes, status, context } = req.body;
    const log = new AuditLog({
      virtualUserId,
      partnerId,
      action,
      purpose,
      scopes,
      timestamp: new Date(),
      status,
      context
    });
    await log.save();
    res.status(201).json({ message: 'Action logged', log });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get logs for a specific user (by virtualUserId)
exports.getLogsForUser = async (req, res) => {
  try {
    const userId = req.user.userId; // from auth middleware
    // 1. Find all virtual IDs for this user
    const virtualIds = await VirtualID.find({ userId }).select('_id');
    const virtualIdList = virtualIds.map(v => v._id);

    // 2. Find all audit logs for these virtual IDs, and populate partnerId with name
    const logs = await AuditLog.find({ virtualUserId: { $in: virtualIdList } })
      .sort({ timestamp: -1 })
      .populate('partnerId', 'name');

    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get logs for the authenticated partner (by partnerId from partnerauth middleware)
exports.getLogsForPartner = async (req, res) => {
  try {
    const partnerId = req.partner.partnerId; // from partnerauth middleware
    const logs = await AuditLog.find({ partnerId: partnerId })
      .sort({ timestamp: -1 })
      .populate('partnerId', 'name');
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 