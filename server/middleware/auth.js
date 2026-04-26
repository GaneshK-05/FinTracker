const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Express middleware — verifies JWT from the Authorization header.
 * Attaches decoded payload (user id, email) to req.user.
 */
const authenticate = (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;          // { id, email, name }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = authenticate;
