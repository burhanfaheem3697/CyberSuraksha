const UserAuditLog = require('../models/UserAuditLog');
const User = require('../models/User');



// GET /userauditlog/my (requires user auth)
exports.getLogsForUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    // Find all virtual IDs for this user
    const user = await User.findById(userId).select('virtualIds');
    if (!user) return res.status(404).json({ message: 'User not found' });
    const logs = await UserAuditLog.find({ virtualUserId: { $in: user.virtualIds } }).sort({ timestamp: -1 });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 