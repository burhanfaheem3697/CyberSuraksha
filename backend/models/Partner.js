const mongoose = require('mongoose');

const PartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  trustScore: { type: Number, default: 0 },
  purpose: { type: String },
  email: { type: String, required: true, unique: true },
  apiKey: { type: String, required: true, unique: true },
  password : {type : String,required : true},
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Partner', PartnerSchema); 