const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./connectDB');
const PolicyRule = require('./models/PolicyRule');
const rules = [
  {
    purpose: "loan",
    jurisdiction: ["IN"],
    regulatoryRefs: ["DPDP-Section-7", "RBI-IT-2.1"],
    allowedFields: ["income", "credit_score","loans"],
    deniedFields: ["aadhaar_number", "biometric_data"],
    retentionDays: 7,
    minTrustScore: 7.5,
    crossBorderAllowed: false,
    dataResidency: "IN",
    consentRequired: true,
    userRevocable: true,
    quantumSafeRequired: true,
    anonymizationRequired: false,
    metadata: {
      explanation: "Only non-sensitive financial data is required to evaluate creditworthiness for loan issuance.",
      piiSensitivity: "HIGH",
      storageType: "ENCRYPTED",
      sandboxed: true, 
    },
  },
  {
    purpose: "insurance",
    jurisdiction: ["IN", "EU"],
    regulatoryRefs: ["DPDP-Section-8", "GDPR-Article-6", "SEBI-Guidelines-3.4"],
    allowedFields: ["age", "income", "medical_history", "existing_insurance"],
    deniedFields: ["aadhaar_number", "precise_location", "device_fingerprint"],
    retentionDays: 10,
    minTrustScore: 6.5,
    crossBorderAllowed: true,
    dataResidency: "IN",
    consentRequired: true,
    userRevocable: true,
    quantumSafeRequired: true,
    anonymizationRequired: true,
    metadata: {
      explanation: "Medical and risk profiling requires selective health data, which must be anonymized for backend ML use.",
      piiSensitivity: "HIGH",
      storageType: "TOKENIZED",
      sandboxed: true,
    },
  },
  {
    purpose: "budgeting",
    jurisdiction: ["EU"],
    regulatoryRefs: ["GDPR-Article-5", "GDPR-Article-25"],
    allowedFields: ["transaction_summary", "monthly_income", "monthly_expenses"],
    deniedFields: ["precise_location", "aadhaar_number", "cvv", "card_number"],
    retentionDays: 3,
    minTrustScore: 5.5,
    crossBorderAllowed: false,
    dataResidency: "EU",
    consentRequired: true,
    userRevocable: true,
    quantumSafeRequired: false,
    anonymizationRequired: true,
    metadata: {
      explanation: "Budgeting insights require aggregate spending trends, not identity-sensitive data.",
      piiSensitivity: "LOW",
      storageType: "HASHED",
      sandboxed: true,
    },
  },
  
];

async function insertRules() {
  await connectDB();
  try {
    // Remove existing for idempotency
    const result = await PolicyRule.insertMany(rules);
    console.log('Inserted policy rules:', result);
  } catch (err) {
    console.error('Error inserting policy rules:', err);
  } finally {
    mongoose.connection.close();
  }
}

insertRules(); 