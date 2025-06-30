const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  date: { type: Date },
  description: { type: String },
  amount: { type: Number },
  type: { type: String },
  category: { type: String }
}, { _id: false });

const accountSchema = new mongoose.Schema({
  account_type: { type: String },
  account_number: { type: String },
  balance: { type: Number },
  currency: { type: String, default: 'INR' },
  transactions: [transactionSchema]
}, { _id: false });

const loanSchema = new mongoose.Schema({
  loan_type: { type: String },
  amount: { type: Number },
  interest_rate: { type: Number },
  tenure: { type: Number },
  emi: { type: Number },
  remaining_amount: { type: Number },
  status: { type: String }
}, { _id: false });

const cardSchema = new mongoose.Schema({
  card_type: { type: String },
  card_number: { type: String },
  expiry: { type: String },
  credit_limit: { type: Number },
  outstanding: { type: Number },
  rewards_points: { type: Number }
}, { _id: false });

const employmentHistorySchema = new mongoose.Schema({
  company: { type: String },
  position: { type: String },
  start_date: { type: Date },
  end_date: { type: Date },
  salary: { type: Number }
}, { _id: false });

const UserBankDataSchema = new mongoose.Schema({
  user_id : {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true
  }, // Primary key, privacy-respecting
  income: { type: Number }, // Monthly/annual income
  credit_score: { type: Number }, // Simulated CIBIL score
  txn_summary: { 
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }, // Aggregated transaction data (JSON)
  accounts: {
    type: [accountSchema],
    default: []
  },
  loans: {
    type: [loanSchema],
    default: []
  },
  cards: {
    type: [cardSchema],
    default: []
  },
  monthly_expenses: {
    type: {
      housing: { type: Number },
      utilities: { type: Number },
      groceries: { type: Number },
      transportation: { type: Number },
      entertainment: { type: Number },
      healthcare: { type: Number },
      miscellaneous: { type: Number }
    },
    default: {}
  },
  savings: {
    type: {
      fixed_deposits: { type: Number },
      recurring_deposits: { type: Number },
      mutual_funds: { type: Number },
      stocks: { type: Number },
      others: { type: Number }
    },
    default: {}
  },
  employer: { type: String }, // Optional field
  employment_history: {
    type: [employmentHistorySchema],
    default: []
  },
  last_updated: { type: Date, default: Date.now } // Useful for expiration
});

module.exports = mongoose.model('UserBankData', UserBankDataSchema); 