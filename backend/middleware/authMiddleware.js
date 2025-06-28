const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = JSON.parse(req.cookies.userToken).accessToken
  if (!token) {
    return res.status(401).json({ message: 'No user token provided' });
  }
  try { 
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log(err)
    return res.status(401).json({ message: 'Invalid or expired user token' });
  }
};

module.exports = authMiddleware;