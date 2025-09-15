import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ["user", "lawyer", "admin"],
    default: "user"
  },
  // Lawyer-specific fields
  lawyerProfile: {
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    applicationDate: Date,
    verificationDate: Date,
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectionReason: String,
    
    // Professional Information
    barNumber: String,
    barAssociation: String,
    practiceAreas: [String],
    yearsOfExperience: Number,
    lawSchool: String,
    graduationYear: Number,
    
    // Contact Information
    phone: String,
    officeAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    website: String,
    
    // Professional Documents
    documents: [{
      type: {
        type: String,
        enum: ['bar_license', 'law_degree', 'professional_certification', 'other']
      },
      filename: String,
      originalName: String,
      uploadDate: Date,
      verified: {
        type: Boolean,
        default: false
      }
    }],
    
    // Specializations
    specializations: [String],
    languages: [String],
    
    // Professional Summary
    bio: String,
    achievements: [String],
    
    // Verification Notes
    adminNotes: String
  },
  // User preferences and settings
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    pushNotifications: {
      type: Boolean,
      default: true
    }
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  uploader: [String]
}, {
  timestamps: true
});

// Index for better performance
userSchema.index({ email: 1, username: 1, role: 1, 'lawyerProfile.verificationStatus': 1 });

export const userModel = mongoose.model('User', userSchema);