const cron = require('node-cron');
const { analyzePartnerBehavior } = require('../services/monitorPartnerBehavior');
const Contract = require('../models/Contract');
const UserAuditLog = require('../models/UserAuditLog');
const PartnerAuditLog = require('../models/PartnerAuditLog');

// 🕒 Every 15 min: Partner Behavior Monitor
cron.schedule('*/15 * * * *', async () => {
  console.log('[cron] Partner Behavior Monitor running...');
  await analyzePartnerBehavior();
});

// 🕛 Daily at midnight: Contract Expiration Check
cron.schedule('0 0 * * *', async () => {
  console.log('[cron] Contract Expiration Check running...');
  const now = new Date();

  // Mark expired
  await Contract.updateMany(
    {
      status: { $ne: 'EXPIRED' },
      retentionDays: { $exists: true },
      $expr: {
        $lte: [
          { $add: ['$createdAt', { $multiply: ['$retentionDays', 24 * 60 * 60 * 1000] }] },
          now
        ]
      }
    },
    { $set: { status: 'EXPIRED' } }
  );

  // Log for audit
  const expired = await Contract.find({
    status: 'EXPIRED',
    retentionDays: { $exists: true },
    $expr: {
      $lte: [
        { $add: ['$createdAt', { $multiply: ['$retentionDays', 24 * 60 * 60 * 1000] }] },
        now
      ]
    }
  });

  for (const contract of expired) {
    await UserAuditLog.create({
      virtualUserId: contract.virtualUserId,
      action: 'CONTRACT_EXPIRED',
      details: { contractId: contract._id },
      status: 'SUCCESS'
    });
    await PartnerAuditLog.create({
        virtualUserId: contract.virtualUserId, // <-- add this!
        partnerId: contract.partnerId,
        action: 'CONTRACT_EXPIRED',
        details: { contractId: contract._id },
        status: 'SUCCESS'
      });
  }

  console.log(`[cron] ✅ Expiration check complete for ${expired.length} contracts.`);
});
