import mongoose from 'mongoose';
import crypto from 'crypto';

const contractSignatureSchema = new mongoose.Schema({
  // File identification
  fileHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  fileName: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  
  // User information
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Encrypted contract data
  encryptedContent: {
    type: String,
    required: true
  },
  encryptedAnalysis: {
    type: String,
    required: true
  },
  
  // Encryption metadata
  encryptionKey: {
    type: String,
    required: true
  },
  iv: {
    type: String,
    required: true
  },
  contentTag: {
    type: String,
    required: true
  },
  analysisTag: {
    type: String,
    required: true
  },
  
  // Analysis metadata
  analysisDate: {
    type: Date,
    default: Date.now
  },
  analysisVersion: {
    type: String,
    default: '1.0'
  },
  
  // Access tracking
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for better performance
contractSignatureSchema.index({ fileHash: 1, uploadedBy: 1 });
contractSignatureSchema.index({ uploadedBy: 1, status: 1 });
contractSignatureSchema.index({ analysisDate: -1 });

// Static method to generate file hash
contractSignatureSchema.statics.generateFileHash = function(fileBuffer) {
  return crypto.createHash('sha256').update(fileBuffer).digest('hex');
};

        // Static method to encrypt data
        contractSignatureSchema.statics.encryptData = function(data, key, iv) {
          const keyBuffer = Buffer.from(key, 'base64');
          const ivBuffer = Buffer.from(iv, 'base64');
          
          const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, ivBuffer);
          cipher.setAAD(Buffer.from('contract-signature', 'utf8'));
          
          let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
          encrypted += cipher.final('hex');
          
          const tag = cipher.getAuthTag();
          
          return {
            encrypted,
            tag: tag.toString('hex')
          };
        };

        // Static method to decrypt data
        contractSignatureSchema.statics.decryptData = function(encryptedData, key, iv, tag) {
          const keyBuffer = Buffer.from(key, 'base64');
          const ivBuffer = Buffer.from(iv, 'base64');
          const tagBuffer = Buffer.from(tag, 'hex');
          
          const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
          decipher.setAAD(Buffer.from('contract-signature', 'utf8'));
          decipher.setAuthTag(tagBuffer);
          
          let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
          decrypted += decipher.final('utf8');
          
          return JSON.parse(decrypted);
        };

// Instance method to increment access count
contractSignatureSchema.methods.incrementAccess = function() {
  this.accessCount += 1;
  this.lastAccessed = new Date();
  return this.save();
};

// Instance method to get decrypted analysis
contractSignatureSchema.methods.getDecryptedAnalysis = function() {
  try {
    return this.constructor.decryptData(this.encryptedAnalysis, this.encryptionKey, this.iv, this.analysisTag);
  } catch (error) {
    throw new Error('Failed to decrypt analysis data');
  }
};

// Instance method to get decrypted content
contractSignatureSchema.methods.getDecryptedContent = function() {
  try {
    return this.constructor.decryptData(this.encryptedContent, this.encryptionKey, this.iv, this.contentTag);
  } catch (error) {
    throw new Error('Failed to decrypt content data');
  }
};

export const contractSignatureModel = mongoose.model('ContractSignature', contractSignatureSchema);
