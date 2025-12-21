import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';

/**
 * פונקציה שמקבלת תמונה ומחזירה את הטקסט שבה
 * POST /api/ocr/scan
 */
export const scanReceipt = async (req, res) => {
  try {
    // 1. בדיקה אם נשלח קובץ
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No image file uploaded' 
      });
    }

    const imagePath = req.file.path;

    // 2. הרצת Tesseract
    const { data: { text } } = await Tesseract.recognize(imagePath, 'eng', {
    });

    // 3. מחיקת הקובץ הזמני מהשרת (ניקוי)
    fs.unlink(imagePath, (err) => {
      if (err) console.error('Error deleting temp file:', err);
    });

    // 4. החזרת התשובה
    res.json({
      success: true,
      data: {
        rawText: text,
        // שימוש בפונקציה החדשה לחילוץ ברקודים בלבד
        extractedItems: parseBarcodesOnly(text) 
      }
    });

  } catch (error) {
    console.error('❌ OCR Error:', error);
    // ניסיון מחיקה גם במקרה שגיאה
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {});
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'Failed to process image',
      error: error.message 
    });
  }
};

/**
 * פונקציה לחילוץ ברקודים בלבד מתוך הטקסט
 * מחפשת רצפים של ספרות באורך 8 עד 14 תווים
 */
const parseBarcodesOnly = (text) => {
  // Regex שמוצא רצפים של ספרות (בין 12 ל-14 ספרות)
  // \b מבטיח שאנחנו לוקחים מספר שלם ולא חלק ממספר ארוך יותר
  const barcodeRegex = /\b\d{12,14}\b/g;
  
  const matches = text.match(barcodeRegex);
  
  if (!matches) return [];

  // החזרת מערך של מספרים ייחודיים (ללא כפילויות)
  return [...new Set(matches)];
};