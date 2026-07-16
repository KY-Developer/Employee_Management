import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Company from '../models/Company.js';

const protect = async (req, res, next) => {
  let token;
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role === 'admin') {
      req.admin = await Admin.findById(decoded.id).select('-password');
    } else if (decoded.role === 'company') {
      req.company = await Company.findById(decoded.id).select('-password');
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const admin = (req, res, next) => {
  if (req.admin) {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
};

const company = (req, res, next) => {
  if (req.company) {
    next();
  } else {
    return res.status(403).json({ message: 'Not authorized as company' });
  }
};

export { protect, admin, company };