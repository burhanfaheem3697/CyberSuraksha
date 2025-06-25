const mongoose = require('mongoose');

const VirtualIDSchema = new mongoose.Schema({
  virtualId: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  purpose: { type: String },
  expiresAt: { type: Date }
});

module.exports = mongoose.model('VirtualID', VirtualIDSchema); 