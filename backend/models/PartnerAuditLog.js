const mongoose = require('mongoose');

const PartnerAuditLogSchema = new mongoose.Schema({
  virtualUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualID', required: true },
  action: { type: String, required: true },
  details: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: Date, default: Date.now },
  status: { type: String, enum: ['SUCCESS', 'FAIL', 'INFO', 'REJECTED'], default: 'INFO' },
  context: { type: mongoose.Schema.Types.Mixed },
});

module.exports = mongoose.model('PartnerAuditLog', PartnerAuditLogSchema); 