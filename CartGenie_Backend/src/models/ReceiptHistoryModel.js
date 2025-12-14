import mongoose from 'mongoose';

const ReceiptHistorySchema = new mongoose.Schema({
  username: { type: String, required: true, index: true },
  storeName: { type: String, default: 'Unknown Store' },
  totalPrice: { type: Number, default: 0 },
  currency: { type: String, default: '₪' },
  itemCount: { type: Number, default: 0 },
  healthSummary: {
    safe: { type: Number, default: 0 },
    caution: { type: Number, default: 0 },
    avoid: { type: Number, default: 0 }
  },
  scanDate: { type: Date, default: Date.now }
});

export default mongoose.model('ReceiptHistory', ReceiptHistorySchema);