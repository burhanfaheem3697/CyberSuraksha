const mongoose = require('mongoose');

const UserBankDataSchema = new mongoose.Schema({
  user_id : {
    type: mongoose.Types.ObjectId, 
    ref: "User",
    required: true
  }, // Primary key, privacy-respecting
  income: { type: Number }, // Monthly/annual income
  credit_score: { type: Number }, // Simulated CIBIL score
  txn_summary: { 
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }, // Aggregated transaction data (JSON)
  employer: { type: String }, // Optional field
  last_updated: { type: Date, default: Date.now } // Useful for expiration
});

module.exports = mongoose.model('UserBankData', UserBankDataSchema); 