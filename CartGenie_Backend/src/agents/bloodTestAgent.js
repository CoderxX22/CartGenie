import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import Tesseract from 'tesseract.js';


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

export const analyzeBloodTestImages = async (filesArray) => {
  console.log(`[Agent] Starting analysis for ${filesArray.length} images...`);

  try {
    let extractedText = "";

    for (let i = 0; i < filesArray.length; i++) {
        const file = filesArray[i];
        console.log(`[Agent] Processing image ${i + 1}/${filesArray.length} (${file.mimetype})...`);

        if (!file.mimetype.startsWith('image/')) {
            console.warn(`[Agent] File ${i+1} is not an image, skipping.`);
            continue;
        }

        const { data: { text } } = await Tesseract.recognize(file.buffer, 'eng+heb', {
            langPath: process.cwd(), 
            gzip: false
        });
        
        extractedText += text + " ";
    }

    // --- שלב הניתוח (זהה לקוד הקודם) ---
    const cleanText = extractedText.replace(/\n/g, ' ').replace(/\s+/g, ' '); 
    console.log(`[Agent] Final combined text length: ${cleanText.length}`);
    
    if (cleanText.length < 10) {
        throw new Error("Could not extract text from images. Please ensure image quality.");
    }

    const { diagnosis, findingsCount } = analyzeTextRules(cleanText);
    console.log(`[Agent] Findings found: ${findingsCount}, Diagnosis: ${diagnosis}`);
    
    if (findingsCount === 0) {
        throw new Error("Could not detect any blood test values. Please ensure the images are clear and readable.");
    }

    return {
      success: true,
      diagnosis: diagnosis.length > 0 ? diagnosis : ['does not ill'],
      rawText: extractedText.substring(0, 500)
    };

  } catch (error) {
    console.error('❌ Analysis Error:', error.message);
    throw error; 
  }
};


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