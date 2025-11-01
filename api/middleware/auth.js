const jwt = require('jsonwebtoken');

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // Development mode: allow mock token
  if ((process.env.NODE_ENV === 'development' || process.env.ALLOW_DEV_TOKEN === 'true') && token === 'mock-token-for-development') {
    // Create a mock user for development
    req.user = {
      userId: 'dev-user-id',
      id: 'dev-user-id',
      email: 'dev@example.com',
      username: 'developer'
    };
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = { authenticateToken };

