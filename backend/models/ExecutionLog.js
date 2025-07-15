const mongoose = require('mongoose');

const executionLogSchema = new mongoose.Schema({
  contractId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  virtualUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'VirtualUser',
    required: true
  },
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  },
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ModelUpload',
    required: true
  },
  modelName: {
    type: String,
    required: true
  },
  mode: {
    type: String,
    enum: ['rawview', 'cleanroom'],
    required: true
  },

  // DP Tracking
  dpApplied: {
    type: Boolean,
    default: false
  },
  dpEpsilon: {
    type: Number,
    default: null
  },
  dpSensitivity: {
    type: Number,
    default: null
  },

  // Output and Execution Status
  output: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  status: {
    type: String,
    enum: ['SUCCESS', 'FAILURE', 'TAMPERED'],
    required: true
  },

  // Behavioral Monitoring Additions
  executionTimeMs: {
    type: Number
  },
  tampered: {
    type: Boolean,
    default: false
  },
  hash: {
    type: String
  },
  canaryFlagValue: {
    type: mongoose.Schema.Types.Mixed // e.g., 99999 or array
  },

  // Purpose Verification
  contractPurpose: {
    type: String
  },
  modelAllowedPurposes: {
    type: [String]
  },
  purposeMismatch: {
    type: Boolean,
    default: false
  },
  
  riskFlags: {
    type: [String], // e.g., ['CANARY_LEAK', 'PURPOSE_MISMATCH']
    default: []
  },
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ExecutionLog', executionLogSchema);
