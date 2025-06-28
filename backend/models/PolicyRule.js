const mongoose = require('mongoose');

const PolicyRuleSchema = new mongoose.Schema({
  purpose: { type: String, required: true },

  jurisdiction: [{ type: String }],
  regulatoryRefs: [{ type: String }],

  allowedFields: [{ type: String }],
  deniedFields: [{ type: String }],

  retentionDays: { type: Number, default: 7 },
  minTrustScore: { type: Number, default: 6.0 },
  crossBorderAllowed: { type: Boolean, default: false },
  dataResidency: { type: String, enum: ["IN", "EU", "US", "ANY"], default: "IN" },

  consentRequired: { type: Boolean, default: true },
  userRevocable: { type: Boolean, default: true },

  quantumSafeRequired: { type: Boolean, default: false },
  anonymizationRequired: { type: Boolean, default: false },

  metadata: {
    explanation: { type: String },
    piiSensitivity: { type: String, enum: ["LOW", "MEDIUM", "HIGH"], default: "MEDIUM" },
    storageType: { type: String, enum: ["ENCRYPTED", "HASHED", "TOKENIZED"], default: "ENCRYPTED" },
    sandboxed: { type: Boolean, default: false },
  },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('PolicyRule', PolicyRuleSchema); 