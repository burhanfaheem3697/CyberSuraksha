const mongoose = require('mongoose');

const BankSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  bankCode: {
    type: String,
    unique: true,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  passwordHash: {
    type: String,
    required: true
  },

  branches: [
    {
      branchCode: String,
      location: String
    }
  ],

  supportedDataTypes: {
    type: [String],
    default: ['income', 'transaction_history', 'account_balance']
    // For future-proofing: tax_report, statement_pdf, etc.
  },

  dataAccessLog: [
    {
      consentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Consent' },
      userVirtualId: String,
      timestamp: Date,
      action: String, // e.g., 'data_provided'
      fieldsShared: [String]
    }
  ],

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Bank', BankSchema); 