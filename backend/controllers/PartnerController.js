const Partner = require('../models/Partner');
const Consent = require('../models/Consent');
const LoanRequest = require('../models/LoanRequest');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Register a new partner
exports.registerPartner = async (req, res) => {
  try {
    const { name, description, purpose, email, trustScore } = req.body;
    const existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({ message: 'Partner already exists' });
    }
    // Generate a random API key
    const apiKey = crypto.randomBytes(24).toString('hex');
    const partner = new Partner({
      name,
      description,
      purpose,
      email,
      trustScore: trustScore || 0,
      apiKey,
    });
    await partner.save();
    res.status(201).json({ message: 'Partner registered successfully', apiKey });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Create a consent request (partner initiates)
exports.createConsentRequest = async (req, res) => {
  try {
    const { virtualUserId, purpose, dataFields, duration } = req.body;
    const partnerId = req.partner._id; // req.partner set by partner auth middleware
    const consent = new Consent({
      virtualUserId,
      partnerId,
      purpose,
      dataFields,
      duration,
      status: 'PENDING',
    });
    await consent.save();
    res.status(201).json({ message: 'Consent request created', consent });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// View all loan requests (for this partner)
exports.viewLoanRequests = async (req, res) => {
  try {
    const partnerId = req.partner._id;
    // Find all loan requests associated with this partner's virtual IDs
    const loanRequests = await LoanRequest.find({ virtualId: { $in: req.partner.virtualIds } })
      .populate('userId', 'name email')
      .populate('virtualId', 'virtualId');
    res.json({ loanRequests });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// View all approved consents for this partner
exports.viewApprovedConsents = async (req, res) => {
  try {
    const partnerId = req.partner._id;
    const consents = await Consent.find({ partnerId, status: 'APPROVED' })
      .populate('virtualUserId', 'virtualId')
      .populate('partnerId', 'name');
    res.json({ consents });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// List all partners (for dropdowns, etc.)
exports.listPartners = async (req, res) => {
  try {
    const partners = await Partner.find();
    res.json({ partners });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

exports.loginPartner = async (req, res) => {
  try {
    const { email, password } = req.body;
    const partner = await Partner.findOne({ email });
    if (!partner) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    // For demo, assume apiKey is the password hash (or add a passwordHash field in real app)
    const isMatch = await bcrypt.compare(password, partner.apiKey);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ partnerId: partner._id, email: partner.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, partner: { id: partner._id, name: partner.name, email: partner.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
