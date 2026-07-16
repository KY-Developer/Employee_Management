import express from 'express';
import {
  getCompanyProfile,
  updateCompanyProfile,
  getCompanyTasks,
  updateTaskStatus,
  updateSubTaskStatus,
  uploadFinalPdf,
  getCompanyDashboardStats,
  addInvestment,
  getInvestments,
  updateInvestment,
  deleteInvestment,
} from '../controllers/companyController.js';
import { protect, company } from '../middleware/auth.js';
import upload from '../utils/upload.js';
import imageUpload from '../utils/imageUpload.js' // for image

const router = express.Router();

router.route('/profile')
  .get(protect, company, getCompanyProfile)
  .put(protect, company,imageUpload.single('image'), updateCompanyProfile);

router.route('/tasks')
  .get(protect, company, getCompanyTasks);

router.route('/tasks/:id/status')
  .put(protect, company, updateTaskStatus);

router.route('/tasks/:taskId/subtasks/:subTaskId')
  .put(protect, company, updateSubTaskStatus);

router.route('/tasks/:id/final-pdf')
  .put(protect, company, upload.single('pdf'), uploadFinalPdf);

router.route('/dashboard/stats')
  .get(protect, company, getCompanyDashboardStats);


// Investments
router.route("/investments")
  .post(protect, company, addInvestment)
  .get(protect, company, getInvestments);

router.route("/investments/:invId")
  .put(protect, company, updateInvestment)
  .delete(protect, company, deleteInvestment);

export default router;