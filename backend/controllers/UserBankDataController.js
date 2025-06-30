const VirtualID = require('../models/VirtualID');
const UserBankData = require('../models/UserBankData');
// const { anonymizeFields } = require('../utils/anonymizer');
const { logPartnerAccess } = require('../utils/auditLogger');
const Contract = require('../models/Contract');
const { maskFields } = require('../utils/fieldMasker');

// Test endpoint to get all user bank data - FOR TESTING ONLY
exports.getAllUserBankData = async (req, res) => {
  try {
    const allData = await UserBankData.find().populate('user_id', 'username email');
    res.json({ success: true, count: allData.length, data: allData });
  } catch (err) {
    console.error("Error fetching all user bank data:", err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

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
    const allowedFields = ['income', 'transaction_summary', 'credit_score', 'employer', 'accounts', 'loans', 'cards', 'monthly_expenses', 'savings', 'employment_history'];
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

// Controller to get sandboxed bank data
exports.getSandboxedBankData = async (req, res) => {
  try {
    const { virtualId, partnerId, contractId } = req.body;
    const allowedFields = req.allowedFields;
    if (!virtualId || !allowedFields) {
      return res.status(400).json({ error: 'Missing virtualId or allowedFields' });
    }

    // Try UserBankData first
    let userBankData = await UserBankData.findOne({ user_id: virtualId }).lean();

    // If not found, try Contract data
    if (!userBankData && contractId) {
      const contract = await Contract.findById(contractId).lean();
      if (contract && contract.data) {
        userBankData = contract.data;
      }
    }

    if (!userBankData) {
      return res.status(404).json({ error: 'User bank data not found' });
    }

    // Filter only allowed fields
    const filteredData = {};
    allowedFields.forEach(field => {
      if (userBankData.hasOwnProperty(field)) {
        filteredData[field] = userBankData[field];
      }
    });
    console.log('Allowed fields:', allowedFields);
    console.log('Filtered Data:', filteredData);

    // Mask sensitive fields if present
    const fieldsToMask = [
      'aadhaar',
      'pan',
      'address',
      'income',
      'credit_score',
      'transaction_summary',
      'employer',
      'accounts',
      'loans',
      'cards',
      'monthly_expenses',
      'savings',
      'employment_history',
      'last_updated'
    ];
    const maskedData = maskFields(filteredData, fieldsToMask);

    res.json({ data: maskedData });

    // Log partner access after responding
    logPartnerAccess(partnerId, virtualId, contractId, allowedFields, new Date());
  } catch (err) {
    return res.status(500).json({ error: 'Error fetching sandboxed bank data', details: err.message });
  }
}; 