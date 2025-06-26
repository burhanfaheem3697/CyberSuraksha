const Partner = require('../models/Partner');
const Consent = require('../models/Consent');
const LoanRequest = require('../models/LoanRequest');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const AuditLog = require('../models/AuditLog')

// Register a new partner
exports.registerPartner = async (req, res) => {
  try {
    const { name, description, purpose, email, trustScore,password} = req.body;
    const existingPartner = await Partner.findOne({ email });
    if (existingPartner) {
      return res.status(400).json({ message: 'Partner already exists' });
    }
    // Generate a random API key
    const apiKey = crypto.randomBytes(24).toString('hex');
    const passwordHash = await bcrypt.hash(password, 10);
    const partner = new Partner({
      name,
      description,
      purpose,
      email,
      trustScore: trustScore || 0,
      apiKey,
      password : passwordHash
    });
    await partner.save();
    res.status(201).json({ message: 'Partner registered successfully', apiKey });
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
    const isMatch = await bcrypt.compare(password,partner.password)
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ partnerId: partner._id, email: partner.email }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, { httpOnly: true,secure : false, sameSite: 'Lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ token, partner: { id: partner._id, name: partner.name, email: partner.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
