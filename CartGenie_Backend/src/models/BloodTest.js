import mongoose from 'mongoose';

const bloodTestSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    index: true // 🔥 קריטי ליעילות השליפות לפי משתמש
  },
  uploadDate: { 
    type: Date, 
    default: Date.now 
  },
  diagnosis: [String], // מערך האבחנות (למשל: ['High Cholesterol', 'Type 2 Diabetes'])
  rawText: String,     // אופציונלי: שומרים את הטקסט הגולמי לדיבאג עתידי
  fileName: String     // שם הקובץ המקורי
});

export default mongoose.model('BloodTest', bloodTestSchema);