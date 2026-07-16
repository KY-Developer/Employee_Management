import express from 'express';
import {
  adminRegister,
  adminLogin,
  companyLogin,
  logout,
  getCurrentUser,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/admin/register', adminRegister);
router.post('/admin/login', adminLogin);
router.post('/company/login', companyLogin);
router.post('/logout', logout);
router.get('/me',protect, getCurrentUser);

export default router;