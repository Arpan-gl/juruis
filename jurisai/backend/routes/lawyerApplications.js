import express from 'express';
import { lawyerApplicationModel } from '../models/lawyerApplication.models.js';
import { userModel } from '../models/user.models.js';
import { verifyUser } from '../middleware.js';

const router = express.Router();

// Submit lawyer application
router.post('/', verifyUser, async (req, res) => {
  try {
    // Check if user is already a lawyer
    if (req.user.role === 'lawyer') {
      return res.status(400).json({
        success: false,
        message: 'You are already registered as a lawyer'
      });
    }

    // Check if user already has a pending application
    const existingApplication = await lawyerApplicationModel.findOne({
      applicant: req.user._id,
      status: { $in: ['pending', 'under_review'] }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending application'
      });
    }

    const applicationData = {
      applicant: req.user._id,
      ...req.body,
      status: 'pending',
      applicationDate: new Date(),
      history: [{
        action: 'submitted',
        date: new Date(),
        notes: 'Application submitted'
      }]
    };

    const newApplication = await lawyerApplicationModel.create(applicationData);

    // Update user role to lawyer (pending verification)
    await userModel.findByIdAndUpdate(req.user._id, {
      role: 'lawyer',
      lawyerProfile: {
        isVerified: false,
        verificationStatus: 'pending',
        applicationDate: new Date()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Lawyer application submitted successfully',
      data: newApplication
    });
  } catch (error) {
    console.error('Error submitting lawyer application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get user's lawyer application
router.get('/my-application', verifyUser, async (req, res) => {
  try {
    const application = await lawyerApplicationModel.findOne({
      applicant: req.user._id
    }).populate('applicant', 'username email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No lawyer application found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update lawyer application
router.put('/my-application', verifyUser, async (req, res) => {
  try {
    const application = await lawyerApplicationModel.findOne({
      applicant: req.user._id,
      status: { $in: ['pending', 'rejected'] }
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No editable application found'
      });
    }

    if (application.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit approved application'
      });
    }

    const updatedApplication = await lawyerApplicationModel.findByIdAndUpdate(
      application._id,
      {
        ...req.body,
        history: [
          ...application.history,
          {
            action: application.status === 'rejected' ? 'reopened' : 'updated',
            date: new Date(),
            notes: 'Application updated by applicant'
          }
        ]
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Application updated successfully',
      data: updatedApplication
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin: Get all applications (with pagination and filters)
router.get('/admin', verifyUser, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { page = 1, limit = 10, status, practiceArea, state } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (practiceArea) filter.practiceAreas = practiceArea;
    if (state) filter['officeAddress.state'] = state;

    const skip = (page - 1) * limit;
    
    const applications = await lawyerApplicationModel.find(filter)
      .populate('applicant', 'username email')
      .sort({ applicationDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await lawyerApplicationModel.countDocuments(filter);

    res.json({
      success: true,
      data: applications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin: Get specific application
router.get('/admin/:id', verifyUser, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const application = await lawyerApplicationModel.findById(req.params.id)
      .populate('applicant', 'username email')
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin: Review application
router.put('/admin/:id/review', verifyUser, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { action, notes, verificationScore, rejectionReason } = req.body;
    
    if (!['approve', 'reject', 'start_review'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action'
      });
    }

    const application = await lawyerApplicationModel.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    let updateData = {
      reviewDate: new Date(),
      reviewedBy: req.user._id,
      adminNotes: notes
    };

    let historyAction = '';
    let userUpdateData = {};

    switch (action) {
      case 'start_review':
        updateData.status = 'under_review';
        historyAction = 'review_started';
        break;
      
      case 'approve':
        updateData.status = 'approved';
        updateData.verificationScore = verificationScore || 100;
        historyAction = 'approved';
        userUpdateData = {
          'lawyerProfile.isVerified': true,
          'lawyerProfile.verificationStatus': 'approved',
          'lawyerProfile.verificationDate': new Date(),
          'lawyerProfile.verifiedBy': req.user._id
        };
        break;
      
      case 'reject':
        updateData.status = 'rejected';
        updateData.rejectionReason = rejectionReason;
        updateData.verificationScore = verificationScore || 0;
        historyAction = 'rejected';
        userUpdateData = {
          'lawyerProfile.verificationStatus': 'rejected',
          'lawyerProfile.rejectionReason': rejectionReason
        };
        break;
    }

    // Add to history
    updateData.history = [
      ...application.history,
      {
        action: historyAction,
        date: new Date(),
        admin: req.user._id,
        notes: notes
      }
    ];

    // Update application
    const updatedApplication = await lawyerApplicationModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    // Update user if needed
    if (Object.keys(userUpdateData).length > 0) {
      await userModel.findByIdAndUpdate(
        application.applicant,
        userUpdateData
      );
    }

    res.json({
      success: true,
      message: `Application ${action}d successfully`,
      data: updatedApplication
    });
  } catch (error) {
    console.error('Error reviewing application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Admin: Document verification
router.put('/admin/:id/verify-document', verifyUser, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { documentIndex, verified, notes } = req.body;
    
    const application = await lawyerApplicationModel.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (!application.documents[documentIndex]) {
      return res.status(400).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Update document verification status
    application.documents[documentIndex].verified = verified;
    application.documents[documentIndex].adminNotes = notes;

    // Add to history
    application.history.push({
      action: 'document_verified',
      date: new Date(),
      admin: req.user._id,
      notes: `Document "${application.documents[documentIndex].type}" ${verified ? 'verified' : 'rejected'}`
    });

    await application.save();

    res.json({
      success: true,
      message: 'Document verification status updated',
      data: application
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
