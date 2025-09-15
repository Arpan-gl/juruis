import mongoose from 'mongoose';

const lawyerApplicationSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  
  // Application Details
  applicationDate: {
    type: Date,
    default: Date.now
  },
  reviewDate: Date,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Professional Information
  barNumber: {
    type: String,
    required: true
  },
  barAssociation: {
    type: String,
    required: true
  },
  practiceAreas: [{
    type: String,
    required: true
  }],
  yearsOfExperience: {
    type: Number,
    required: true
  },
  lawSchool: {
    type: String,
    required: true
  },
  graduationYear: {
    type: Number,
    required: true
  },
  
  // Contact Information
  phone: {
    type: String,
    required: true
  },
  officeAddress: {
    street: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    zipCode: {
      type: String,
      required: true
    },
    country: {
      type: String,
      required: true
    }
  },
  website: String,
  
  // Professional Documents
  documents: [{
    type: {
      type: String,
      enum: ['bar_license', 'law_degree', 'professional_certification', 'other'],
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    },
    adminNotes: String
  }],
  
  // Specializations and Languages
  specializations: [String],
  languages: [String],
  
  // Professional Summary
  bio: {
    type: String,
    required: true,
    minlength: 100,
    maxlength: 1000
  },
  achievements: [String],
  
  // References
  references: [{
    name: String,
    title: String,
    organization: String,
    email: String,
    phone: String,
    relationship: String
  }],
  
  // Review Process
  adminNotes: String,
  rejectionReason: String,
  verificationScore: {
    type: Number,
    min: 0,
    max: 100
  },
  
  // Application History
  history: [{
    action: {
      type: String,
      enum: ['submitted', 'review_started', 'document_verified', 'approved', 'rejected', 'reopened']
    },
    date: {
      type: Date,
      default: Date.now
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Index for better performance
lawyerApplicationSchema.index({ 
  applicant: 1, 
  status: 1, 
  applicationDate: -1,
  'officeAddress.state': 1,
  'practiceAreas': 1
});

export const lawyerApplicationModel = mongoose.model('LawyerApplication', lawyerApplicationSchema);
