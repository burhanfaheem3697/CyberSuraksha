const mongoose = require('mongoose');

const TokenStoreSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  virtualUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'VirtualID', required: true },
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  scopes: [{ type: String }],
  status: { type: String, enum: ['ACTIVE', 'REVOKED', 'EXPIRED'], default: 'ACTIVE' },
  expiresAt: { type: Date }
});

module.exports = mongoose.model('TokenStore', TokenStoreSchema); 