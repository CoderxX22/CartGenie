import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import Tesseract from 'tesseract.js';
import { fromPath } from 'pdf2pic';
import fs from 'fs';
import path from 'path';
import os from 'os';

// --- ייבוא בטוח של pdf-parse ---
const pdfLib = require('pdf-parse');
let pdf;
if (typeof pdfLib === 'function') pdf = pdfLib;
else if (pdfLib && typeof pdfLib.default === 'function') pdf = pdfLib.default;

// ==========================================
// חוקים (Rules Engine)
// ==========================================
const RULES = {
  high_cholesterol: {
    keywords: ['LDL', 'Cholesterol', 'לורטסלוכ'], 
    threshold: 100,
    conditionName: 'High Cholesterol'
  },
  diabetes: {
    keywords: ['Glucose', 'HbA1C', 'ןיבולגומה', 'Hemoglobin A1C'],
    thresholds: { 'Glucose': 100, 'HbA1C': 5.7 },
    conditionName: 'Type 2 Diabetes'
  },
  high_blood_pressure: {
    keywords: ['Sodium', 'Na ', 'ןרתנ', 'Natrium'],
    threshold: 145, 
    sanityLimit: 165,
    conditionName: 'High Blood Pressure (Sodium)'
  }
};

/**
 * פונקציה ראשית לניתוח הקובץ
 */
export const analyzeBloodTestImage = async (fileBuffer, mimeType) => {
  let tempPdfPath = null;
  let generatedImages = [];

  try {
    if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error("❌ Error: Received empty file buffer.");
    }

    let extractedText = "";

    // --- נסיון ראשון: קריאה מהירה (pdf-parse) ---
    if (mimeType === 'application/pdf') {
      try {
          const data = await pdf(fileBuffer);
          extractedText = data.text;
      } catch (e) {
          console.warn("Fast parsing failed, trying OCR...");
      }
    } 

    // --- נסיון שני: גיבוי OCR ---
    if (mimeType.startsWith('image/') || extractedText.trim().length < 20) {      
      if (mimeType === 'application/pdf') {
          const tempFileName = `temp_${Date.now()}.pdf`;
          tempPdfPath = path.join(os.tmpdir(), tempFileName);
          fs.writeFileSync(tempPdfPath, fileBuffer);
          
          const options = {
            density: 300,
            saveFilename: `page_${Date.now()}`,
            savePath: os.tmpdir(),
            format: "png",
            width: 2000,
            height: 2000
          };

          const convert = fromPath(tempPdfPath, options);          
          for (let page = 1; page <= 3; page++) {
            try {
                const result = await convert(page, { responseType: "image" });
                if (result.path) generatedImages.push(result.path);
            } catch (err) { break; }
          }
      } 

      for (const imgPath of generatedImages) {
          const imgBuffer = fs.readFileSync(imgPath);
          const { data: { text } } = await Tesseract.recognize(imgBuffer, 'eng+heb');
          extractedText += text + " ";
      }
    }

    // --- שלב ג: ניתוח הטקסט ---
    const cleanText = extractedText.replace(/\n/g, ' ').replace(/\s+/g, ' '); 
    
    if (cleanText.length < 10) {
        throw new Error("Could not extract text. File might be empty or unreadable.");
    }

    // 👇 כאן השינוי: קבלת גם האבחון וגם כמות הממצאים
    const { diagnosis, findingsCount } = analyzeTextRules(cleanText);
    
    // 🔥 בדיקת תקינות: אם לא מצאנו שום ערך מספרי רלוונטי
    if (findingsCount === 0) {
        throw new Error("Could not detect any blood test values (Glucose, LDL, Sodium, etc). Please check the file quality or format.");
    }

    return {
      success: true,
      diagnosis: diagnosis.length > 0 ? diagnosis : ['does not ill'],
      rawText: extractedText.substring(0, 500)
    };

  } catch (error) {
    console.error('❌ Analysis Error:', error.message);
    // זריקת השגיאה כדי שהקונטרולר יוכל לשלוח אותה ללקוח
    throw error; 
  } finally {
      // Cleanup
      try {
          if (tempPdfPath && fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
          for (const imgPath of generatedImages) {
              if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          }
      } catch (e) {}
  }
};

/**
 * מנוע החוקים - מעודכן לספור ממצאים
 */
function analyzeTextRules(text) {
  const diagnosisSet = new Set();
  let findingsCount = 0; // מונה כמה ערכים תקינים מצאנו סה"כ
  
  // 1. בדיקת LDL
  // בודק אם המילה קיימת
  if (text.match(/(?:LDL|Cholesterol|לורטסלוכ)/i)) {
      // בודק אם יש מספר צמוד אליה
      const match = text.match(/LDL.*?(\d{2,3})/i);
      if (match) {
          findingsCount++; // מצאנו ערך! (גם אם הוא תקין)
          if (parseFloat(match[1]) > RULES.high_cholesterol.threshold) {
              diagnosisSet.add(RULES.high_cholesterol.conditionName);
          }
      }
  }

  // 2. בדיקת גלוקוז
  if (text.match(/Glucose/i)) {
      const glucoseMatch = text.match(/Glucose.*?(\d{2,3})/i);
      if (glucoseMatch) {
          findingsCount++;
          if (parseFloat(glucoseMatch[1]) > RULES.diabetes.thresholds.Glucose) {
              diagnosisSet.add(RULES.diabetes.conditionName);
          }
      }
  }

  // 3. בדיקת HbA1C
  if (text.match(/HbA1C/i)) {
      const hba1cMatch = text.match(/HbA1C.*?(\d{1,2}(?:\.\d)?)/i);
      if (hba1cMatch) {
          findingsCount++;
          if (parseFloat(hba1cMatch[1]) > RULES.diabetes.thresholds.HbA1C) {
              diagnosisSet.add(RULES.diabetes.conditionName);
          }
      }
  }

  // 4. בדיקת נתרן
  if (text.match(/(?:Sodium|Na\s|ןרנת)/i)) {
      const sodiumMatch = text.match(/(?:Sodium|Na\s|ןרתנ).*?(\d{3})/i);
      if (sodiumMatch) {
          const val = parseFloat(sodiumMatch[1]);
          // סופרים רק אם המספר הגיוני (פחות מ-200) כדי לא לספור רעשים
          if (val < 200) {
              findingsCount++;
              if (val > RULES.high_blood_pressure.threshold && val < RULES.high_blood_pressure.sanityLimit) {
                  diagnosisSet.add(RULES.high_blood_pressure.conditionName);
              }
          }
      }
  }

  return { 
      diagnosis: Array.from(diagnosisSet), 
      findingsCount 
  };
}