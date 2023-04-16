// auth.js
const jwt = require('jsonwebtoken');
const secret = 'your_secret_key';

const generateToken = (user) => {
  return jwt.sign({ id: user.id, username: user.username }, secret, {
    expiresIn: '1h',
  });
};

const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  jwt.verify(token, secret, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

module.exports = {
  generateToken,
  authenticateToken,
};
