import express from 'express';
import {
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
  getDashboardStats,
  updateAdminProfile,
   deleteSingleSubmissionFile,
  deleteMultipleSubmissionFiles,
  deleteSubmissionMessage
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';
import imageUpload from '../utils/imageUpload.js';

const router = express.Router();

router.route('/companies')
  .get(protect, admin, getAllCompanies)
  .post(protect, admin, createCompany);

router.route('/dashboard/stats')
  .get(protect, admin, getDashboardStats);

  import { getCompanyById } from '../controllers/adminController.js';

router.route('/companies/:id')
  .get(protect, admin, getCompanyById)  // ✅ ADD THIS LINE
  .put(protect, admin, updateCompany)
  .delete(protect, admin, deleteCompany);

  router.route('/profile/update')
  .put(protect, admin, imageUpload.single('profileImage'), updateAdminProfile);

  //  DELETE single file
router.delete(
  '/task/:taskId/submission/:submissionId/file/:publicId',
  protect,
  admin,
  deleteSingleSubmissionFile
);

//  DELETE multiple files
router.post(
  '/task/:taskId/submission/:submissionId/files/delete',
  protect,
  admin,
  deleteMultipleSubmissionFiles
);

router.put(
  '/task/:taskId/submissions/:submissionId/message',
  protect,
  deleteSubmissionMessage
);


export default router;