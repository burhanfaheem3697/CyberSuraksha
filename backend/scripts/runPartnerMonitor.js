const { analyzePartnerBehavior } = require('../services/monitorPartnerBehavior');
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('[manual] Connected to DB. Running behavior analyzer...');
  await analyzePartnerBehavior();
  process.exit();
});
