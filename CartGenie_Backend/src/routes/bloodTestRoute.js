import express from 'express';
import multer from 'multer';
import BloodTest from '../models/BloodTest.js';
import { analyzeBloodTestImages } from '../agents/bloodTestAgent.js';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/analyze', upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No image files uploaded' });
    }

    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const analysisResult = await analyzeBloodTestImages(req.files);

    if (!analysisResult.success) {
        throw new Error(analysisResult.error || 'Analysis failed');
    }

    await BloodTest.deleteMany({ username: username });

    const fileNames = req.files.map(f => f.originalname).join(', ');

    const newRecord = new BloodTest({
      username: username,
      diagnosis: analysisResult.diagnosis,
      rawText: analysisResult.rawText, 
      fileName: fileNames 
    });

    await newRecord.save();

    res.json({
      success: true,
      data: {
        diagnosis: analysisResult.diagnosis,
        recordId: newRecord._id
      }
    });

  } catch (error) {
    console.error('Analysis/Save Error:', error.message);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal Server Error' 
    });
  }
});

router.get('/history/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const record = await BloodTest.findOne({ username });
        res.json({ success: true, data: record ? [record] : [] });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;