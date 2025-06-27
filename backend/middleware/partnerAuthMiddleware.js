const jwt = require('jsonwebtoken');

const partnerAuthMiddleware = (req, res, next) => {
  const token = req.cookies.partnerToken;
  if (!token) {
    return res.status(401).json({ message: 'No partner token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.partner = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired partner token' });
  }
};

module.exports = partnerAuthMiddleware;