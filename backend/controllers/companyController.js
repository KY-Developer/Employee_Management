import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import { uploadOnCloudinary } from '../config/cloudinary.js';
import bcrypt from 'bcryptjs';
import Company from '../models/Company.js';
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../config/cloudinaryImage.js';

// Get company profile
export const getCompanyProfile = async (req, res) => {
  try {
    const company = await Company.findById(req.company._id).select('-password');
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update company profile
export const updateCompanyProfile = async (req, res) => {
  try {
    const { name } = req.body;
    const company = await Company.findById(req.company._id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    company.name = name || company.name;

    //  If new image uploaded
    if (req.file) {
      //  Delete old image from Cloudinary if exists
      if (company.image?.public_id) {
        await deleteImageFromCloudinary(company.image.public_id);
      }

      //  Upload new image to Cloudinary
      const result = await uploadImageToCloudinary(req.file.path, {
        folder: 'company_profiles',
      });

      if (!result) {
        return res.status(500).json({ message: 'Image upload failed' });
      }

      company.image = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    await company.save();

       //  Emit update to admin room or specific socket
 req.io.emit('company-profile-updated', { company });

    res.status(200).json({ message: 'Profile updated successfully', company });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Get all tasks assigned to company
export const getCompanyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ company: req.company._id })
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update task status
export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    task.status = status || task.status;
    await task.save();

    // Create notification for admin
    const notification = new Notification({
      recipient: task.assignedBy,
      recipientType: 'Admin',
      sender: req.company._id,
      senderType: 'Company',
      message: `Task "${task.title}" status updated to ${task.status}`,
      task: task._id,
    });
    await notification.save();

    // Emit notification to admin
    req.io.to(`admin_${task.assignedBy}`).emit('new-notification', notification);
    res.status(200).json({ message: 'Task status updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// PUT /api/tasks/:taskId/subtasks/:subTaskId
export const updateSubTaskStatus = async (req, res) => {
  try {
    const { taskId, subTaskId } = req.params;
    const { completed } = req.body;

    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const subtask = task.taskList.id(subTaskId);
    if (!subtask) {
      return res.status(404).json({ message: 'Subtask not found' });
    }

    subtask.completed = completed;
    await task.save();

    // Optional: if all subtasks completed, update main task status
    const allDone = task.taskList.every((s) => s.completed);
    if (allDone && task.status !== 'Completed') {
      task.status = 'Completed';
      await task.save();
    }

    // Emit real-time update
    req.io.to(`admin_${task.assignedBy}`).emit('task-updated', {
      taskId: task._id,
      status: task.status,
    });

    // Send notification
    const notification = new Notification({
      recipient: task.assignedBy,
      recipientType: 'Admin',
      sender: req.company._id,
      senderType: 'Company',
      message: `Subtask "${subtask.title}" marked as ${completed ? 'completed' : 'incomplete'}`,
      task: task._id,
    });
    await notification.save();
    req.io.to(`admin_${task.assignedBy}`).emit('new-notification', notification);

    res.json({ message: 'Subtask updated successfully', task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// Upload final PDF for task
export const uploadFinalPdf = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    const pdfFile = await uploadOnCloudinary(req.file.path);
    if (!pdfFile) {
      return res.status(400).json({ message: 'Error uploading PDF' });
    }

    task.finalPdf = {
      public_id: pdfFile.public_id,
      url: pdfFile.url,
    };
    task.status = 'Completed';
    await task.save();

    // Create notification for admin
    const notification = new Notification({
      recipient: task.assignedBy,
      recipientType: 'Admin',
      sender: req.company._id,
      senderType: 'Company',
      message: `Final PDF uploaded for task "${task.title}"`,
      task: task._id,
    });
    await notification.save();

    // Emit notification to admin
    req.io.to(`admin_${task.assignedBy}`).emit('new-notification', notification);

    res.status(200).json({ message: 'Final PDF uploaded successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get company dashboard stats
export const getCompanyDashboardStats = async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments({ company: req.company._id });
    const pendingTasks = await Task.countDocuments({
      company: req.company._id,
      status: 'Pending',
    });
    const inProgressTasks = await Task.countDocuments({
      company: req.company._id,
      status: 'In Progress',
    });
    const completedTasks = await Task.countDocuments({
      company: req.company._id,
      status: 'Completed',
    });

    const company = await Company.findById(req.company._id).select('investment profit');

    res.status(200).json({
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      investment: company.investment,
      profit: company.profit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};






// Add new investment
export const addInvestment = async (req, res) => {
  try {
    if (!req.company) {
      return res.status(401).json({ message: 'Not authorized as company' });
    }

    const { date, investmentType, amount } = req.body;

    if (!date || !investmentType || amount == null) {
      return res
        .status(400)
        .json({ message: 'date, investmentType and amount are required' });
    }

    if (isNaN(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({ message: 'amount must be a non-negative number' });
    }

    const company = await Company.findById(req.company._id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    company.investments.push({ date, investmentType, amount: Number(amount) });
    await company.save();

    res
      .status(201)
      .json({ message: 'Investment added successfully', investments: company.investments });
  } catch (error) {
    console.error('Investment controller error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all investments
export const getInvestments = async (req, res) => {
  try {
    if (!req.company) {
      return res.status(401).json({ message: 'Not authorized as company' });
    }

    const company = await Company.findById(req.company._id).select('investments');
    if (!company) return res.status(404).json({ message: 'Company not found' });

    res.json(company.investments);
  } catch (error) {
    console.error('Investment controller error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update investment
export const updateInvestment = async (req, res) => {
  try {
    if (!req.company) {
      return res.status(401).json({ message: 'Not authorized as company' });
    }

    const { invId } = req.params;
    const { date, investmentType, amount } = req.body;

    const company = await Company.findById(req.company._id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    const investment = company.investments.id(invId);
    if (!investment) return res.status(404).json({ message: 'Investment not found' });

    if (date) investment.date = date;
    if (investmentType) investment.investmentType = investmentType;
    if (amount != null) {
      if (isNaN(Number(amount)) || Number(amount) < 0) {
        return res.status(400).json({ message: 'amount must be a non-negative number' });
      }
      investment.amount = Number(amount);
    }

    await company.save();

    res.json({ message: 'Investment updated successfully', investments: company.investments });
  } catch (error) {
    console.error('Investment controller error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete investment
export const deleteInvestment = async (req, res) => {
  try {
    if (!req.company) {
      return res.status(401).json({ message: 'Not authorized as company' });
    }

    const { invId } = req.params;
    const company = await Company.findById(req.company._id);
    if (!company) return res.status(404).json({ message: 'Company not found' });

    company.investments = company.investments.filter(
      (inv) => inv._id.toString() !== invId
    );
    await company.save();

    res.json({ message: 'Investment deleted successfully', investments: company.investments });
  } catch (error) {
    console.error('Investment controller error:', error);
    res.status(500).json({ message: error.message });
  }
};