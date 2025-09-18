import crypto from 'crypto';

/**
 * Encryption utility class for secure contract storage
 */
export class EncryptionService {
  constructor() {
    this.algorithm = 'aes-256-gcm';
    this.keyLength = 32; // 256 bits
    this.ivLength = 16; // 128 bits
    this.tagLength = 16; // 128 bits
  }

  /**
   * Generate a random encryption key
   * @returns {string} Base64 encoded encryption key
   */
  generateKey() {
    return crypto.randomBytes(this.keyLength).toString('base64');
  }

  /**
   * Generate a random IV (Initialization Vector)
   * @returns {string} Base64 encoded IV
   */
  generateIV() {
    return crypto.randomBytes(this.ivLength).toString('base64');
  }

  /**
   * Encrypt data using AES-256-GCM
   * @param {string|Object} data - Data to encrypt
   * @param {string} key - Base64 encoded encryption key
   * @param {string} iv - Base64 encoded IV
   * @returns {Object} Encrypted data with auth tag
   */
  encrypt(data, key, iv) {
    try {
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
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   * @param {string} encryptedData - Hex encoded encrypted data
   * @param {string} key - Base64 encoded encryption key
   * @param {string} iv - Base64 encoded IV
   * @param {string} tag - Hex encoded authentication tag
   * @returns {Object} Decrypted data
   */
  decrypt(encryptedData, key, iv, tag) {
    try {
      const keyBuffer = Buffer.from(key, 'base64');
      const ivBuffer = Buffer.from(iv, 'base64');
      const tagBuffer = Buffer.from(tag, 'hex');
      
      const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
      decipher.setAAD(Buffer.from('contract-signature', 'utf8'));
      decipher.setAuthTag(tagBuffer);
      
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return JSON.parse(decrypted);
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Generate file hash for contract identification
   * @param {Buffer} fileBuffer - File buffer
   * @returns {string} SHA-256 hash
   */
  generateFileHash(fileBuffer) {
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  /**
   * Generate content hash for contract content comparison
   * @param {string} content - Contract content
   * @returns {string} SHA-256 hash
   */
  generateContentHash(content) {
    // Normalize content by removing extra whitespace and converting to lowercase
    const normalizedContent = content
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    
    return crypto.createHash('sha256').update(normalizedContent, 'utf8').digest('hex');
  }

  /**
   * Secure key derivation using PBKDF2
   * @param {string} password - Base password
   * @param {string} salt - Salt for key derivation
   * @returns {string} Derived key in base64
   */
  deriveKey(password, salt) {
    const saltBuffer = Buffer.from(salt, 'base64');
    return crypto.pbkdf2Sync(password, saltBuffer, 100000, this.keyLength, 'sha256').toString('base64');
  }

  /**
   * Generate a secure random salt
   * @returns {string} Base64 encoded salt
   */
  generateSalt() {
    return crypto.randomBytes(32).toString('base64');
  }
}

/**
 * Contract signature service for managing encrypted contract storage
 */
export class ContractSignatureService {
  constructor() {
    this.encryptionService = new EncryptionService();
  }

  /**
   * Create encrypted contract signature
   * @param {Object} contractData - Contract data to encrypt
   * @param {Object} analysisData - Analysis data to encrypt
   * @param {string} userId - User ID
   * @returns {Object} Encrypted signature data
   */
  createSignature(contractData, analysisData, userId) {
    const key = this.encryptionService.generateKey();
    const iv = this.encryptionService.generateIV();
    
    // Encrypt contract content
    const encryptedContent = this.encryptionService.encrypt(contractData, key, iv);
    
    // Encrypt analysis data
    const encryptedAnalysis = this.encryptionService.encrypt(analysisData, key, iv);
    
    return {
      key,
      iv,
      encryptedContent: encryptedContent.encrypted,
      contentTag: encryptedContent.tag,
      encryptedAnalysis: encryptedAnalysis.encrypted,
      analysisTag: encryptedAnalysis.tag
    };
  }

  /**
   * Decrypt contract signature
   * @param {Object} signature - Encrypted signature object
   * @returns {Object} Decrypted contract and analysis data
   */
  decryptSignature(signature) {
    const contractData = this.encryptionService.decrypt(
      signature.encryptedContent,
      signature.key,
      signature.iv,
      signature.contentTag
    );
    
    const analysisData = this.encryptionService.decrypt(
      signature.encryptedAnalysis,
      signature.key,
      signature.iv,
      signature.analysisTag
    );
    
    return {
      contractData,
      analysisData
    };
  }

  /**
   * Generate contract fingerprint for duplicate detection
   * @param {Buffer} fileBuffer - Original file buffer
   * @param {string} extractedText - Extracted text content
   * @returns {Object} Contract fingerprint
   */
  generateContractFingerprint(fileBuffer, extractedText) {
    const fileHash = this.encryptionService.generateFileHash(fileBuffer);
    const contentHash = this.encryptionService.generateContentHash(extractedText);
    
    return {
      fileHash,
      contentHash,
      fingerprint: this.encryptionService.generateFileHash(
        Buffer.from(fileHash + contentHash, 'utf8')
      )
    };
  }
}

// Export singleton instances
export const encryptionService = new EncryptionService();
export const contractSignatureService = new ContractSignatureService();
