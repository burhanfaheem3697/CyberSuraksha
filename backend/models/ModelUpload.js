const mongoose = require('mongoose');

// Schema to store uploaded ML models for Clean Room execution
const modelUploadSchema = new mongoose.Schema({
  partnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Partner',
    required: true
  }, // The partner who uploaded this model

  modelName: {
    type: String,
    required: true
  }, // Logical name or purpose of the model (e.g., "Loan Scoring Model v2")

  modelFile: {
    type: String,
    required: true
  }, // Local file path or filename of the uploaded ONNX/PKL model

  modelFormat: {
    type: String,
    enum: ['onnx', 'pkl', 'js', 'other'],
    default: 'onnx'
  }, // Type of model uploaded (used for sandboxed execution environment setup)

  inputSchema: {
    type: Map,
    of: [Number],  // e.g., "income" → [1,1]
    default: {}
  },


  inputSpec: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }, // Optional: JSON structure describing expected input fields (e.g., shape, types)

  outputSpec: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }, // Optional: JSON structure describing expected output format (e.g., label, score)

  allowedPurposes: {
    type: [String],
    default: []
  }, // Optional: Declared purposes this model may be used for (validated during execution)

  description: {
    type: String
  }, // Optional: Textual description of what the model does (shown in UI)

  dpCompliant: {
    type: Boolean,
    default: false
  }, // Whether this model natively supports differential privacy

  uploadedAt: {
    type: Date,
    default: Date.now
  } // Timestamp of model upload (used for expiration or version tracking)
});

module.exports = mongoose.model('ModelUpload', modelUploadSchema);
