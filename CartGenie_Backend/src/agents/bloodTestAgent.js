import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import Tesseract from 'tesseract.js';
import path from 'path';

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
  try {
    let filesArray = Array.isArray(filesInput) ? filesInput : [filesInput];
    if (filesInput.length > 5000) filesArray = [filesInput]; 

    const localLangPath = path.join(process.cwd(), 'tessdata');
    let finalExtractedText = "";

    for (const file of filesArray) {
        const imgBuffer = file.buffer || file; 
        
        const result = await Tesseract.recognize(imgBuffer, 'eng+heb', { 
            langPath: localLangPath,
            gzip: false,
            cachePath: localLangPath
        });
        finalExtractedText += result.data.text + " ";
    }

    const cleanText = finalExtractedText.replace(/\n/g, ' ').replace(/\s+/g, ' '); 

    const { diagnosis } = analyzeTextRules(cleanText);

    return { 
        success: true, 
        diagnosis: diagnosis.length > 0 ? diagnosis : ['Health looks normal based on limited checks'], 
        rawText: cleanText.substring(0, 500) 
    };

  } catch (error) {
    console.error('Server Analysis Error:', error.message);
    return {
        success: false,
        error: "Failed to process images.",
        diagnosis: []
    };
  }
};

function analyzeTextRules(text) {
  if (!text) return { diagnosis: [], findingsCount: 0 };
  
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