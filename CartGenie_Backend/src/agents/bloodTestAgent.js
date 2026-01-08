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

// פונקציית עזר להמרת PDF לתמונות וקריאתן
async function processPdfBuffer(pdfBuffer, localLangPath) {
    console.log(`[Agent] ⚙️ Starting PDF conversion sequence...`);
    let extractedText = "";
    const tempFilesToDelete = [];
    
    // שמירת ה-PDF זמנית
    const tempPdfPath = path.join(os.tmpdir(), `temp_process_${Date.now()}.pdf`);
    fs.writeFileSync(tempPdfPath, pdfBuffer);
    tempFilesToDelete.push(tempPdfPath);

    const options = {
        density: 300,
        saveFilename: `page_${Date.now()}`,
        savePath: os.tmpdir(),
        format: "png",
        width: 2000,
        height: 2000
    };

    const convert = fromPath(tempPdfPath, options);
    
    // המרה של עד 3 עמודים
    for (let page = 1; page <= 3; page++) {
        try {
            console.log(`[Agent] 📸 Converting PDF page ${page} to image...`);
            const result = await convert(page, { responseType: "path" });
            
            if (result.path) {
                tempFilesToDelete.push(result.path);
                const pageBuffer = fs.readFileSync(result.path);
                
                console.log(`[Agent] 📖 Reading text from page ${page}...`);
                const { data: { text } } = await Tesseract.recognize(pageBuffer, 'eng+heb', { 
                    langPath: localLangPath,
                    gzip: false,
                    cachePath: localLangPath
                });
                extractedText += text + " ";
            }
        } catch (err) { 
            // אם נגמרו העמודים, פשוט מפסיקים
            break; 
        } 
    }

    // ניקוי
    tempFilesToDelete.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
    
    return extractedText;
}

export const analyzeBloodTestImages = async (filesInput) => {
  // נרמול הקלט למערך
  let filesArray = Array.isArray(filesInput) ? filesInput : [filesInput];
  if (filesInput.length > 1000) filesArray = [filesInput]; // הגנה מ-Buffer

  console.log(`[Agent] Starting analysis for ${filesArray.length} file(s)...`);
  const localLangPath = path.join(process.cwd(), 'tessdata') + '/';
  
  let finalExtractedText = "";

  try {
    for (const file of filesArray) {
        const imgBuffer = file.buffer || file; 
        const fileName = file.originalname || "unknown";
        
        // בדיקת "מספר קסם" (Magic Bytes) מורחבת
        const headerCheck = imgBuffer.slice(0, 100).toString('utf8');
        const looksLikePdf = headerCheck.includes('%PDF') || fileName.toLowerCase().endsWith('.pdf');

        if (looksLikePdf) {
            console.log(`[Agent] 📄 Detected PDF via header/name. Converting to images...`);
            const text = await processPdfBuffer(imgBuffer, localLangPath);
            finalExtractedText += text + " ";
        } 
        else {
             // ננסה לקרוא כתמונה, אבל אם זה ייכשל כי זה PDF מסווה - נפעיל את תוכנית הגיבוי
             try {
                 console.log(`[Agent] 🖼️ Treating as Image: ${fileName}`);
                 const { data: { text } } = await Tesseract.recognize(imgBuffer, 'eng+heb', { 
                     langPath: localLangPath,
                     gzip: false,
                     cachePath: localLangPath
                 });
                 finalExtractedText += text + " ";
             } catch (error) {
                 // 👇👇👇 התיקון הגאוני שלך: Catch & Retry 👇👇👇
                 if (error.message && (error.message.includes("Pdf reading") || error.message.includes("format"))) {
                     console.log(`[Agent] ⚠️ OCR failed (${error.message}). Retrying as PDF conversion...`);
                     const text = await processPdfBuffer(imgBuffer, localLangPath);
                     finalExtractedText += text + " ";
                 } else {
                     throw error; // זו שגיאה אחרת אמיתית
                 }
             }
        }
    }

    const cleanText = finalExtractedText.replace(/\n/g, ' ').replace(/\s+/g, ' '); 
    console.log(`[Agent] Final text length: ${cleanText.length}`);
    
    if (cleanText.length < 10) throw new Error("Could not extract enough text.");

    const { diagnosis, findingsCount } = analyzeTextRules(cleanText);
    
    return { 
        success: true, 
        diagnosis: diagnosis.length > 0 ? diagnosis : ['Health looks normal based on limited checks'], 
        rawText: finalExtractedText.substring(0, 500) 
    };

  } catch (error) {
    console.error('❌ Analysis Error:', error.message);
    throw error; 
  }
};

function analyzeTextRules(text) {
  const diagnosisSet = new Set();
  let findingsCount = 0; 
  
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