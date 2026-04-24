const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'satellite-imagery-secret-key';

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }

  const token = header.startsWith('Bearer ')
    ? header.slice(7)
    : header;

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

module.exports = authMiddleware;
