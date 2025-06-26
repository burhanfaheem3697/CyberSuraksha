const mongoose = require('mongoose');

const InsuranceRequestSchema = new mongoose.Schema({
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

  insuranceType: {
    type: String,
    enum: ['HEALTH', 'LIFE', 'CAR', 'TRAVEL', 'HOME'],
    required: true
  },

  coverageAmount: {
    type: Number,
    required: true
  },

  tenureYears: {
    type: Number,
    required: true
  },

  purpose: {
    type: String,
    required: true
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

module.exports = mongoose.model('InsuranceRequest', InsuranceRequestSchema); 