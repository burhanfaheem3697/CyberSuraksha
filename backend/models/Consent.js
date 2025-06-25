const mongoose = require('mongoose');

const ConsentSchema = new mongoose.Schema({
  virtualUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualID', required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  purpose: { type: String, required: true },
  dataFields: [{ type: String, required: true }],
  duration: { type: Number }, // in days or as per business logic
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
  approvedAt: { type: Date },
  expiresAt: { type: Date }
});

module.exports = mongoose.model('Consent', ConsentSchema); 