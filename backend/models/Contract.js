const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  consentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consent', required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  bankId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bank', required: true },
  virtualUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualID', required: true },
  purpose: { type: String, required: true },
  allowedFields: [{ type: String, required: true }],
  retentionDays: { type: Number },
  documents: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true }, // or file reference
      uploadedAt: { type: Date, default: Date.now }
    }
  ],
  status: {
    type: String,
    enum: ['UPLOADED', 'ACCESSED', 'EXPIRED'],
    default: 'UPLOADED'
  },
  data: { type: mongoose.Schema.Types.Mixed },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Contract', contractSchema); 