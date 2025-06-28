
const Bank = require('../models/Bank'); // Assume this model exists
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');



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
    res.cookie('bankToken', token, { 
      httpOnly: true, 
      secure: false, 
      sameSite: 'lax', 
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
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



