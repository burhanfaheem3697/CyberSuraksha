const PartnerAuditLog = require('../models/PartnerAuditLog');
const Partner = require('../models/Partner');


// GET /partnerauditlog/my (requires partner auth)
exports.getLogsForPartner = async (req, res) => {
  try {
    const partnerId = req.partner.partnerId;
    // Find all logs where details.partnerId matches this partner
    const logs = await PartnerAuditLog.find({ 'details.partnerId': partnerId }).sort({ timestamp: -1 });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 