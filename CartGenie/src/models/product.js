import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  barcode: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  brand: String,
  image: String,
  source: { type: String, default: 'user-upload' },
  
  // הרחבנו את אובייקט הערכים התזונתיים
  nutrients: {
    calories: { type: Number, default: 0 },       // קלוריות
    protein: { type: Number, default: 0 },        // חלבונים
    fat: { type: Number, default: 0 },            // שומנים
    carbs: { type: Number, default: 0 },          // פחמימות
    sugar: { type: Number, default: 0 },          // סוכרים
    sodium: { type: Number, default: 0 },         // נתרן
    dietaryFiber: { type: Number, default: 0 },   // סיבים תזונתיים
    cholesterol: { type: Number, default: 0 }     // כולסטרול
  },
  
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model('Product', productSchema);