import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// 1. ייבוא הראוטרים
import authRouter from './src/routes/auth.js'; 
import userDataRouter from './src/routes/userDataRoutes.js'; 
import productsRouter from './src/routes/productRoute.js';
// ייבוא הראוטר של ה-OCR (שים לב לשם הקובץ ברבים: ocrRoutes.js)
import ocrRouter from './src/routes/ocrRoute.js';

const app = express();

app.use(cors({ origin: true }));
app.use(express.json()); // חובה כדי לקרוא את המידע מהאפליקציה

// מניעת אזהרות ngrok (רלוונטי לפיתוח)
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true'); 
    next();
});

// 2. חיבור הראוטרים לנתיבים
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/userdata', userDataRouter);
// חיבור נתיב ה-OCR
app.use('/api/ocr', ocrRouter);

const { MONGO_URI, PORT = 4000 } = process.env;

// חיבור ל-MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Mongo connected');
    
    // נקודות קצה לבדיקה
    app.get('/health', (req,res)=>res.json({ok:true}));
    
    app.listen(PORT, () => console.log(`API running on port ${PORT}`));
  })
  .catch((e) => {
    console.error('Mongo connection error:', e);
    process.exit(1);
  });