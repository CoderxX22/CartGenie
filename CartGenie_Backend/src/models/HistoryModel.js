import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  productName: { type: String, required: true },
  barcode: { type: String },
  brand: { type: String },
  aiRecommendation: { type: String, enum: ['SAFE', 'CAUTION', 'AVOID', 'UNKNOWN'] },
  aiReason: { type: String },
  scannedAt: { type: Date, default: Date.now }
});

// 👇 זו השורה הקריטית - חייבים להשתמש ב-export default
export default mongoose.model('ScanHistory', HistorySchema);