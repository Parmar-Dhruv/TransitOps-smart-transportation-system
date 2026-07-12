import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ApiError } from '../shared/errors/apiError.js';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// Resolve the uploads directory relative to this file's location
const uploadsDir = new URL('../../uploads/profile-images', import.meta.url).pathname;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(ApiError.badRequest('Invalid file type. Only JPG, PNG, and WEBP images are allowed.'), false);
  }
};

export const uploadProfileImage = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
  fileFilter
}).single('photo');

/**
 * Wrap multer into a promise so it can be used with async/await in controllers
 */
export const handleProfileUpload = (req, res) => {
  return new Promise((resolve, reject) => {
    uploadProfileImage(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return reject(ApiError.badRequest('File too large. Maximum allowed size is 5 MB.'));
        }
        return reject(err);
      }
      resolve(req.file);
    });
  });
};
