const VirtualID = require('../models/VirtualID');
const mongoose = require('mongoose');

/**
 * Resolves a virtualUserId to the actual user_id.
 * @param {mongoose.Types.ObjectId} virtualUserId
 * @returns {Promise<mongoose.Types.ObjectId>} user_id
 * @throws {Error} if mapping fails
 */
const getUserIdFromVirtualId = async (virtualUserId) => {
  const mapping = await VirtualID.findById(virtualUserId);
  if (!mapping || !mapping.user_id) {
    throw new Error('Invalid or unmapped virtualUserId');
  }
  return mapping.user_id;
};

module.exports = { getUserIdFromVirtualId };
// This code defines a utility function to resolve a virtual user ID to the actual user ID in a Node.js application using Mongoose.
// It fetches the mapping from a MongoDB collection and returns the user ID, throwing an error if the mapping is invalid or not found.
// This is useful for applications that use virtual IDs for privacy or security reasons, allowing them to retrieve the actual user ID when needed.