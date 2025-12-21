import express from 'express';
import multer from 'multer';
import BloodTest from '../models/BloodTest.js';
import { analyzeBloodTestImage } from '../agents/bloodTestAgent.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

/**
 * POST /api/blood-test/analyze
 * מוחק בדיקות קודמות של המשתמש -> מנתח חדש -> שומר
 */
router.post('/analyze', upload.single('bloodTestFile'), async (req, res) => {
  try {
    // 1. בדיקת קיום קובץ
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // 2. קבלת שם המשתמש
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }


    // 3. ביצוע הניתוח
    const analysisResult = await analyzeBloodTestImage(req.file.buffer, req.file.mimetype);

    // --- שינוי כאן: מחיקת היסטוריה ישנה ---
    // 3.5 מחיקת כל הרשומות הקיימות עבור המשתמש הזה לפני השמירה
    await BloodTest.deleteMany({ username: username });
    // -------------------------------------

    // 4. שמירה ב-MongoDB (כעת זו תהיה הרשומה היחידה של המשתמש)
    const newRecord = new BloodTest({
      username: username,
      diagnosis: analysisResult.diagnosis,
      rawText: analysisResult.rawText, 
      fileName: req.file.originalname
    });

    await newRecord.save();
    // 5. החזרת תשובה לקליינט
    res.json({
      success: true,
      data: {
        diagnosis: analysisResult.diagnosis,
        recordId: newRecord._id
      }
    });

  } catch (error) {
    console.error('❌ Analysis/Save Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal Server Error' 
    });
  }
});

// שליפת הבדיקה האחרונה (והיחידה)
router.get('/history/:username', async (req, res) => {
    try {
        const { username } = req.params;
        // מכיוון שיש רק אחת, אפשר להשתמש ב-findOne
        const record = await BloodTest.findOne({ username });
        res.json({ success: true, data: record ? [record] : [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;