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

export const analyzeBloodTestImages = async (filesInput) => {
  // הגנה: הפיכה למערך
  let filesArray = Array.isArray(filesInput) ? filesInput : [filesInput];
  if (filesInput.length > 1000) filesArray = [filesInput]; // הגנה מ-Buffer

  console.log(`[Agent] Starting analysis for ${filesArray.length} file(s)...`);
  
  // נתיב שפה (עם סלאש בסוף!)
  const localLangPath = path.join(process.cwd(), 'tessdata') + '/';
  
  let extractedText = "";
  let tempFilesToDelete = [];

  try {
    for (const file of filesArray) {
        
        const imgBuffer = file.buffer || file; 
        const fileName = file.originalname || "unknown_file";
        
        // 👇👇👇 התיקון האולטימטיבי (Magic Bytes) 👇👇👇
        // בודק את 4 הבייטים הראשונים של הקובץ. אם זה PDF, זה תמיד יתחיל ב-%PDF
        const isPdfHeader = imgBuffer.toString('utf8', 0, 4).startsWith('%PDF');
        
        // התנאי החדש: או שהכותרת היא PDF, או שהסיומת היא PDF
        const isPdf = isPdfHeader || fileName.toLowerCase().endsWith('.pdf') || file.mimetype === 'application/pdf';

        if (isPdf) {
            console.log(`[Agent] Detected PDF (Header: ${isPdfHeader ? 'Yes' : 'No'}, Name: ${fileName})`);
            
            const tempPdfPath = path.join(os.tmpdir(), `temp_${Date.now()}.pdf`);
            fs.writeFileSync(tempPdfPath, imgBuffer);
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
                    console.log(`[Agent] Converting PDF page ${page}...`);
                    const result = await convert(page, { responseType: "path" });
                    if (result.path) {
                        tempFilesToDelete.push(result.path);
                        const pageBuffer = fs.readFileSync(result.path);
                        const { data: { text } } = await Tesseract.recognize(pageBuffer, 'eng+heb', { 
                            langPath: localLangPath,
                            gzip: false,
                            cachePath: localLangPath
                        });
                        extractedText += text + " ";
                    }
                } catch (err) { break; } 
            }
        } else {
             console.log(`[Agent] Detected Image: ${fileName}`);
             const { data: { text } } = await Tesseract.recognize(imgBuffer, 'eng+heb', { 
                 langPath: localLangPath,
                 gzip: false,
                 cachePath: localLangPath
             });
             extractedText += text + " ";
        }
    }

    const cleanText = extractedText.replace(/\n/g, ' ').replace(/\s+/g, ' '); 
    console.log(`[Agent] Final text length: ${cleanText.length}`);
    
    if (cleanText.length < 10) throw new Error("Could not extract enough text.");

    const { diagnosis, findingsCount } = analyzeTextRules(cleanText);
    
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