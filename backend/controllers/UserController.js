const User = require('../models/User');
const Consent = require('../models/Consent');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserBankData = require('../models/UserBankData');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, phone, aadhaar, dataResidency } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      passwordHash,
      phone,
      aadhaar, 
      dataResidency,
    });
    await user.save();

    // Create dummy UserBankData entry for this user (using user._id as virtual_id for now)
    const dummyBankData = new UserBankData({
      user_id : user._id,
      income: 50000 + Math.floor(Math.random() * 50000),
      credit_score: 700 + Math.floor(Math.random() * 100),
      txn_summary: { groceries: 8000, emi: 12000, bills: 4000 },
      employer: 'DummyCorp',
      last_updated: new Date()
    });
    await dummyBankData.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Login user
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.cookie('userToken', token, { httpOnly: true,secure : false, sameSite: 'Lax', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.json({ user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

