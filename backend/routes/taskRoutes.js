import express from 'express';
import {
  createTask,
  getAllTasks,
  updateTask,
  deleteTask,
  getTaskById,
  submitTaskWork,
  reviewSubmittedTask,
  exportTasksToExcel,  
  getTasksByCompany
} from '../controllers/taskController.js';
import { protect, admin } from '../middleware/auth.js';
import upload from '../utils/upload.js';

const router = express.Router();

  router
  .route('/:id/submit')
  .post(protect, upload.array('files', 200), submitTaskWork);

// Route to export tasks as Excel
router.route('/export/excel').get(protect, admin, exportTasksToExcel);

router.route('/')
  .get(protect, admin, getAllTasks)
  .post(protect, admin, upload.single('pdf'), createTask);

router.route('/:id')
  .get(protect, getTaskById)
  .put(protect, admin, upload.single('pdf'), updateTask)
  .delete(protect, admin, deleteTask);

  // Admin reviews (approves/rejects) a submitted task
router
  .route('/:id/review')
  .put(protect, admin, reviewSubmittedTask); 

router.get('/company/:companyId', getTasksByCompany);


export default router;