const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.cookies.userToken;
  if (!token) {
    return res.status(401).json({ message: 'No user token provided' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired user token' });
  }
};

module.exports = authMiddleware;