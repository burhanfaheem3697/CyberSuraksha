const ExecutionLog = require('../models/ExecutionLog');
const Partner = require('../models/Partner'); // if you want to freeze/flag later
const mongoose = require('mongoose');

const analyzePartnerBehavior = async () => {
  const now = new Date();
  const cutoff = new Date(now.getTime() - 15 * 60 * 1000); // Last 15 mins

  console.log(`[monitor] Running Partner Behavior Monitor at ${now.toISOString()}`);

  // Step 1: Fetch recent executions
  const logs = await ExecutionLog.find({ timestamp: { $gte: cutoff } });

  // Track patterns
  const stats = {}; // { partnerId: { executions, mismatches, tampered, canaryLeaks } }

  for (const log of logs) {
    const pid = log.partnerId.toString();
    if (!stats[pid]) {
      stats[pid] = { executions: 0, mismatches: 0, tampered: 0, canaryLeaks: 0, modelMap: {} };
    }

    stats[pid].executions++;

    if (log.purposeMismatch) stats[pid].mismatches++;
    if (log.tampered) stats[pid].tampered++;
    if (log.canaryFlagValue && JSON.stringify(log.output).includes(log.canaryFlagValue.toString())) {
      stats[pid].canaryLeaks++;
    }

    const mid = log.modelId?.toString();
    if (mid) {
      stats[pid].modelMap[mid] = (stats[pid].modelMap[mid] || 0) + 1;
    }
  }

  // Step 2: Detect and flag abnormal patterns
  for (const [partnerId, data] of Object.entries(stats)) {
    const alerts = [];

    if (data.executions > 50) {
      alerts.push(`🛑 Partner ${partnerId} ran ${data.executions} executions in 15 min.`);
    }

    if (data.mismatches >= 3) {
      alerts.push(`⚠️ Multiple purpose mismatches (${data.mismatches}) for Partner ${partnerId}.`);
    }

    if (data.canaryLeaks > 0) {
      alerts.push(`🚨 Canary flag leaked in output (${data.canaryLeaks} times) for Partner ${partnerId}.`);
    }

    if (data.tampered > 0) {
      alerts.push(`🔴 Detected ${data.tampered} tampered executions for Partner ${partnerId}.`);
    }

    if (alerts.length > 0) {
      console.log('\n==============================');
      console.log(`⚠️  Behavior Alert for Partner ${partnerId}`);
      alerts.forEach(msg => console.log(msg));
      console.log('==============================\n');
    }
  }
};

module.exports = { analyzePartnerBehavior };
