import Company from '../models/Company.js';
import Task from '../models/Task.js';
import { uploadImageToCloudinary } from '../config/cloudinaryImage.js'; 
import bcrypt from 'bcryptjs'; 
import Admin from '../models/Admin.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

// Get all companies
export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find().select('-password');
    res.status(200).json(companies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a new company
export const createCompany = async (req, res) => {
  try {
    const { name, email, password, investment, profit } = req.body;

    // Check if the company already exists (optional but recommended)
    const companyExists = await Company.findOne({ email });
    if (companyExists) {
      return res.status(400).json({ message: 'Company already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const company = new Company({
      name,
      email,
      password: hashedPassword,
      investment,
      profit,
      assignedBy: req.admin._id,
    });

    await company.save();

    res.status(201).json({ message: 'Company created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update a company
export const updateCompany = async (req, res) => {
  try {
    const { name, email, investment, profit, password } = req.body;

    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    // Update general fields
    company.name = name || company.name;
    company.email = email || company.email;
    company.investment = investment ?? company.investment;
    company.profit = profit ?? company.profit;

    // Update and hash password if provided
    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      company.password = hashedPassword;
      console.log('Password updated for company:');
    } else {
      console.log('Password not updated for company:');
    }

    await company.save();

    req.io.to(`company_${company._id}`).emit('admin-updated-company', {
      message: 'Your profile has been updated by admin',
      company,
    });
    res.status(200).json({ message: 'Company updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a company
export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    await Task.deleteMany({ company: company._id });
    await Company.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Company deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.status(200).json(company);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Get dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const totalTasks = await Task.countDocuments();
    const pendingTasks = await Task.countDocuments({ status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ status: 'In Progress' });
    const completedTasks = await Task.countDocuments({ status: 'Completed' });

    const companies = await Company.find().select('name investment profit');
    const investmentData = companies.map(company => ({
      name: company.name,
      investment: company.investment,
      profit: company.profit,
    }));

    res.status(200).json({
      totalCompanies,
      totalTasks,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      investmentData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


export const updateAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const { name, email, password } = req.body;

    // Handle optional profile image
    let profileImage = admin.profileImage;
    if (req.file) {
      const result = await uploadImageToCloudinary(req.file.path);
      if (result?.url) {
        profileImage = result.url;
      }
    }

    // Update fields
    admin.name = name || admin.name;
    admin.email = email || admin.email;
    admin.profileImage = profileImage;

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin.password = hashedPassword;
    }

    await admin.save();
    res.status(200).json({ message: 'Admin profile updated successfully', admin });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE single submission file
export const deleteSingleSubmissionFile = async (req, res) => {
  try {
    const { taskId, submissionId, publicId } = req.params;

    if (!taskId || !submissionId || !publicId) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const submission = task.submissions.id(submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const fileExists = submission.files.some(file => file.public_id === publicId);
    if (!fileExists) return res.status(404).json({ message: 'File not found in submission' });

    submission.files = submission.files.filter(file => file.public_id !== publicId);

    // Optionally delete the entire submission if now empty
if (submission.files.length === 0 && !submission.message) {
  submission.deleteOne();  // Deletes subdocument
}

    await deleteFromCloudinary(publicId);
    await task.save();

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// DELETE multiple submission files
export const deleteMultipleSubmissionFiles = async (req, res) => {
  try {
    const { taskId, submissionId } = req.params;
    const { publicIds } = req.body;

    if (!taskId || !submissionId || !Array.isArray(publicIds) || publicIds.length === 0) {
      return res.status(400).json({ message: 'Invalid request parameters' });
    }

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const submission = task.submissions.id(submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.files = submission.files.filter(file => !publicIds.includes(file.public_id));

    if (submission.files.length === 0 && !submission.message) {
  submission.deleteOne();
}


    // Delete from Cloudinary in parallel
    await Promise.all(publicIds.map(id => deleteFromCloudinary(id)));

    await task.save();

    res.status(200).json({ message: 'Files deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


export const deleteSubmissionMessage = async (req, res) => {
  try {
    const { taskId, submissionId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const submission = task.submissions.id(submissionId);
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    submission.message = '';
    if (submission.files.length === 0 && !submission.message) {
  submission.deleteOne();
}
    await task.save();

    res.status(200).json({ message: 'Message deleted successfully', task });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};





