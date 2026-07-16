import Task from '../models/Task.js';
import Company from '../models/Company.js';
import Notification from '../models/Notification.js';
import { uploadOnCloudinary } from '../config/cloudinary.js';
import path from 'path';
import fs from 'fs';
import ExcelJS from 'exceljs';
import pLimit from 'p-limit';

// Create a new task
export const createTask = async (req, res) => {
  try {

    const { title, description, taskList, companyId } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'PDF file is required' });
    }

    const pdfFile = await uploadOnCloudinary(req.file.path);
    if (!pdfFile) {
      return res.status(400).json({ message: 'Error uploading PDF' });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const parsedTaskList = JSON.parse(taskList);

    const task = new Task({
      title,
      description,
      pdfFile: {
        public_id: pdfFile.public_id,
        url: pdfFile.url,
      },
      taskList: parsedTaskList,
      company: companyId,
      assignedBy: req.admin._id,
    });

    await task.save();

    const notification = new Notification({
      recipient: companyId,
      recipientType: 'Company',
      sender: req.admin._id,
      senderType: 'Admin',
      message: `New task assigned: "${title}"`,
      task: task._id,
    });
    await notification.save();

    req.io.to(`company_${companyId}`).emit('new-notification', notification);

    res.status(201).json({ message: 'Task created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tasks
export const getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('company', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a task
export const updateTask = async (req, res) => {
  try {
    const { title, description, taskList } = req.body;
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.taskList = taskList ? JSON.parse(taskList) : task.taskList;

    if (req.file) {
      const pdfFile = await uploadOnCloudinary(req.file.path);
      if (pdfFile) {
        task.pdfFile = {
          public_id: pdfFile.public_id,
          url: pdfFile.url,
        };
      }
    }

    await task.save();

    // Create notification for company
    const notification = new Notification({
      recipient: task.company,
      recipientType: 'Company',
      sender: req.admin._id,
      senderType: 'Admin',
      message: `Task updated: "${task.title}"`,
      task: task._id,
    });
    await notification.save();

    // Emit notification to company
    req.io.to(`company_${task.company}`).emit('new-notification', notification);

    res.status(200).json({ message: 'Task updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a task
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await Task.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get task by ID
export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('company', 'name email')
      .populate('assignedBy', 'name email');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(200).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitTaskWork = async (req, res) => {
  try {
    const { message } = req.body;
    const { id: taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const limit = pLimit(5); // Limit concurrency to avoid timeouts
    const uploadPromises = req.files.map((file) =>
      limit(() => uploadOnCloudinary(file.path))
    );

    const results = await Promise.allSettled(uploadPromises);

    const uploadedFiles = [];
    results.forEach((result, i) => {
      if (result.status === 'fulfilled' && result.value) {
        uploadedFiles.push({
          public_id: result.value.public_id,
          url: result.value.secure_url,
        });
      } else {
        console.error(`❌ Upload failed for ${req.files[i]?.originalname}:`, result.reason);
      }
    });

    if (uploadedFiles.length === 0) {
      return res.status(500).json({ message: 'All file uploads failed' });
    }

    // Save in task
    task.submissions.push({ message, files: uploadedFiles });
    task.submissionStatus = 'Submitted';
    task.status = 'Completed';
    await task.save();

    // Notify admin
    const notification = new Notification({
      recipient: task.assignedBy,
      recipientType: 'Admin',
      sender: task.company,
      senderType: 'Company',
      message: `Task "${task.title}" submitted by company.`,
      task: task._id,
    });
    await notification.save();

    req.io.to(`admin_${task.assignedBy}`).emit('new-notification', notification);
    req.io.to(`admin_${task.assignedBy}`).emit('task-updated', {
      taskId: task._id,
      submissionStatus: task.submissionStatus,
      status: task.status,
    });

    res.status(200).json({ message: 'Submission sent successfully' });

  } catch (error) {
    console.error('❌ submitTaskWork error:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};


export const reviewSubmittedTask = async (req, res) => {
  try {
    const { status, message } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    task.submissionStatus = status;

    if (status === 'Rejected' && message) {
      task.rejectionReason = message;
    } else if (status === 'Approved') {
      task.rejectionReason = ''; // Clear old reason if approved
    }

    await task.save();

    const notificationMessage = status === 'Rejected' && message
      ? `Your task "${task.title}" was rejected. Reason: ${message}`
      : `Your task "${task.title}" submission was ${status}.`;

    const notification = new Notification({
      recipient: task.company,
      recipientType: 'Company',
      sender: req.admin._id,
      senderType: 'Admin',
      message: notificationMessage,
      task: task._id,
    });

    await notification.save();

    req.io.to(`company_${task.company}`).emit('new-notification', notification);
    req.io.to(`company_${task.company}`).emit('task-updated', {
      taskId: task._id,
      status: task.status,
      submissionStatus: task.submissionStatus,
    });

    req.io.to(`admin_${req.admin._id}`).emit('task-updated', {
      taskId: task._id,
      submissionStatus: task.submissionStatus,
      status: task.status,
    });

    res.status(200).json({ message: `Task submission ${status.toLowerCase()} successfully.` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const exportTasksToExcel = async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate('company', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tasks Report');

    worksheet.columns = [
      { header: 'Title', key: 'title', width: 25 },
      { header: 'Description', key: 'description', width: 30 },
      { header: 'Company Name', key: 'companyName', width: 20 },
      { header: 'Company Email', key: 'companyEmail', width: 25 },
      { header: 'Assigned By', key: 'assignedByName', width: 20 },
      { header: 'Assigned Email', key: 'assignedByEmail', width: 25 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Submission Status', key: 'submissionStatus', width: 20 },
      { header: 'Created At', key: 'createdAt', width: 20 },
      { header: 'Updated At', key: 'updatedAt', width: 20 },
    ];

    tasks.forEach(task => {
      worksheet.addRow({
        title: task.title,
        description: task.description,
        companyName: task.company?.name,
        companyEmail: task.company?.email,
        assignedByName: task.assignedBy?.name,
        assignedByEmail: task.assignedBy?.email,
        status: task.status,
        submissionStatus: task.submissionStatus || 'Not Submitted',
        createdAt: task.createdAt.toISOString().split('T')[0],
        updatedAt: task.updatedAt.toISOString().split('T')[0],
      });
    });

    const filePath = path.join('exports', `tasks_${Date.now()}.xlsx`);
    await workbook.xlsx.writeFile(filePath);

    res.download(filePath, err => {
      if (err) console.error(err);
      fs.unlinkSync(filePath); // clean up file after sending
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTasksByCompany = async (req, res) => {
  try {
    const tasks = await Task.find({ company: req.params.companyId })
      .populate('company', 'name email')         // include name and email
      .populate('assignedBy', 'name email');     // include name and email

    res.json({ tasks });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ message: 'Error fetching tasks' });
  }
};



