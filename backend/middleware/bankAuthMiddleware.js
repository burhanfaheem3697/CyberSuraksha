const jwt = require('jsonwebtoken');

const bankAuthMiddleware = (req, res, next) => {

  const token = req.cookies.bankToken;
  if (!token) {
    return res.status(401).json({ message: 'No bank token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.bank = decoded;
    next();
  } catch (err) {
    console.log('Token verification error:', err.message);
    return res.status(401).json({ message: 'Invalid or expired bank token' });
  }
};

module.exports = bankAuthMiddleware;