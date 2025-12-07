import express from 'express';
import multer from 'multer';
import path from 'path';
import { scanReceipt } from '../contollers/ocrController.js';

const router = express.Router();
const FILR_SIZE = 10 * 1024 * 1024;

// הגדרת Multer לשמירת קבצים זמנית בתיקיית 'uploads'
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: FILR_SIZE }, // הגבלת גודל ל-10MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images (jpeg, jpg, png) are allowed!'));
  }
});

// הנתיב: POST /api/ocr/scan
// upload.single('receiptImage') אומר שאנחנו מצפים לשדה בשם receiptImage
router.post('/scan', upload.single('receiptImage'), scanReceipt);

export default router;