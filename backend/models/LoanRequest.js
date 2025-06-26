const mongoose = require('mongoose');

const LoanRequestSchema = new mongoose.Schema({
  partner_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  virtualId: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualID', required: true },
  purpose: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoanRequest', LoanRequestSchema);