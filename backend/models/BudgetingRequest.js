const mongoose = require('mongoose');

const BudgetingRequestSchema = new mongoose.Schema({
  partner_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },

  virtualId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VirtualID',
    required: true
  },

  categories: [
    {
      name: {
        type: String,
        required: true
      },
      plannedAmount: {
        type: Number,
        required: true
      }
    }
  ],

  totalPlannedAmount: {
    type: Number,
    required: false // can be calculated from categories, but useful for quick access
  },

  actualSpent: {
    type: Number,
    default: 0
  },

  duration: {
    type: String, // e.g., "monthly", "weekly", "yearly"
    required: true
  },

  purpose: {
    type: String,
    required: true
  },

  notes: {
    type: String
  },

  status: {
    type: String,
    enum: ['PENDING', 'UNDER_REVIEW', 'APPROVED'],
    default: 'PENDING'
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('BudgetingRequest', BudgetingRequestSchema); 