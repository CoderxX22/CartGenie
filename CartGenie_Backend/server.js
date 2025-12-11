import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// 1. ייבוא הראוטרים
import authRouter from './src/routes/auth.js'; 
import userDataRouter from './src/routes/userDataRoutes.js'; 
import productsRouter from './src/routes/productRoute.js';
import bloodTestRouter from './src/routes/bloodTestRoute.js'; // ✅ תוקן השם
import ocrRouter from './src/routes/ocrRoute.js';

import aiRoute from './src/routes/aiRoute.js';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

// מניעת אזהרות ngrok (רלוונטי לפיתוח)
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true'); 
    next();
});

// בדיקת שפיות - לוודא שהשרת חי
app.get('/health', (req, res) => res.json({ ok: true, message: "Server is running" }));

// 2. חיבור הראוטרים לנתיבים
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/userdata', userDataRouter);
app.use('/api/ocr', ocrRouter);
app.use('/api/ai', aiRoute);

// ✅ זה הנתיב החשוב! הוא מפנה את כל הבקשות שמגיעות ל-/api/blood-test לקובץ הראוטר שיצרנו
app.use('/api/blood-test', bloodTestRouter); 

const { MONGO_URI, PORT = 4000 } = process.env;

// חיבור ל-MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ Mongo connected');
    app.listen(PORT, () => console.log(`🚀 API running on port ${PORT}`));
  })
  .catch((e) => {
    console.error('❌ Mongo connection error:', e);
    process.exit(1);
  });