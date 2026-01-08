import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import Tesseract from 'tesseract.js';
import { fromPath } from 'pdf2pic';
import fs from 'fs';
import path from 'path';
import os from 'os';

const RULES = {
  high_cholesterol: { 
      keywords: ['LDL', 'Cholesterol', 'לורטסלוכ', 'כולסטרול'], 
      threshold: 100, 
      conditionName: 'High Cholesterol' 
  },
  diabetes: { 
      keywords: ['Glucose', 'HbA1C', 'ןיבולגומה', 'המוגלובין', 'Hemoglobin A1C'], 
      thresholds: { 'Glucose': 100, 'HbA1C': 5.7 }, 
      conditionName: 'Type 2 Diabetes' 
  },
  high_blood_pressure: { 
      keywords: ['Sodium', 'Na ', 'ןרתנ', 'נתרן', 'Natrium'], 
      threshold: 145, 
      sanityLimit: 165, 
      conditionName: 'High Blood Pressure (Sodium)' 
  }
};

// --- 1. פונקציית OCR בטוחה (בולעת שגיאות במקום לקרוס) ---
async function safeTesseractRecognize(buffer, langPath) {
    try {
        const result = await Tesseract.recognize(buffer, 'eng+heb', { 
            langPath: langPath,
            gzip: false,
            cachePath: langPath,
            errorHandler: (err) => console.log('>> Tesseract internal warning (ignored):', err) 
        });
        return result.data.text;
    } catch (error) {
        console.log(`[SafeOCR] OCR failed gracefully. Returning null.`);
        return null; // מחזיר null, לא זורק שגיאה!
    }
}

// --- 2. פונקציית ההמרה מ-PDF לתמונה (החלק ששאלת עליו!) ---
async function convertPdfToImages(pdfBuffer) {
    console.log(`[Agent] ⚙️ Starting PDF conversion (Fast Mode 150 DPI)...`);
    
    // כתיבת ה-PDF לקובץ זמני
    const tempPdfPath = path.join(os.tmpdir(), `safe_proc_${Date.now()}.pdf`);
    fs.writeFileSync(tempPdfPath, pdfBuffer);
    
    // הגדרות מהירות (DPI 150 במקום 300 - זה הסוד למהירות!)
    const options = {
        density: 150, 
        saveFilename: `page_${Date.now()}`,
        savePath: os.tmpdir(),
        format: "jpg",
        width: 1240,
        height: 1754
    };

    const convert = fromPath(tempPdfPath, options);
    const imagePaths = [];
    
    // המרה של עד 3 עמודים בלבד
    for (let page = 1; page <= 3; page++) {
        try {
            console.log(`[Agent] 📸 Converting page ${page}...`);
            const result = await convert(page, { responseType: "path" });
            if (result.path) imagePaths.push(result.path);
        } catch (err) { break; } 
    }

    // מחיקת קובץ ה-PDF הזמני
    try { if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath); } catch(e){}
    
    return imagePaths; // מחזיר מערך של נתיבים לתמונות
}

