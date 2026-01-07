import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import Tesseract from 'tesseract.js';
import { fromPath } from 'pdf2pic';
import fs from 'fs';
import path from 'path';
import os from 'os';

// הערה: מחקתי את pdf-parse כי הוא לא היה בשימוש

const RULES = {
  high_cholesterol: { 
      keywords: ['LDL', 'Cholesterol', 'לורטסלוכ', 'כולסטרול'], // הוספתי גם עברית רגילה ליתר ביטחון
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

export const analyzeBloodTestImages = async (filesArray) => {
  console.log(`[Agent] Starting analysis for ${filesArray.length} files...`);
  let extractedText = "";
  let tempFilesToDelete = [];

  try {
    for (const file of filesArray) {
        
        // --- תרחיש A: הקובץ הוא PDF ---
        if (file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf')) {
            console.log(`[Agent] Processing PDF: ${file.originalname}`);
            
            const tempPdfPath = path.join(os.tmpdir(), `temp_${Date.now()}.pdf`);
            fs.writeFileSync(tempPdfPath, file.buffer);
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
            
            for (let page = 1; page <= 3; page++) {
                try {
                    console.log(`[Agent] Converting PDF page ${page} to image...`);
                    const result = await convert(page, { responseType: "path" });
                    
                    if (result.path) {
                        tempFilesToDelete.push(result.path);
                        const imgBuffer = fs.readFileSync(result.path);
                        
                        // תיקון קריטי: טעינת שפה מ-CDN במקום מהדיסק המקומי
                        const { data: { text } } = await Tesseract.recognize(imgBuffer, 'eng+heb', { 
                            langPath: 'https://tessdata.projectnaptha.com/4.0.0',
                            gzip: false 
                        });
                        extractedText += text + " ";
                    }
                } catch (err) { break; } 
            }
        } 
        
        // --- תרחיש B: הקובץ הוא תמונה ---
        else {
             console.log(`[Agent] Processing Image: ${file.originalname}`);
             // תיקון קריטי: טעינת שפה מ-CDN
             const { data: { text } } = await Tesseract.recognize(file.buffer, 'eng+heb', { 
                 langPath: 'https://tessdata.projectnaptha.com/4.0.0',
                 gzip: false 
             });
             extractedText += text + " ";
        }
    }

    const cleanText = extractedText.replace(/\n/g, ' ').replace(/\s+/g, ' '); 
    console.log(`[Agent] Final text length: ${cleanText.length}`);
    
    if (cleanText.length < 10) throw new Error("Could not extract text.");

    const { diagnosis, findingsCount } = analyzeTextRules(cleanText);
    
    // שיניתי מעט את הלוגיקה שלא יזרוק שגיאה אם לא מצא ערכים, אלא יחזיר תשובה ריקה (יותר נכון ל-UX)
    if (findingsCount === 0) {
        console.log("No specific blood values detected inside the text.");
    }

    return { 
        success: true, 
        diagnosis: diagnosis.length > 0 ? diagnosis : ['Health looks normal based on limited checks'], 
        rawText: extractedText.substring(0, 500) 
    };

  } catch (error) {
    console.error('❌ Analysis Error:', error.message);
    throw error; 
  } finally {
      tempFilesToDelete.forEach(p => { if (fs.existsSync(p)) fs.unlinkSync(p); });
  }
};

function analyzeTextRules(text) {
  const diagnosisSet = new Set();
  let findingsCount = 0; 
  
  // הוספתי תמיכה גם בטקסט הפוך וגם בישר
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
          if (val < 200) { // סינון רעשים
              findingsCount++; 
              if (val > RULES.high_blood_pressure.threshold && val < RULES.high_blood_pressure.sanityLimit) diagnosisSet.add(RULES.high_blood_pressure.conditionName); 
          } 
      }
  }
  return { diagnosis: Array.from(diagnosisSet), findingsCount };
}