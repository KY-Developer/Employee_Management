import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'recipientType',
    },
    recipientType: {
      type: String,
      required: true,
      enum: ['Admin', 'Company'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'senderType',
    },
    senderType: {
      type: String,
      required: true,
      enum: ['Admin', 'Company'],
    },
    message: {
      type: String,
      required: true,
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;