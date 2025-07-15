const mongoose = require('mongoose');

const ConsentDraftSchema = new mongoose.Schema({
  virtualUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualID', required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  purpose: { type: String, required: true }, // main_category from classifier
  rawPurpose: { type: String }, // free-text from partner
  mainCategory: { type: String }, // from classifier
  subCategory: { type: String }, // from classifier
  justification: { type: String }, // from partner or classifier

  dataFields: [{ type: String, required: true }],
  duration: { type: Number }, // in days

  jurisdiction: { type: String },
  dataResidency: { type: String, enum: ["IN", "EU", "US", "ANY"] },
  crossBorder: { type: Boolean },
  quantumSafe: { type: Boolean },
  anonymization: { type: Boolean },
  requiresSensitiveData: { type: Boolean },

  status: { 
    type: String, 
    enum: ['DRAFT', 'RULE_REJECTED', 'LLM_REJECTED', 'VALIDATED', 'FINALIZED'], 
    default: 'DRAFT' 
  },
  rejectionReason: { type: String },
  rejectionSource: { type: String, enum: ['RULE', 'LLM', null] },
  consentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consent' },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ConsentDraft', ConsentDraftSchema);