import mongoose from 'mongoose';

const subTaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  completed: {
    type: Boolean,
    default: false,
  },
});



const submissionSchema = new mongoose.Schema({
  message: {
    type: String,
  },
  files: [
    {
      public_id: String,
      url: String,
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});


const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    pdfFile: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },
    taskList: [subTaskSchema],

    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Completed'],
      default: 'Pending',
    },

    submissionStatus: {
      type: String,
      enum: ['Submitted', 'Approved', 'Rejected', null],
      default: null,
    },

    rejectionReason: {
      type: String,
      default: '',
    },

    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
    },

    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },

    finalPdf: {
      public_id: {
        type: String,
      },
      url: {
        type: String,
      },
    },

    submissions: [submissionSchema],
  },
  { timestamps: true }
);

const Task = mongoose.model('Task', taskSchema);
export default Task;
