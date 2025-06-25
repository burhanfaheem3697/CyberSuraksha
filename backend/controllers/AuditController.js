const AuditLog = require('../models/AuditLog');

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
    const { id } = req.params; // id = virtualUserId
    const logs = await AuditLog.find({ virtualUserId: id }).sort({ timestamp: -1 });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get logs for a specific partner (by partnerId)
exports.getLogsForPartner = async (req, res) => {
  try {
    const { id } = req.params; // id = partnerId
    const logs = await AuditLog.find({ partnerId: id }).sort({ timestamp: -1 });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 