import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied: No authentication token provided' });
    }

    const token = authHeader.split(' ')[1]?.trim();

    if (!token) {
      return res.status(401).json({ message: 'Access denied: Malformed authorization token' });
    }

    if (!process.env.JWT_SECRET) {
      console.error('[CRITICAL] JWT_SECRET is missing from server environment.');
      return res.status(500).json({ message: 'Authentication service configuration error' });
    }

    // Verify token using algorithm HS256
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Session expired: Please log in again' });
      }
      return res.status(401).json({ message: 'Invalid or corrupted authentication token' });
    }

    if (!decoded || !decoded.id) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // Tenant Isolation & Identity verification: check if user still exists in database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User account no longer exists' });
    }

    // Attach verified user to request
    req.user = user;
    next();
  } catch (error) {
    console.error('[AUTH ERROR]', error.message);
    return res.status(500).json({ message: 'Authentication verification failure' });
  }
};
