const mongoose = require('mongoose');

const UserBankDataSchema = new mongoose.Schema({
  virtual_id: { type: String, unique: true, required: true }, // Primary key, privacy-respecting
  income: { type: Number }, // Monthly/annual income
  credit_score: { type: Number }, // Simulated CIBIL score
  txn_summary: { type: Object }, // Aggregated transaction data (JSON)
  employer: { type: String }, // Optional field
  last_updated: { type: Date, default: Date.now } // Useful for expiration
});

module.exports = mongoose.model('UserBankData', UserBankDataSchema); 