import { useState, useEffect } from 'react';
import { useSocket } from '../../context/SocketContext';
import { FiBell, FiCheck, FiTrash2 } from 'react-icons/fi';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotifications,
  deleteNotification,
  deleteAllNotifications,
} from '../../services/notificationService';

const NotificationBell = () => {
  const { notifications, setNotifications } = useSocket();
  const [isOpen, setIsOpen] = useState(false);

  const [markingAsReadId, setMarkingAsReadId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);

  const notificationList = Array.isArray(notifications) ? notifications : [];
  const unreadCount = notificationList.filter((n) => !n.read).length;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch notifications:');
        setNotifications([]);
      }
    };
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      setMarkingAsReadId(id);
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
    } catch (error) {
      console.error('Failed to mark as read:');
    } finally {
      setMarkingAsReadId(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true);
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (error) {
      console.error('Failed to mark all as read:');
    } finally {
      setMarkingAll(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      setDeletingId(id);
      await deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (error) {
      console.error('Failed to delete notification:');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    try {
      setDeletingAll(true);
      await deleteAllNotifications();
      setNotifications([]);
    } catch (error) {
      console.error('Failed to delete all notifications:');
    } finally {
      setDeletingAll(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 rounded-full text-gray-600 hover:text-primary-600 relative"
      >
        <FiBell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-2 mt-2 w-72 sm:w-80 max-w-[90vw] bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="py-1">
            <div className="px-4 py-2 border-b flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-700">Notifications</h3>
              <div className="flex gap-2">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary-600 hover:text-primary-800"
                  disabled={markingAll || deletingAll}
                >
                  {markingAll ? 'Marking...' : 'Mark all as read'}
                </button>
                {notifications.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="text-xs text-red-500 hover:text-red-700"
                  disabled={deletingAll || markingAll}
                >
                  {deletingAll ? 'Deleting...' : 'Delete all'}
                </button>
                )}
              </div>
            </div>

            {notificationList.length === 0 ? (
              <div className="px-4 py-3 text-sm text-gray-500">No notifications</div>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {notificationList.map((notification) => (
                  <div
                    key={notification._id}
                    className={`px-4 py-3 border-b ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-700">{notification.message}</p>
                      <div className="flex gap-2 ml-2">
                        {!notification.read && (
                          <button
                            onClick={() => handleMarkAsRead(notification._id)}
                            className="text-xs text-primary-600 hover:text-primary-800"
                            disabled={markingAsReadId === notification._id || deletingId === notification._id}
                            title="Mark as read"
                          >
                            {markingAsReadId === notification._id ? '...' : <FiCheck size={14} />}
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification._id)}
                          className="text-xs text-red-500 hover:text-red-700"
                          disabled={deletingId === notification._id || markingAsReadId === notification._id}
                          title="Delete"
                        >
                          {deletingId === notification._id ? '...' : <FiTrash2 size={14} />}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;


