import express from 'express';
import multer from 'multer';
import BloodTest from '../models/BloodTest.js';
import { analyzeBloodTestImages } from '../agents/bloodTestAgent.js';

const router = express.Router();

const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }
});

router.post('/analyze', upload.array('bloodTestFiles', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    console.log(`[Route] Received ${req.files.length} images for analysis`);

    const analysisResult = await analyzeBloodTestImages(req.files);

    await BloodTest.deleteMany({ username: username });

    const newRecord = new BloodTest({
      username: username,
      diagnosis: analysisResult.diagnosis,
      rawText: analysisResult.rawText, 
      fileName: `Multi-upload (${req.files.length} files)`
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
    console.error('❌ Analysis/Save Error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Internal Server Error' 
    });
  }
});

export default router;