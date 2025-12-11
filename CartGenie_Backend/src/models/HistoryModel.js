const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  username: { type: String, required: true, index: true }, // אינדקס לשליפה מהירה
  productName: { type: String, required: true },
  barcode: { type: String },
  brand: { type: String },
  aiRecommendation: { type: String, enum: ['SAFE', 'CAUTION', 'AVOID', 'UNKNOWN'] },
  aiReason: { type: String },
  scannedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ScanHistory', HistorySchema);