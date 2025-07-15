const jwt = require('jsonwebtoken');
const Partner = require('../models/Partner');

const partnerAuthMiddleware = async (req, res, next) => {
  const token = req.cookies.partnerToken;

  if (!token) {
    return res.status(401).json({ message: 'No partner token provided' });
  }

  try {
    // Decode token using your secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to find the partner using decoded.id or decoded.partnerId
    const partner = await Partner.findById(decoded.id || decoded.partnerId);

    if (!partner) {
      return res.status(401).json({ message: 'Invalid partner credentials' });
    }

    // Attach the full partner document to req.partner
    req.partner = partner;

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired partner token', error: err.message });
  }
};

module.exports = partnerAuthMiddleware;
