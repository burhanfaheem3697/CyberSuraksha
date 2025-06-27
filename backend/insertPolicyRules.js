const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const connectDB = require('./connectDB');
const PolicyRule = require('./models/PolicyRule');

const rules = [
  {
    purpose: "loan_approval",
    allowedFields: ["income", "credit_score", "transaction_summary", "employment_status"],
    deniedFields: ["aadhaar_number", "full_transaction_history", "biometric_data"],
    retentionDays: 7,
    minTrustScore: 7,
    allowedHours: { start: 8, end: 20 }
  },
  {
    purpose: "insurance",
    allowedFields: ["age", "medical_history", "income", "existing_insurance"],
    deniedFields: ["aadhaar_number", "location_data", "transaction_history"],
    retentionDays: 5,
    minTrustScore: 6.5,
    allowedHours: { start: 9, end: 18 }
  },
  {
    purpose: "budgeting",
    allowedFields: ["spending_categories", "monthly_income", "monthly_expense_summary"],
    deniedFields: ["aadhaar_number", "PAN_card", "precise_location"],
    retentionDays: 3,
    minTrustScore: 5,
    allowedHours: { start: 6, end: 23 }
  }
];

async function insertRules() {
  await connectDB();
  try {
    await PolicyRule.deleteMany({ purpose: { $in: rules.map(r => r.purpose) } }); // Remove existing for idempotency
    const result = await PolicyRule.insertMany(rules);
    console.log('Inserted policy rules:', result);
  } catch (err) {
    console.error('Error inserting policy rules:', err);
  } finally {
    mongoose.connection.close();
  }
}

insertRules(); 