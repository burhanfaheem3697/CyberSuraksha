const mongoose = require('mongoose');

const PolicyRuleSchema = new mongoose.Schema({
  purpose: { type: String, required: true },
  allowedFields: [{ type: String, required: true }],
  retentionLimitDays: { type: Number },
  geoRestriction: { type: String },
  minTrustScore: { type: Number, default: 0 }
});

module.exports = mongoose.model('PolicyRule', PolicyRuleSchema); 