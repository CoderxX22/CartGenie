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
  
  console.log(`[Agent] Starting analysis for type: ${mimeType}, size: ${fileBuffer.length}`);

  try {
    if (!fileBuffer || fileBuffer.length === 0) {
        throw new Error("❌ Error: Received empty file buffer.");
    }

    let extractedText = "";

    // --- נסיון ראשון: קריאה מהירה (pdf-parse) ---
    if (mimeType === 'application/pdf') {
      try {
          console.log("[Agent] Trying fast PDF parse...");
          const data = await pdf(fileBuffer);
          extractedText = data.text;
          console.log(`[Agent] PDF parse result length: ${extractedText.length}`);
      } catch (e) {
          console.warn("[Agent] Fast parsing failed, trying OCR...", e.message);
      }
    } 

    // --- נסיון שני: גיבוי OCR ---
    if (mimeType.startsWith('image/') || extractedText.trim().length < 20) {      
      console.log("[Agent] Starting OCR process...");
      
      // המרה מ-PDF לתמונה (אם צריך)
      if (mimeType === 'application/pdf') {
          // ⚠️ הערה חשובה: pdf2pic דורש GraphicsMagick ו-Ghostscript
          // אם הם לא מותקנים בשרת Azure, החלק הזה ייכשל והקוד יילך ל-catch למטה.
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
            } catch (err) { 
                console.warn(`[Agent] Page ${page} conversion failed:`, err.message);
                break; 
            }
          }
      } else {
        // אם זו תמונה רגילה שהגיעה מהלקוח, נשמור אותה זמנית לדיסק בשביל Tesseract
        const tempImgName = `img_${Date.now()}.png`;
        const tempImgPath = path.join(os.tmpdir(), tempImgName);
        fs.writeFileSync(tempImgPath, fileBuffer);
        generatedImages.push(tempImgPath);
      }

      // הרצת Tesseract
      for (const imgPath of generatedImages) {
          console.log(`[Agent] Running Tesseract on: ${imgPath}`);
          const imgBuffer = fs.readFileSync(imgPath);
          
          // 🔥 תיקון קריטי ל-Azure: שימוש בקבצי שפה מקומיים 🔥
          const { data: { text } } = await Tesseract.recognize(imgBuffer, 'eng+heb', {
              langPath: process.cwd(), // מחפש את הקבצים בתיקייה הראשית (/home/site/wwwroot)
              gzip: false // הקבצים שלך הם .traineddata ולא .gz
          });
          
          extractedText += text + " ";
      }
    }

    // --- שלב ג: ניתוח הטקסט ---
    const cleanText = extractedText.replace(/\n/g, ' ').replace(/\s+/g, ' '); 
    console.log(`[Agent] Final text length: ${cleanText.length}`);
    
    if (cleanText.length < 10) {
        throw new Error("Could not extract text. File might be empty or unreadable (check if Ghostscript is installed for PDF).");
    }

    const { diagnosis, findingsCount } = analyzeTextRules(cleanText);
    console.log(`[Agent] Findings found: ${findingsCount}, Diagnosis: ${diagnosis}`);
    
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
 * מנוע החוקים
 */
function analyzeTextRules(text) {
  const diagnosisSet = new Set();
  let findingsCount = 0; 
  
  if (text.match(/(?:LDL|Cholesterol|לורטסלוכ)/i)) {
      const match = text.match(/LDL.*?(\d{2,3})/i);
      if (match) {
          findingsCount++; 
          if (parseFloat(match[1]) > RULES.high_cholesterol.threshold) {
              diagnosisSet.add(RULES.high_cholesterol.conditionName);
          }
      }
  }

  if (text.match(/Glucose/i)) {
      const glucoseMatch = text.match(/Glucose.*?(\d{2,3})/i);
      if (glucoseMatch) {
          findingsCount++;
          if (parseFloat(glucoseMatch[1]) > RULES.diabetes.thresholds.Glucose) {
              diagnosisSet.add(RULES.diabetes.conditionName);
          }
      }
  }

  if (text.match(/HbA1C/i)) {
      const hba1cMatch = text.match(/HbA1C.*?(\d{1,2}(?:\.\d)?)/i);
      if (hba1cMatch) {
          findingsCount++;
          if (parseFloat(hba1cMatch[1]) > RULES.diabetes.thresholds.HbA1C) {
              diagnosisSet.add(RULES.diabetes.conditionName);
          }
      }
  }

  if (text.match(/(?:Sodium|Na\s|ןרנת)/i)) {
      const sodiumMatch = text.match(/(?:Sodium|Na\s|ןרתנ).*?(\d{3})/i);
      if (sodiumMatch) {
          const val = parseFloat(sodiumMatch[1]);
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