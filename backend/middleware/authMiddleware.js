const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    if (!req.cookies.userToken) {
      return res.status(401).json({ message: 'No user token provided' });
    }
    const parsed = JSON.parse(req.cookies.userToken);
    const token = parsed.accessToken;
    if (!token) {
      return res.status(401).json({ message: 'No access token provided' });
    }
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: 'Invalid or expired user token' });
  }
};

module.exports = authMiddleware;