const Consent = require('../models/Consent');
const AuditLog = require('../models/AuditLog');
const Bank = require('../models/Bank'); // Assume this model exists
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// View all pending consent requests (for the bank)
exports.viewConsentRequests = async (req, res) => {
  try {
    // In a real app, filter by bank's scope/permissions
    const consents = await Consent.find({ status: 'PENDING' })
      .populate('virtualUserId')
      .populate('partnerId', 'name');
    res.json({ consents });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Bank uploads data to partner (placeholder)
exports.sendBankDataToPartner = async (req, res) => {
  try {
    const { consentId, data } = req.body;
    // In a real app, validate consent, check expiry, and securely transmit data
    // Log the data transfer
    await AuditLog.create({
      virtualUserId: req.body.virtualUserId,
      partnerId: req.body.partnerId,
      action: 'BANK_DATA_SENT',
      purpose: req.body.purpose,
      scopes: req.body.scopes,
      timestamp: new Date(),
      status: 'SUCCESS',
      context: { consentId, dataSummary: data ? Object.keys(data) : [] }
    });
    res.json({ message: 'Bank data sent to partner (placeholder)' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Bank login
exports.loginBank = async (req, res) => {
  try {
    const { email, password } = req.body;
    const bank = await Bank.findOne({ email });
    if (!bank) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, bank.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ bankId: bank._id, email: bank.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, bank: { id: bank._id, name: bank.name, email: bank.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Bank registration
exports.registerBank = async (req, res) => {
  try {
    const { name, bankCode, email, password, description } = req.body;
    const existingBank = await Bank.findOne({ $or: [{ email }, { bankCode }] });
    if (existingBank) {
      return res.status(400).json({ message: 'Bank with this email or bank code already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const bank = new Bank({
      name,
      bankCode,
      email,
      passwordHash,
      description
    });
    await bank.save();
    res.status(201).json({ message: 'Bank registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}; 