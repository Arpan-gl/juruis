import express from 'express';
import { responseModel } from '../models/response.models.js';
import { verifyUser } from '../middleware.js';

const router = express.Router();

// Middleware to check if user is a verified lawyer
const verifyLawyer = async (req, res, next) => {
  try {
    if (req.user.role !== 'lawyer') {
      return res.status(403).json({
        success: false,
        message: 'Only lawyers can respond to legal issues'
      });
    }

    if (!req.user.lawyerProfile?.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Only verified lawyers can respond to legal issues. Please complete your verification process.'
      });
    }

    next();
  } catch (error) {
    console.error('Error in lawyer verification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Create a lawyer response to an issue (only verified lawyers)
router.post('/', verifyUser, verifyLawyer, async (req, res) => {
  try {
    const { issueId, content, approach, estimatedTime, estimatedCost, qualifications, experience } = req.body;
    
    if (!issueId || !content || !approach) {
      return res.status(400).json({
        success: false,
        message: 'Issue ID, content, and approach are required'
      });
    }

    // Check if lawyer already responded to this issue
    const existingResponse = await responseModel.findOne({
      issue: issueId,
      lawyer: req.user._id
    });

    if (existingResponse) {
      return res.status(400).json({
        success: false,
        message: 'You have already responded to this issue'
      });
    }

    const newResponse = await responseModel.create({
      issue: issueId,
      lawyer: req.user._id,
      content,
      approach,
      estimatedTime,
      estimatedCost,
      qualifications,
      experience
    });

    await newResponse.populate([
      { path: 'lawyer', select: 'username email lawyerProfile' },
      { path: 'issue', select: 'title category' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Response posted successfully',
      data: newResponse
    });
  } catch (error) {
    console.error('Error creating response:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all responses for a specific issue
router.get('/issue/:issueId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;
    
    const responses = await responseModel.find({ issue: req.params.issueId })
      .populate('lawyer', 'username email lawyerProfile')
      .populate('issue', 'title category')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await responseModel.countDocuments({ issue: req.params.issueId });

    res.json({
      success: true,
      data: responses,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get a specific response by ID
router.get('/:id', async (req, res) => {
  try {
    const response = await responseModel.findById(req.params.id)
      .populate('lawyer', 'username email lawyerProfile')
      .populate('issue', 'title category description')
      .lean();

    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching response:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update a response (only the lawyer who created it)
router.put('/:id', verifyUser, verifyLawyer, async (req, res) => {
  try {
    const response = await responseModel.findById(req.params.id);
    
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Check if user is the lawyer who created the response
    if (response.lawyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own responses'
      });
    }

    const updatedResponse = await responseModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'lawyer', select: 'username email lawyerProfile' },
      { path: 'issue', select: 'title category' }
    ]);

    res.json({
      success: true,
      message: 'Response updated successfully',
      data: updatedResponse
    });
  } catch (error) {
    console.error('Error updating response:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete a response (only the lawyer who created it)
router.delete('/:id', verifyUser, verifyLawyer, async (req, res) => {
  try {
    const response = await responseModel.findById(req.params.id);
    
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    // Check if user is the lawyer who created the response
    if (response.lawyer.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own responses'
      });
    }

    await responseModel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Response deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting response:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Vote on a response
router.post('/:id/vote', verifyUser, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const responseId = req.params.id;
    const userId = req.user._id;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type'
      });
    }

    const response = await responseModel.findById(responseId);
    if (!response) {
      return res.status(404).json({
        success: false,
        message: 'Response not found'
      });
    }

    const upvoteField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
    const oppositeField = voteType === 'upvote' ? 'downvotes' : 'upvotes';

    // Check if user already voted
    const hasVoted = response[upvoteField].includes(userId);
    const hasOppositeVote = response[oppositeField].includes(userId);

    if (hasVoted) {
      // Remove vote
      await responseModel.findByIdAndUpdate(responseId, {
        $pull: { [upvoteField]: userId }
      });
    } else {
      // Add vote and remove opposite vote if exists
      await responseModel.findByIdAndUpdate(responseId, {
        $addToSet: { [upvoteField]: userId },
        $pull: { [oppositeField]: userId }
      });
    }

    res.json({
      success: true,
      message: hasVoted ? 'Vote removed' : 'Vote added'
    });
  } catch (error) {
    console.error('Error voting on response:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
