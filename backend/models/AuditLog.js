const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  virtualUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualID', required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  action: { type: String, required: true },
  purpose: { type: String },
  scopes: [{ type: String }],
  timestamp: { type: Date, default: Date.now },
  status: { type: String },
  context: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('AuditLog', AuditLogSchema); 