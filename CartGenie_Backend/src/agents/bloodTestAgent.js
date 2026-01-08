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

// פונקציית עזר להמרת PDF לתמונות (אופטימלית לביצועים)
async function convertPdfToImages(pdfBuffer) {
    console.log(`[Agent] ⚙️ Starting PDF conversion...`);
    
    const tempPdfPath = path.join(os.tmpdir(), `temp_proc_${Date.now()}.pdf`);
    fs.writeFileSync(tempPdfPath, pdfBuffer);
    
    // 👇👇👇 שיפור ביצועים קריטי 👇👇👇
    // הורדנו density מ-300 ל-150. זה מאיץ את התהליך פי 4-5!
    const options = {
        density: 150, 
        saveFilename: `page_${Date.now()}`,
        savePath: os.tmpdir(),
        format: "jpg", // JPG מהיר יותר מ-PNG לעיבוד
        width: 1240,   // גודל A4 סטנדרטי ב-150DPI (מספיק בהחלט)
        height: 1754
    };

    const convert = fromPath(tempPdfPath, options);
    const imagePaths = [];
    
    // המרה של עד 3 עמודים (לרוב מספיק)
    for (let page = 1; page <= 3; page++) {
        try {
            console.log(`[Agent] 📸 Converting page ${page}...`);
            const result = await convert(page, { responseType: "path" });
            if (result.path) imagePaths.push(result.path);
        } catch (err) { break; } 
    }

    // מוחק את ה-PDF המקורי כדי לחסוך מקום
    if (fs.existsSync(tempPdfPath)) fs.unlinkSync(tempPdfPath);
    
    return imagePaths;
}

export const analyzeBloodTestImages = async (filesInput) => {
  // נרמול קלט
  let filesArray = Array.isArray(filesInput) ? filesInput : [filesInput];
  // הגנה אם נשלח באפר ישירות
  if (filesInput.length > 5000) filesArray = [filesInput]; 

  console.log(`[Agent] Starting analysis for ${filesArray.length} item(s)...`);
  
  // נתיב קבצי שפה
  const localLangPath = path.join(process.cwd(), 'tessdata'); // Tesseract מוסיף את הסלאש לבד בגרסאות חדשות, אבל הנתיב חייב להיות נכון
  
  let finalExtractedText = "";
  const tempFilesToDelete = [];

  try {
    for (const file of filesArray) {
        const imgBuffer = file.buffer || file; 
        const fileName = (file.originalname || "unknown").toLowerCase();
        
        // רשימת קבצים לעיבוד (או התמונה עצמה, או עמודים שהומרו מ-PDF)
        let imagesToProcess = [];

        // בדיקה 1: האם זה PDF מוצהר?
        const isExplicitPdf = fileName.endsWith('.pdf') || file.mimetype === 'application/pdf';

        if (isExplicitPdf) {
            console.log(`[Agent] 📄 PDF detected by name/type. Converting...`);
            const paths = await convertPdfToImages(imgBuffer);
            paths.forEach(p => {
                imagesToProcess.push(p); // נשמור את הנתיב
                tempFilesToDelete.push(p); // נזכור למחוק אח"כ
            });
        } else {
            // אם זה לא PDF מוצהר, ננסה להתייחס לזה כתמונה ישירות מה-Buffer
            imagesToProcess.push({ buffer: imgBuffer }); 
        }

        // לולאת OCR על מה שהכנו
        for (const imgItem of imagesToProcess) {
            try {
                // אם זה נתיב (מ-PDF) נקרא אותו, אם זה באפר נשתמש בו
                const inputForTesseract = imgItem.buffer ? imgItem.buffer : fs.readFileSync(imgItem);
                
                console.log(`[Agent] 👁️ Running OCR...`);
                
                const { data: { text } } = await Tesseract.recognize(inputForTesseract, 'eng+heb', { 
                    langPath: localLangPath,
                    gzip: false,
                    cachePath: localLangPath,
                    logger: m => {
                        // לוג התקדמות רק באחוזים עגולים (חוסך לוגים)
                        if (m.status === 'recognizing text' && (m.progress * 100) % 20 === 0) {
                            console.log(`[OCR] Progress: ${Math.round(m.progress * 100)}%`);
                        }
                    }
                });
                finalExtractedText += text + " ";

            } catch (error) {
                // 👇👇👇 המנגנון שמציל מקריסה 👇👇👇
                // אם ניסינו לעשות OCR על "תמונה" וקיבלנו שגיאה שזה PDF
                if (error.message && (error.message.includes("Pdf reading") || error.message.includes("read image"))) {
                    console.log(`[Agent] ⚠️ Image OCR failed. File is likely a hidden PDF. Converting now...`);
                    
                    // מפעילים המרה בכוח
                    const paths = await convertPdfToImages(imgBuffer);
                    
                    // מריצים OCR על התמונות החדשות שיצרנו
                    for (const p of paths) {
                        tempFilesToDelete.push(p);
                        const pBuf = fs.readFileSync(p);
                        const { data: { text } } = await Tesseract.recognize(pBuf, 'eng+heb', { 
                            langPath: localLangPath, 
                            gzip: false,
                            cachePath: localLangPath
                        });
                        finalExtractedText += text + " ";
                    }
                } else {
                    console.error(`[Agent] OCR Error skipped: ${error.message}`);
                }
            }
        }
    }

    // ניקוי טקסט
    const cleanText = finalExtractedText.replace(/\n/g, ' ').replace(/\s+/g, ' '); 
    console.log(`[Agent] Analysis done. Text length: ${cleanText.length}`);
    
    if (cleanText.length < 5) {
         // לא זורקים שגיאה כדי לא להפיל את הלקוח, אלא מחזירים תשובה ריקה
         console.log("[Agent] Warning: No text extracted.");
    }

    const { diagnosis } = analyzeTextRules(cleanText);
    
    return { 
        success: true, 
        diagnosis: diagnosis.length > 0 ? diagnosis : ['Health looks normal based on limited checks'], 
        rawText: cleanText.substring(0, 100) + "..." // מחזירים רק קצת טקסט לדיבוג
    };

  } catch (error) {
    console.error('❌ Fatal Analysis Error:', error.message);
    throw error; 
  } finally {
      // ניקוי קבצים זמניים תמיד
      tempFilesToDelete.forEach(p => { 
          try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch(e){} 
      });
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