// --- 3. הלוגיקה הראשית ---
export const analyzeBloodTestImages = async (filesInput) => {
    // עטיפה ראשית למניעת קריסה ב-100%
    try {
        // נרמול קלט (מערך או יחיד)
        let filesArray = Array.isArray(filesInput) ? filesInput : [filesInput];
        if (filesInput.length > 5000) filesArray = [filesInput]; 

        console.log(`[Agent] Starting analysis for ${filesArray.length} item(s)...`);
        const localLangPath = path.join(process.cwd(), 'tessdata');
        
        let finalExtractedText = "";
        const tempFilesToDelete = [];

        for (const file of filesArray) {
            const imgBuffer = file.buffer || file; 
            const fileName = (file.originalname || "unknown").toLowerCase();

            // בדיקה אמינה אם זה PDF (לפי תוכן הקובץ)
            const headerCheck = imgBuffer.slice(0, 10).toString('utf8');
            const isDefinitePdf = headerCheck.includes('%PDF') || fileName.endsWith('.pdf') || file.mimetype === 'application/pdf';

            // --- נתיב 1: זה בוודאות PDF ---
            if (isDefinitePdf) {
                console.log(`[Agent] 📄 Definite PDF detected. Converting...`);
                const paths = await convertPdfToImages(imgBuffer); // קריאה לפונקציית ההמרה
                for (const p of paths) {
                    tempFilesToDelete.push(p);
                    const pBuf = fs.readFileSync(p);
                    const text = await safeTesseractRecognize(pBuf, localLangPath);
                    if (text) finalExtractedText += text + " ";
                }
            } 
            // --- נתיב 2: אולי תמונה, אולי PDF מוסווה ---
            else {
                console.log(`[Agent] 🖼️ Attempting image OCR...`);
                let text = await safeTesseractRecognize(imgBuffer, localLangPath);

                // אם ה-OCR נכשל (כי זה בעצם PDF שהתחפש לתמונה)
                if (!text) {
                    console.log(`[Agent] ⚠️ Image OCR failed. Recovering by converting as PDF...`);
                    try {
                        const paths = await convertPdfToImages(imgBuffer); // מנסים להמיר בכוח
                        for (const p of paths) {
                            tempFilesToDelete.push(p);
                            const pBuf = fs.readFileSync(p);
                            const pdfText = await safeTesseractRecognize(pBuf, localLangPath);
                            if (pdfText) finalExtractedText += pdfText + " ";
                        }
                    } catch (conversionError) {
                        console.error(`[Agent] Recovery failed, skipping file.`);
                    }
                } else {
                    finalExtractedText += text + " ";
                }
            }
        }

        // ניקוי טקסט סופי
        const cleanText = finalExtractedText.replace(/\n/g, ' ').replace(/\s+/g, ' '); 
        console.log(`[Agent] Analysis done. Text length: ${cleanText.length}`);

        // ניקוי קבצים זמניים
        tempFilesToDelete.forEach(p => { try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch(e){} });

        const { diagnosis } = analyzeTextRules(cleanText);

        return { 
            success: true, 
            diagnosis: diagnosis.length > 0 ? diagnosis : ['Health looks normal based on limited checks'], 
            rawText: cleanText.substring(0, 500) 
        };

    } catch (FATAL_ERROR) {
        // רשת הביטחון האחרונה בהחלט
        console.error('❌ FATAL AGENT ERROR (Recovered):', FATAL_ERROR.message);
        return {
            success: false,
            error: "Analysis failed gracefully.",
            diagnosis: [],
            rawText: ""
        };
    }
};

function analyzeTextRules(text) {
  if (!text) return { diagnosis: [], findingsCount: 0 };
  
  const diagnosisSet = new Set();
  let findingsCount = 0; 
  
  // הוספת בדיקות נוספות אם צריך כאן
  if (text.match(/(?:LDL|Cholesterol|לורטסלוכ|כולסטרול)/i)) {
      const match = text.match(/LDL.*?(\d{2,3})/i);
      if (match) { 
          findingsCount++; 
          if (parseFloat(match[1]) > RULES.high_cholesterol.threshold) diagnosisSet.add(RULES.high_cholesterol.conditionName); 
      }
  }
  if (text.match(/(?:Glucose|HbA1C|ןיבולגומה|המוגלובין)/i)) {
      const matchGlucose = text.match(/Glucose.*?(\d{2,3})/i);
      if (matchGlucose) { 
          findingsCount++; 
          if (parseFloat(matchGlucose[1]) > RULES.diabetes.thresholds.Glucose) diagnosisSet.add(RULES.diabetes.conditionName); 
      }
      const matchA1C = text.match(/HbA1C.*?(\d{1,2}(?:\.\d)?)/i);
      if (matchA1C) {
          findingsCount++;
          if (parseFloat(matchA1C[1]) > RULES.diabetes.thresholds.HbA1C) diagnosisSet.add(RULES.diabetes.conditionName);
      }
  }
  if (text.match(/(?:Sodium|Na\s|ןרנת|נתרן)/i)) {
      const match = text.match(/(?:Sodium|Na\s|ןרתנ|נתרן).*?(\d{3})/i);
      if (match) { 
          const val = parseFloat(match[1]); 
          if (val < 200) { 
              findingsCount++; 
              if (val > RULES.high_blood_pressure.threshold && val < RULES.high_blood_pressure.sanityLimit) diagnosisSet.add(RULES.high_blood_pressure.conditionName); 
          } 
      }
  }
  return { diagnosis: Array.from(diagnosisSet), findingsCount };
}