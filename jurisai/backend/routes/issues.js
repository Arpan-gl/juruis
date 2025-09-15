import express from 'express';
import { issueModel } from '../models/issue.models.js';
import { verifyUser } from '../middleware.js';

const router = express.Router();

// Create a new legal issue
router.post('/', verifyUser, async (req, res) => {
  try {
    const { title, description, category, urgency, budget, location, tags, isAnonymous } = req.body;
    
    if (!title || !description || !category || !urgency) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, category, and urgency are required'
      });
    }

    const newIssue = await issueModel.create({
      title,
      description,
      category,
      urgency,
      author: req.user._id,
      budget,
      location,
      tags,
      isAnonymous
    });

    await newIssue.populate('author', 'username email');

    res.status(201).json({
      success: true,
      message: 'Issue posted successfully',
      data: newIssue
    });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get all issues with pagination and filters
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (search) {
      filter.$text = { $search: search };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;
    
    const issues = await issueModel.find(filter)
      .populate('author', 'username email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await issueModel.countDocuments(filter);

    res.json({
      success: true,
      data: issues,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get a specific issue by ID
router.get('/:id', async (req, res) => {
  try {
    const issue = await issueModel.findById(req.params.id)
      .populate('author', 'username email')
      .lean();

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Increment view count
    await issueModel.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

    res.json({
      success: true,
      data: issue
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update an issue
router.put('/:id', verifyUser, async (req, res) => {
  try {
    const issue = await issueModel.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user is the author
    if (issue.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own issues'
      });
    }

    const updatedIssue = await issueModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('author', 'username email');

    res.json({
      success: true,
      message: 'Issue updated successfully',
      data: updatedIssue
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete an issue
router.delete('/:id', verifyUser, async (req, res) => {
  try {
    const issue = await issueModel.findById(req.params.id);
    
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    // Check if user is the author
    if (issue.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own issues'
      });
    }

    await issueModel.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Issue deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting issue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Vote on an issue
router.post('/:id/vote', verifyUser, async (req, res) => {
  try {
    const { voteType } = req.body; // 'upvote' or 'downvote'
    const issueId = req.params.id;
    const userId = req.user._id;

    if (!['upvote', 'downvote'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vote type'
      });
    }

    const issue = await issueModel.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        success: false,
        message: 'Issue not found'
      });
    }

    const upvoteField = voteType === 'upvote' ? 'upvotes' : 'downvotes';
    const oppositeField = voteType === 'upvote' ? 'downvotes' : 'upvotes';

    // Check if user already voted
    const hasVoted = issue[upvoteField].includes(userId);
    const hasOppositeVote = issue[oppositeField].includes(userId);

    if (hasVoted) {
      // Remove vote
      await issueModel.findByIdAndUpdate(issueId, {
        $pull: { [upvoteField]: userId }
      });
    } else {
      // Add vote and remove opposite vote if exists
      await issueModel.findByIdAndUpdate(issueId, {
        $addToSet: { [upvoteField]: userId },
        $pull: { [oppositeField]: userId }
      });
    }

    res.json({
      success: true,
      message: hasVoted ? 'Vote removed' : 'Vote added'
    });
  } catch (error) {
    console.error('Error voting on issue:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
