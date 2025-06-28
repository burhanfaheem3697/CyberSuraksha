const mongoose = require('mongoose');

const ConsentSchema = new mongoose.Schema({
  virtualUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualID', required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  purpose: { type: String, required: true }, // main_category from classifier
  rawPurpose: { type: String }, // free-text from partner
  mainCategory: { type: String }, // from classifier
  subCategory: { type: String }, // from classifier
  justification: { type: String }, // from classifier

  dataFields: [{ type: String, required: true }],
  duration: { type: Number }, // in days

  jurisdiction: { type: String },
  dataResidency: { type: String, enum: ["IN", "EU", "US", "ANY"] },
  crossBorder: { type: Boolean },
  quantumSafe: { type: Boolean },
  anonymization: { type: Boolean },

  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'REVOKED'], default: 'PENDING' },
  approvedAt: { type: Date },
  expiresAt: { type: Date },
  revokedAt: { type: Date },
  revokeReason: { type: String }
});

module.exports = mongoose.model('Consent', ConsentSchema);