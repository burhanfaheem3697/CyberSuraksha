const VirtualID = require('../models/VirtualID');
const UserBankData = require('../models/UserBankData');

// Fetch user bank data for a given virtual user id and selected fields
exports.fetchUserDataByVirtualId = async (req, res) => {
  try {
    const { virtualUserId, fields } = req.body;
    if (!virtualUserId || !fields || !Array.isArray(fields) || fields.length === 0) {
      return res.status(400).json({ message: 'virtualUserId and fields[] are required' });
    }
    // Validate virtual user id exists and get userId
    const virtualIdDoc = await VirtualID.findById(virtualUserId);
    if (!virtualIdDoc) {
      return res.status(404).json({ message: 'Virtual ID not found' });
    }
    const userId = virtualIdDoc.userId;
    // Fetch user bank data for this user id
    const userBankData = await UserBankData.findOne({ user_id: userId });
    if (!userBankData) {
      return res.status(404).json({ message: 'User bank data not found for this user' });
    }
    // Only return the requested fields
    const allowedFields = ['income', 'txn_summary'];
    const result = {};
    for (let field of fields) {
      if (allowedFields.includes(field) && userBankData[field] !== undefined) {
        result[field] = userBankData[field];
      }
    }
    if (Object.keys(result).length === 0) {
      return res.status(400).json({ message: 'No valid fields found in user data' });
    }
    res.json({ data: result });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 