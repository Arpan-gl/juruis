import mongoose from 'mongoose';

const responseSchema = new mongoose.Schema({
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  lawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  approach: {
    type: String,
    required: true,
    description: 'Brief description of the legal approach'
  },
  estimatedTime: {
    type: String,
    description: 'Estimated time to resolve the issue'
  },
  estimatedCost: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    description: String
  },
  qualifications: [String],
  experience: {
    years: Number,
    description: String
  },
  upvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  downvotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isHired: {
    type: Boolean,
    default: false
  },
  hireDate: Date,
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Accepted', 'Rejected', 'In Progress', 'Completed']
  }
}, {
  timestamps: true
});

// Index for better performance
responseSchema.index({ issue: 1, lawyer: 1, status: 1 });

export const responseModel = mongoose.model('Response', responseSchema);
