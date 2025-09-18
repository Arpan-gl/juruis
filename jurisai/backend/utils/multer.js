import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Ensure uploads directory exists
const uploadsDir = path.resolve(process.cwd(), 'upload');
try {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
} catch (e) {
  // Fallback: no-op; multer will throw later if path invalid
}

// Shared multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname || `upload_${Date.now()}`;
    const targetPath = path.join(uploadsDir, safeName);
    try {
      if (fs.existsSync(targetPath)) {
        // Delete any existing file with same name before writing new one
        fs.unlinkSync(targetPath);
      }
    } catch (err) {
      // If delete fails, we'll still attempt to write; surface error via cb if needed
    }
    cb(null, safeName);
  }
});

const allowedMimeTypes = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const fileFilter = (req, file, cb) => {
  if (
    allowedMimeTypes.includes(file.mimetype) ||
    file.originalname.endsWith('.pdf') ||
    file.originalname.endsWith('.docx') ||
    file.originalname.endsWith('.txt')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOCX, and TXT files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});

export const uploadSingleFile = (fieldName = 'file') => upload.single(fieldName);

export const getUploadedFilePath = (file) => {
  if (!file) return null;
  // Multer diskStorage provides path
  return file.path || path.join(uploadsDir, file.filename);
};

export const deleteFileIfExists = (filePath) => {
  if (!filePath) return;
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (e) {
    // swallow cleanup errors
  }
};

export default upload;


