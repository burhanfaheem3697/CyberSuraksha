const mongoose = require('mongoose');

const PolicyRuleSchema = new mongoose.Schema({
  purpose: { type: String, required: true },
  allowedFields: [{ type: String, required: true }],
  deniedFields: [{ type: String }],
  retentionDays: { type: Number },
  geoRestriction: { type: String },
  minTrustScore: { type: Number, default: 0 },
  allowedHours: {
    start: { type: Number },
    end: { type: Number }
  }
});

module.exports = mongoose.model('PolicyRule', PolicyRuleSchema); 