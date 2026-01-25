import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp'; // 👈 הוספנו את Sharp לעיבוד התמונה

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

    const originalImagePath = req.file.path;
    // ניצור נתיב לקובץ התמונה המעובד
    const processedImagePath = `${originalImagePath}_processed.png`;

    // 2. עיבוד מקדים של התמונה (קריטי לדיוק)
    // הופך לשחור-לבן, מחדד, ומעלה קונטרסט כדי שהמספרים יבלטו
    await sharp(originalImagePath)
      .grayscale()
      .linear(1.5, -0.2) // הגדלת קונטרסט
      .threshold(128)    // הכל נהיה או שחור מוחלט או לבן מוחלט
      .sharpen()
      .toFile(processedImagePath);

    // 3. הרצת Tesseract על התמונה המעובדת עם הגדרות למספרים בלבד
    const { data: { text } } = await Tesseract.recognize(processedImagePath, 'eng', {
      tessedit_char_whitelist: '0123456789 \n', // 👈 מתעלם מאותיות, מחפש רק מספרים
      tessedit_pageseg_mode: Tesseract.PSM.SINGLE_BLOCK, // 👈 מותאם לקריאת רשימות
      oem: 1, // מנוע LSTM מדויק
    });

    // 4. מחיקת הקבצים הזמניים מהשרת (גם המקורי וגם המעובד)
    fs.unlink(originalImagePath, () => {});
    fs.unlink(processedImagePath, () => {});

    // 5. החזרת התשובה
    res.json({
      success: true,
      data: {
        rawText: text,
        extractedItems: parseBarcodesOnly(text) 
      }
    });

  } catch (error) {
    console.error('❌ OCR Error:', error);
    
    // ניקוי הקבצים גם במקרה של שגיאה
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, () => {});
        fs.unlink(`${req.file.path}_processed.png`, () => {});
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
 */
const parseBarcodesOnly = (text) => {
  // Regex שמחפש רצפים של 12 עד 14 ספרות (תקני ברקוד)
  const barcodeRegex = /\b\d{12,14}\b/g;
  
  const matches = text.match(barcodeRegex);
  
  if (!matches) return [];

  // החזרת מערך של מספרים ייחודיים (ללא כפילויות)
  return [...new Set(matches)];
};