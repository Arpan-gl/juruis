import express from 'express';
import { hireModel } from '../models/hire.models.js';
import { responseModel } from '../models/response.models.js';
import { verifyUser } from '../middleware.js';

const router = express.Router();

// Create a hiring contract
router.post('/', verifyUser, async (req, res) => {
  try {
    const { responseId, contractTerms } = req.body;
    
    if (!responseId || !contractTerms || !contractTerms.amount) {
      return res.status(400).json({
        success: false,
        message: 'Response ID and contract terms with amount are required'
      });
    }

    // Get the response to check if it exists and get issue details
    const response = await responseModel.findById(responseId)
      .populate('issue', 'author title')
      .populate('lawyer', 'username email');

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Check if the user is the issue author
    if (response.issue.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only hire lawyers for your own issues'
      });
    }

    // Check if already hired
    if (response.isHired) {
      return res.status(400).json({
        success: false,
        message: 'This lawyer has already been hired for this issue'
      });
    }

    // Create hiring contract
    const newHire = await hireModel.create({
      issue: response.issue._id,
      client: req.user._id,
      lawyer: response.lawyer._id,
      response: responseId,
      contractTerms: {
        ...contractTerms,
        startDate: new Date()
      }
    });

    // Update response status
    await responseModel.findByIdAndUpdate(responseId, {
      isHired: true,
      hireDate: new Date(),
      status: 'Accepted'
    });

    await newHire.populate([
      { path: 'client', select: 'username email' },
      { path: 'lawyer', select: 'username email' },
      { path: 'issue', select: 'title category' },
      { path: 'response', select: 'approach estimatedCost' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Lawyer hired successfully',
      data: newHire
    });
  } catch (error) {
    console.error('Error creating hire contract:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all hiring contracts for a user (as client or lawyer)
router.get('/user', verifyUser, async (req, res) => {
  try {
    const { role = 'all', status, page = 1, limit = 10 } = req.query;
    
    let filter = {};
    if (role === 'client') {
      filter.client = req.user._id;
    } else if (role === 'lawyer') {
      filter.lawyer = req.user._id;
    } else {
      filter.$or = [
        { client: req.user._id },
        { lawyer: req.user._id }
      ];
    }

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;
    
    const hires = await hireModel.find(filter)
      .populate('client', 'username email')
      .populate('lawyer', 'username email')
      .populate('issue', 'title category')
      .populate('response', 'approach estimatedCost')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await hireModel.countDocuments(filter);

    res.json({
      success: true,
      data: hires,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching hire contracts:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get a specific hiring contract
router.get('/:id', verifyUser, async (req, res) => {
  try {
    const hire = await hireModel.findById(req.params.id)
      .populate('client', 'username email')
      .populate('lawyer', 'username email')
      .populate('issue', 'title category description')
      .populate('response', 'approach estimatedCost estimatedTime qualifications experience')
      .lean();

    if (!hire) {
      return res.status(404).json({
        success: false,
        message: 'Hiring contract not found'
      });
    }

    // Check if user is part of this contract
    if (hire.client._id.toString() !== req.user._id.toString() && 
        hire.lawyer._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own hiring contracts'
      });
    }

    res.json({
      success: true,
      data: hire
    });
  } catch (error) {
    console.error('Error fetching hire contract:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update hiring contract status
router.put('/:id/status', verifyUser, async (req, res) => {
  try {
    const { status } = req.body;
    const hire = await hireModel.findById(req.params.id);
    
    if (!hire) {
      return res.status(404).json({
        success: false,
        message: 'Hiring contract not found'
      });
    }

    // Check if user is part of this contract
    if (hire.client.toString() !== req.user._id.toString() && 
        hire.lawyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own hiring contracts'
      });
    }

    // Only allow certain status transitions
    const allowedTransitions = {
      'Pending': ['Active', 'Cancelled'],
      'Active': ['Completed', 'Disputed'],
      'Completed': [],
      'Cancelled': [],
      'Disputed': ['Active', 'Cancelled']
    };

    if (!allowedTransitions[hire.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${hire.status} to ${status}`
      });
    }

    const updateData = { status };
    if (status === 'Active') {
      updateData.startDate = new Date();
    } else if (status === 'Completed') {
      updateData.endDate = new Date();
    }

    const updatedHire = await hireModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate([
      { path: 'client', select: 'username email' },
      { path: 'lawyer', select: 'username email' },
      { path: 'issue', select: 'title category' },
      { path: 'response', select: 'approach estimatedCost' }
    ]);

    res.json({
      success: true,
      message: 'Contract status updated successfully',
      data: updatedHire
    });
  } catch (error) {
    console.error('Error updating hire contract status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add communication message
router.post('/:id/communication', verifyUser, async (req, res) => {
  try {
    const { message, attachments } = req.body;
    const hire = await hireModel.findById(req.params.id);
    
    if (!hire) {
      return res.status(404).json({
        success: false,
        message: 'Hiring contract not found'
      });
    }

    // Check if user is part of this contract
    if (hire.client.toString() !== req.user._id.toString() && 
        hire.lawyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only communicate in your own hiring contracts'
      });
    }

    const communicationEntry = {
      sender: req.user._id,
      message,
      attachments: attachments || [],
      timestamp: new Date()
    };

    const updatedHire = await hireModel.findByIdAndUpdate(
      req.params.id,
      { $push: { communication: communicationEntry } },
      { new: true }
    ).populate([
      { path: 'client', select: 'username email' },
      { path: 'lawyer', select: 'username email' },
      { path: 'issue', select: 'title category' },
      { path: 'response', select: 'approach estimatedCost' }
    ]);

    res.json({
      success: true,
      message: 'Message added successfully',
      data: updatedHire
    });
  } catch (error) {
    console.error('Error adding communication:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Rate the other party
router.post('/:id/rate', verifyUser, async (req, res) => {
  try {
    const { rating, review } = req.body;
    const hire = await hireModel.findById(req.params.id);
    
    if (!hire) {
      return res.status(404).json({
        success: false,
        message: 'Hiring contract not found'
      });
    }

    // Check if user is part of this contract
    if (hire.client.toString() !== req.user._id.toString() && 
        hire.lawyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only rate in your own hiring contracts'
      });
    }

    // Check if contract is completed
    if (hire.status !== 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only rate completed contracts'
      });
    }

    const updateData = {};
    if (hire.client.toString() === req.user._id.toString()) {
      updateData.clientRating = { rating, review, date: new Date() };
    } else {
      updateData.lawyerRating = { rating, review, date: new Date() };
    }

    const updatedHire = await hireModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate([
      { path: 'client', select: 'username email' },
      { path: 'lawyer', select: 'username email' },
      { path: 'issue', select: 'title category' },
      { path: 'response', select: 'approach estimatedCost' }
    ]);

    res.json({
      success: true,
      message: 'Rating added successfully',
      data: updatedHire
    });
  } catch (error) {
    console.error('Error adding rating:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
