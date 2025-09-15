import mongoose from 'mongoose';

const hireSchema = new mongoose.Schema({
  issue: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Issue',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lawyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  response: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Response',
    required: true
  },
  contractTerms: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    },
    paymentSchedule: {
      type: String,
      enum: ['Upfront', 'Milestone', 'Upon Completion'],
      default: 'Upfront'
    },
    milestones: [{
      description: String,
      amount: Number,
      dueDate: Date,
      isCompleted: {
        type: Boolean,
        default: false
      }
    }]
  },
  status: {
    type: String,
    default: 'Pending',
    enum: ['Pending', 'Active', 'Completed', 'Cancelled', 'Disputed']
  },
  startDate: Date,
  endDate: Date,
  actualCost: Number,
  clientRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: Date
  },
  lawyerRating: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    review: String,
    date: Date
  },
  communication: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    attachments: [String]
  }]
}, {
  timestamps: true
});

// Index for better performance
hireSchema.index({ client: 1, lawyer: 1, status: 1 });

export const hireModel = mongoose.model('Hire', hireSchema);
