const BankAuditLog = require('../models/BankAuditLog');

// Get all bank audit logs
exports.getAllLogs = async (req, res) => {
  try {
    const logs = await BankAuditLog.find().sort({ timestamp: -1 });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
