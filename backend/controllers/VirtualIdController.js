const VirtualID = require('../models/VirtualID');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const crypto = require('crypto');

// Issue a new virtual ID for a consent
exports.issueVirtualIdForConsent = async (req, res) => {
  try {
    const { userId, partnerId, purpose, expiresAt } = req.body;
    // Generate a unique virtual ID
    const virtualId = 'VID-' + crypto.randomBytes(6).toString('hex');
    const newVirtualID = new VirtualID({
      virtualId,
      userId,
      partnerId,
      purpose,
      expiresAt
    });
    await newVirtualID.save();
    // Attach to user
    await User.findByIdAndUpdate(userId, { $push: { virtualIds: newVirtualID._id } });
    // Log the issuance
    await AuditLog.create({
      virtualUserId: newVirtualID._id,
      partnerId,
      action: 'VIRTUAL_ID_ISSUED',
      purpose,
      scopes: [],
      timestamp: new Date(),
      status: 'SUCCESS',
      context: { virtualId }
    });
    res.status(201).json({ message: 'Virtual ID issued', virtualId: newVirtualID });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Rotate or revoke a virtual ID (placeholder for logic)
exports.rotateOrRevokeId = async (req, res) => {
  try {
    const { virtualId, action } = req.body; // action: 'ROTATE' or 'REVOKE'
    // Placeholder: In real app, implement rotation/revocation logic
    res.json({ message: `Virtual ID ${action === 'ROTATE' ? 'rotated' : 'revoked'} (placeholder)` });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 