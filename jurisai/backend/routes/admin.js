import express from 'express';
import { userModel } from '../models/user.models.js';
import { lawyerApplicationModel } from '../models/lawyerApplication.models.js';
import { verifyUser } from '../middleware.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
  next();
};

// Get admin dashboard stats
router.get('/dashboard-stats', verifyUser, requireAdmin, async (req, res) => {
  try {
    // Get pending lawyer applications count
    const pendingApplications = await lawyerApplicationModel.countDocuments({ status: 'pending' });
    
    // Get total users count
    const totalUsers = await userModel.countDocuments({ role: 'user' });
    
    // Get total lawyers count
    const totalLawyers = await userModel.countDocuments({ role: 'lawyer' });
    
    // Get verified lawyers count
    const verifiedLawyers = await userModel.countDocuments({ 
      role: 'lawyer', 
      'lawyerProfile.isVerified': true 
    });

    res.json({
      success: true,
      data: {
        pendingApplications,
        totalUsers,
        totalLawyers,
        verifiedLawyers
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get pending lawyer applications for admin dashboard
router.get('/pending-applications', verifyUser, requireAdmin, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    
    const pendingApplications = await lawyerApplicationModel.find({ status: 'pending' })
      .populate('applicant', 'username email')
      .sort({ applicationDate: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: pendingApplications
    });
  } catch (error) {
    console.error('Error fetching pending applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all users for admin management
router.get('/users', verifyUser, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role, search } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;
    
    const users = await userModel.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await userModel.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update user role or status
router.put('/users/:id', verifyUser, requireAdmin, async (req, res) => {
  try {
    const { role, isActive } = req.body;
    
    const updateData = {};
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const updatedUser = await userModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
