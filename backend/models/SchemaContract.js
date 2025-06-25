const mongoose = require('mongoose');

const SchemaContractSchema = new mongoose.Schema({
  partnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Partner', required: true },
  purpose: { type: String, required: true },
  allowedFields: [{ type: String, required: true }],
  retentionDays: { type: Number }
});

module.exports = mongoose.model('SchemaContract', SchemaContractSchema); 