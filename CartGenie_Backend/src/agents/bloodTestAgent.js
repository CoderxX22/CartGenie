import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import Tesseract from 'tesseract.js';
import { fromPath } from 'pdf2pic';
import fs from 'fs';
import path from 'path';
import os from 'os';

// ייבוא pdf-parse לקריאה מהירה
const pdfLib = require('pdf-parse');
let pdf;
if (typeof pdfLib === 'function') pdf = pdfLib;
else if (pdfLib && typeof pdfLib.default === 'function') pdf = pdfLib.default;

const RULES = {
  high_cholesterol: { keywords: ['LDL', 'Cholesterol', 'לורטסלוכ'], threshold: 100, conditionName: 'High Cholesterol' },
  diabetes: { keywords: ['Glucose', 'HbA1C', 'ןיבולגומה', 'Hemoglobin A1C'], thresholds: { 'Glucose': 100, 'HbA1C': 5.7 }, conditionName: 'Type 2 Diabetes' },
  high_blood_pressure: { keywords: ['Sodium', 'Na ', 'ןרתנ', 'Natrium'], threshold: 145, sanityLimit: 165, conditionName: 'High Blood Pressure (Sodium)' }
};

export const analyzeBloodTestImages = async (filesArray) => {
  console.log(`[Agent] Starting analysis for ${filesArray.length} files...`);
  let extractedText = "";
  let tempFilesToDelete = [];

  try {
    for (const file of filesArray) {
        
        // --- תרחיש A: הקובץ הוא PDF (אנחנו נמיר אותו לתמונות בשרת) ---
        if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
            console.log(`[Agent] Processing PDF: ${file.originalname}`);
            
            // 1. שמירת ה-PDF זמנית בדיסק
            const tempPdfPath = path.join(os.tmpdir(), `temp_${Date.now()}.pdf`);
            fs.writeFileSync(tempPdfPath, file.buffer);
            tempFilesToDelete.push(tempPdfPath);

            // 2. הגדרת ההמרה (דורש GraphicsMagick + Ghostscript שיהיו לנו ב-Docker)
            const options = {
                density: 300,
                saveFilename: `page_${Date.now()}`,
                savePath: os.tmpdir(),
                format: "png",
                width: 2000,
                height: 2000
            };

            const convert = fromPath(tempPdfPath, options);
            
            // המרת 3 עמודים ראשונים
            for (let page = 1; page <= 3; page++) {
                try {
                    console.log(`[Agent] Converting PDF page ${page} to image...`);
                    const result = await convert(page, { responseType: "path" }); // מקבלים נתיב לקובץ התמונה
                    
                    if (result.path) {
                        tempFilesToDelete.push(result.path);
                        // OCR על התמונה שנוצרה
                        const imgBuffer = fs.readFileSync(result.path);
                        const { data: { text } } = await Tesseract.recognize(imgBuffer, 'eng+heb', { langPath: process.cwd(), gzip: false });
                        extractedText += text + " ";
                    }
                } catch (err) { break; } // נגמרו העמודים
            }
        } 
        
        // --- תרחיש B: הקובץ הוא כבר תמונה ---
        else {
             console.log(`[Agent] Processing Image: ${file.originalname}`);
             const { data: { text } } = await Tesseract.recognize(file.buffer, 'eng+heb', { langPath: process.cwd(), gzip: false });
             extractedText += text + " ";
        }
    }

    // ניתוח הטקסט הסופי
    const cleanText = extractedText.replace(/\n/g, ' ').replace(/\s+/g, ' '); 
    console.log(`[Agent] Final text length: ${cleanText.length}`);
    
    if (cleanText.length < 10) throw new Error("Could not extract text.");

    const { diagnosis, findingsCount } = analyzeTextRules(cleanText);
    
    if (findingsCount === 0) throw new Error("Could not detect blood test values.");

    return { success: true, diagnosis: diagnosis.length > 0 ? diagnosis : ['does not ill'], rawText: extractedText.substring(0, 500) };

  } catch (error) {
    console.error('❌ Analysis Error:', error.message);
    throw error; 
  } finally {
      // ניקוי קבצים זמניים
      tempFilesToDelete.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
  }
};

// ... (העתק את פונקציית analyzeTextRules מהקודים הקודמים, היא לא השתנתה)
function analyzeTextRules(text) {
  const diagnosisSet = new Set();
  let findingsCount = 0; 
  if (text.match(/(?:LDL|Cholesterol|לורטסלוכ)/i)) {
      const match = text.match(/LDL.*?(\d{2,3})/i);
      if (match) { findingsCount++; if (parseFloat(match[1]) > RULES.high_cholesterol.threshold) diagnosisSet.add(RULES.high_cholesterol.conditionName); }
  }
  if (text.match(/Glucose/i)) {
      const match = text.match(/Glucose.*?(\d{2,3})/i);
      if (match) { findingsCount++; if (parseFloat(match[1]) > RULES.diabetes.thresholds.Glucose) diagnosisSet.add(RULES.diabetes.conditionName); }
  }
  if (text.match(/HbA1C/i)) {
      const match = text.match(/HbA1C.*?(\d{1,2}(?:\.\d)?)/i);
      if (match) { findingsCount++; if (parseFloat(match[1]) > RULES.diabetes.thresholds.HbA1C) diagnosisSet.add(RULES.diabetes.conditionName); }
  }
  if (text.match(/(?:Sodium|Na\s|ןרנת)/i)) {
      const match = text.match(/(?:Sodium|Na\s|ןרתנ).*?(\d{3})/i);
      if (match) { const val = parseFloat(match[1]); if (val < 200) { findingsCount++; if (val > RULES.high_blood_pressure.threshold && val < RULES.high_blood_pressure.sanityLimit) diagnosisSet.add(RULES.high_blood_pressure.conditionName); } }
  }
  return { diagnosis: Array.from(diagnosisSet), findingsCount };
}