import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// --- תיקון ייבוא ---
const pdfLib = require('pdf-parse');
let pdf;

if (typeof pdfLib === 'function') {
  pdf = pdfLib;
} else if (pdfLib && typeof pdfLib.default === 'function') {
  pdf = pdfLib.default;
} else {
  console.error("❌ CRITICAL: Could not find PDF function. Dump:", pdfLib);
}

import Tesseract from 'tesseract.js';

// ==========================================
// 1. הגדרת הספים והחוקים (The Rules Engine)
// ==========================================
const RULES = {
  high_cholesterol: {
    keywords: ['LDL', 'Cholesterol', 'Low Density Lipoprotein'],
    threshold: 100,
    conditionName: 'High Cholesterol'
  },
  diabetes: {
    keywords: ['Glucose', 'HbA1C', 'Hemoglobin A1C'],
    thresholds: {
      'Glucose': 100,
      'HbA1C': 5.7
    },
    conditionName: 'Type 2 Diabetes'
  },
  high_blood_pressure: {
    keywords: ['Sodium', 'Na ', 'Natrium'],
    threshold: 145, 
    // 🔥 תוספת חדשה: גבול עליון פיזיולוגי הגיוני
    // ערך מעל 160 מעיד ב-99% מהמקרים על טעות קריאה (כמו כולסטרול)
    sanityLimit: 165, 
    conditionName: 'High Blood Pressure (Sodium)'
  }
};

/**
 * פונקציה ראשית שמנתבת לפי סוג הקובץ
 */
export const analyzeBloodTestImage = async (fileBuffer, mimeType) => {
  try {
    console.log(`🔍 Starting local analysis for type: ${mimeType}`);
    let extractedText = "";

    // --- שלב א: חילוץ הטקסט ---
    if (mimeType === 'application/pdf') {
      console.log('📄 Processing PDF...');
      if (!pdf) throw new Error('PDF parsing library failed to initialize.');
      const data = await pdf(fileBuffer);
      extractedText = data.text;
    } 
    else if (mimeType.startsWith('image/')) {
      console.log('📷 Processing Image with Tesseract...');
      const { data: { text } } = await Tesseract.recognize(fileBuffer, 'eng+heb');
      extractedText = text;
    } 
    else {
      throw new Error(`Unsupported file type: ${mimeType}`);
    }

    // --- שלב ב: ניקוי וניתוח הטקסט ---
    const previewText = extractedText.substring(0, 200).replace(/\n/g, ' ');
    console.log(`📝 Extracted Text Preview: "${previewText}..."`);
    
    const diagnosis = analyzeTextRules(extractedText);
    console.log('🩺 Diagnosis found:', diagnosis);

    return {
      success: true,
      diagnosis: diagnosis.length > 0 ? diagnosis : ['does not ill'],
      rawText: extractedText 
    };

  } catch (error) {
    console.error('❌ Analysis Error:', error);
    throw new Error('Failed to analyze document locally: ' + error.message);
  }
};

/**
 * המוח: עובר על הטקסט ומחפש התאמות לחוקים
 */
function analyzeTextRules(text) {
  const diagnosisSet = new Set();
  const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' '); 

  // 1. LDL
  const ldlMatch = cleanText.match(/LDL.*?(\d{2,3}(?:\.\d)?)/i);
  if (ldlMatch) {
    const value = parseFloat(ldlMatch[1]);
    console.log(`🧪 Found LDL: ${value}`);
    if (value > RULES.high_cholesterol.threshold) diagnosisSet.add(RULES.high_cholesterol.conditionName);
  }

  // 2. Glucose
  const glucoseMatch = cleanText.match(/Glucose.*?(\d{2,3})/i);
  if (glucoseMatch) {
    const value = parseFloat(glucoseMatch[1]);
    console.log(`🧪 Found Glucose: ${value}`);
    if (value > RULES.diabetes.thresholds.Glucose) diagnosisSet.add(RULES.diabetes.conditionName);
  }

  // 3. HbA1C
  const hba1cMatch = cleanText.match(/HbA1C.*?(\d{1,2}(?:\.\d)?)/i);
  if (hba1cMatch) {
    const value = parseFloat(hba1cMatch[1]);
    console.log(`🧪 Found HbA1C: ${value}`);
    if (value > RULES.diabetes.thresholds.HbA1C) diagnosisSet.add(RULES.diabetes.conditionName);
  }

  // 4. Sodium (עם התיקון החדש)
  const sodiumMatch = cleanText.match(/(?:Sodium|Na\s).*?(\d{3})/i);
  if (sodiumMatch) {
    const value = parseFloat(sodiumMatch[1]);
    console.log(`🧪 Found Sodium candidate: ${value}`);

    // 🔥 Sanity Check Logic 🔥
    // אם הערך גבוה באופן קיצוני (מעל 165), סביר שזה כולסטרול שנשאב בטעות
    if (value > RULES.high_blood_pressure.sanityLimit) {
        console.warn(`⚠️ IGNORED Sodium value (${value}). It exceeds physiological sanity limit (${RULES.high_blood_pressure.sanityLimit}). Likely a parser error (e.g., read Cholesterol as Sodium).`);
    } 
    else if (value > RULES.high_blood_pressure.threshold) {
        // רק אם זה עובר את בדיקת השפיות - מכניסים לאבחון
        console.log(`✅ Valid High Sodium Detected: ${value}`);
        diagnosisSet.add(RULES.high_blood_pressure.conditionName);
    }
  }

  return Array.from(diagnosisSet);
}