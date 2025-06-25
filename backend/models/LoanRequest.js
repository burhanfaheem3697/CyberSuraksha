const mongoose = require('mongoose');

const LoanRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  virtualId: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualID', required: true },
  purpose: { type: String, required: true },
  status: { type: String, enum: ['PENDING', 'UNDER_REVIEW', 'COMPLETED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LoanRequest', LoanRequestSchema);