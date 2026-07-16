import express from 'express';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
    deleteNotificationById,
  deleteAllNotifications,
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getNotifications);

router.route('/:id/read')
  .put(protect, markAsRead);

router.route('/read-all')
  .put(protect, markAllAsRead);

  // DELETE single notification
router.delete('/:id', deleteNotificationById);

// DELETE all notifications
router.delete('/',protect , deleteAllNotifications);

export default router;