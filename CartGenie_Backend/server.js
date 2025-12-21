import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// 1. ייבוא הראוטרים
import authRouter from './src/routes/auth.js'; 
import userDataRouter from './src/routes/userDataRoutes.js'; 
import productsRouter from './src/routes/productRoute.js';
import bloodTestRouter from './src/routes/bloodTestRoute.js';
import ocrRouter from './src/routes/ocrRoute.js';
import aiRoute from './src/routes/aiRoute.js';
import passRestRoute from './src/routes/passRestRoute.js';

// 👇 הייבוא החדש (History)
import historyRouter from './src/routes/HistoryRoute.js'; 

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
// מניעת אזהרות ngrok (רלוונטי לפיתוח)
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true'); 
    next();
});

// בדיקת שפיות
app.get('/health', (req, res) => res.json({ ok: true, message: "Server is running" }));

// 2. חיבור הראוטרים לנתיבים
app.use('/api/auth', authRouter);
app.use('/api/passRest', passRestRoute);
app.use('/api/products', productsRouter);
app.use('/api/userdata', userDataRouter);
app.use('/api/ocr', ocrRouter);
app.use('/api/ai', aiRoute);
app.use('/api/blood-test', bloodTestRouter);

// 👇 החיבור החדש: כל מה שקשור להיסטוריה ילך לכאן
app.use('/api/history', historyRouter); 

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