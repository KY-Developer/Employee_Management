import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import Company from '../models/Company.js';
import bcrypt from 'bcryptjs';

// Admin register
export const adminRegister = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new admin with hashed password
    const admin = new Admin({
      name,
      email,
      password: hashedPassword,
    });

    await admin.save();

    res.status(201).json({ message: 'Admin registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Admin login
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    //     res.cookie('token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    // });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
    res.status(200).json({
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: 'admin',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Company login
export const companyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    const isMatch = await bcrypt.compare(password, company.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: company._id, role: 'company' }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });
    // res.cookie('token', token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === 'production',
    //   sameSite: 'strict',
    //   maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    // });
    res.cookie('token', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Only over HTTPS
  sameSite: 'none', // Or 'Lax' depending on your frontend/backend setup
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
});

    res.status(200).json({
      _id: company._id,
      name: company.name,
      email: company.email,
      role: 'company',
      investment: company.investment,
      profit: company.profit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get current user
export const getCurrentUser = async (req, res) => {
  try {
    if (req.admin) {
      const admin = await Admin.findById(req.admin._id).select('-password');
      return res.status(200).json({ ...admin._doc, role: 'admin' });
    }
    if (req.company) {
      const company = await Company.findById(req.company._id).select('-password');
      return res.status(200).json({ ...company._doc, role: 'company' });
    }
    res.status(404).json({ message: 'User not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};