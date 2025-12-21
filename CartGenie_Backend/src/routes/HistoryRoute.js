import express from 'express';
import ScanHistory from '../models/HistoryModel.js'; 
import ReceiptHistory from '../models/ReceiptHistoryModel.js'; 

const router = express.Router();

// ==========================================
// 1. נתיבים ספציפיים (חייבים להיות ראשונים!)
// ==========================================

// הוספת קבלה (חייב להיות לפני ה-GET הכללי)
router.post('/receipts/add', async (req, res) => {
    try {
      const { username, storeName, totalPrice, currency, itemCount, healthSummary } = req.body;
      
      const newReceipt = new ReceiptHistory({
        username, storeName, totalPrice, currency, itemCount, healthSummary
      });
  
      await newReceipt.save();
      res.json({ success: true, message: 'Receipt saved' });
    } catch (error) {
      console.error('Save receipt error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
});

// שליפת קבלות (חייב להיות לפני /:username)
router.get('/receipts/:username', async (req, res) => {
    try {
      const { username } = req.params;
      
      const receipts = await ReceiptHistory.find({ username })
        .sort({ scanDate: -1 })
        .limit(50);
  
      res.json({ success: true, data: receipts });
    } catch (error) {
      console.error('Fetch receipts error:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
});

// הוספת מוצר בודד
router.post('/add', async (req, res) => {
  try {
    const { username, productName, barcode, brand, aiRecommendation, aiReason } = req.body;
    
    const newScan = new ScanHistory({
      username, productName, barcode, brand, aiRecommendation, aiReason
    });

    await newScan.save();
    res.json({ success: true, message: 'Scan saved' });
  } catch (error) {
    console.error('Save product error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// ==========================================
// 2. נתיבים כלליים (חייבים להיות בסוף!)
// ==========================================

// מחיקת פריט (מנסה למחוק מוצר, אם לא מוצא מנסה למחוק קבלה)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // ניסיון 1: מחיקת מוצר
    const deletedProduct = await ScanHistory.findByIdAndDelete(id);
    if (deletedProduct) {
        return res.json({ success: true, message: 'Product scan deleted' });
    }

    // ניסיון 2: מחיקת קבלה (אם לא נמצא מוצר)
    const deletedReceipt = await ReceiptHistory.findByIdAndDelete(id);
    if (deletedReceipt) {
        return res.json({ success: true, message: 'Receipt deleted' });
    }

    // לא נמצא כלום
    res.status(404).json({ success: false, message: 'Item not found' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// שליפת היסטוריית מוצרים (Catch-All עבור username)
// ⚠️ זה חייב להיות הנתיב האחרון ברשימת ה-GET!
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;    
    const history = await ScanHistory.find({ username })
      .sort({ scannedAt: -1 })
      .limit(50);

    res.json({ success: true, data: history });
  } catch (error) {
    console.error('Fetch history error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;