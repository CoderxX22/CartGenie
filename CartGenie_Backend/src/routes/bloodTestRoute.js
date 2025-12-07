import express from 'express';
import multer from 'multer';
import { analyzeBloodTestImage } from '../agents/bloodTestAgent.js'; // ה-Agent שיצרנו קודם

const router = express.Router();

// הגדרת Multer לשמירה בזיכרון (כדי שנוכל לשלוח ישר ל-Gemini)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ה-Endpoint האמיתי
router.post('/analyze', upload.single('bloodTestFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log(`📡 Server: Received file ${req.file.originalname}, sending to Gemini...`);

    // שליחה ל-Agent (הקוד שתיקנו קודם עם ה-Retry)
    const result = await analyzeBloodTestImage(req.file.buffer, req.file.mimetype);

    console.log('✅ Server: Analysis complete, sending results to app.');
    res.json({ success: true, data: result });

  } catch (error) {
    console.error('❌ Server Error:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;