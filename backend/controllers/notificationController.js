import Notification from '../models/Notification.js';

// Get all notifications
export const getNotifications = async (req, res) => {
  try {
    let query = {};
    if (req.admin) {
      query = { recipient: req.admin._id, recipientType: 'Admin' };
    } else if (req.company) {
      query = { recipient: req.company._id, recipientType: 'Company' };
    } else {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('sender', 'name')
      .populate('task', 'title');

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.read = true;
    await notification.save();
    res.status(200).json({ message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req, res) => {
  try {
    let query = {};
    if (req.admin) {
      query = { recipient: req.admin._id, recipientType: 'Admin' };
    } else if (req.company) {
      query = { recipient: req.company._id, recipientType: 'Company' };
    } else {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Notification.updateMany(query, { $set: { read: true } });
    res.status(200).json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const deleteNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Notification.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// Delete all notifications
export const deleteAllNotifications = async (req, res) => {
  try {
    let userId;
    let userRole;

    if (req.admin) {
      userId = req.admin._id;
      userRole = 'Admin';
    } else if (req.company) {
      userId = req.company._id;
      userRole = 'Company';
    } else {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    await Notification.deleteMany({
      recipient: userId,
      recipientType: userRole,
    });

    res.status(200).json({ message: 'All your notifications deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};


