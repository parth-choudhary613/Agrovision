// middleware/auth.js
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  // Check if token exists in header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;        // Important: This adds user info
    next();                    // Continue to next function
  } catch (error) {
    return res.status(401).json({ error: "Not authorized, token failed" });
  }
};

module.exports = protect;