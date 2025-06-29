const AuditLog = require('../models/AuditLog');
const { Types } = require('mongoose');

async function logPartnerAccess(partnerId, virtualId, contractId, accessedFields, timestamp) {
  try {
    await AuditLog.create({
      virtualUserId: virtualId,
      partnerId,
      action: 'DATA_ACCESS',
      timestamp,
      context: {
        contractId,
        accessedFields
      }
    });
  } catch (err) {
    // Optionally log error to console or external service
    console.error('Failed to log partner access:', err);
  }
}

async function logDataRoomAccess(partnerId, virtualId, contractId, dataSnapshot, timestamp) {
  try {
    await AuditLog.create({
      partnerId,
      virtualUserId: virtualId,
      action: 'VIEWED_DATA',
      timestamp,
      context: {
        contractId,
        dataSnapshot
      }
    });
  } catch (err) {
    console.error('[logDataRoomAccess] Failed to log audit:', err);
  }
}

async function logDataRoomInteraction(partnerId, virtualId, contractId, action, details, timestamp) {
  try {
    // Ensure all IDs are ObjectId instances
    const partnerObjectId = partnerId instanceof Types.ObjectId ? partnerId : new Types.ObjectId(partnerId);
    const virtualObjectId = virtualId instanceof Types.ObjectId ? virtualId : new Types.ObjectId(virtualId);
    const contractObjectId = contractId instanceof Types.ObjectId ? contractId : new Types.ObjectId(contractId);

    await AuditLog.create({
      partnerId: partnerObjectId,
      virtualUserId: virtualObjectId,
      action: action,
      timestamp,
      context: {
        contractId: contractObjectId,
        interactionType: 'DATA_ROOM_ACTION',
        details: details
      }
    });
  } catch (err) {
    console.error('[logDataRoomInteraction] Failed to log interaction:', err);
  }
}

module.exports = { logPartnerAccess, logDataRoomAccess, logDataRoomInteraction }; 