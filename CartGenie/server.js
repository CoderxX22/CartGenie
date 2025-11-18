import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

// 1. ייבוא הראוטרים
import authRouter from './src/routes/auth.js'; 
// ---> הוסף את השורה הזו (ודא שהנתיב לקובץ נכון!):
import userDataRouter from './src/routes/userDataRoutes.js'; 

const app = express();

app.use(cors({ origin: true }));
app.use(express.json()); // חובה כדי לקרוא את המידע מהאפליקציה

// מניעת אזהרות ngrok
app.use((req, res, next) => {
    res.setHeader('ngrok-skip-browser-warning', 'true'); 
    next();
});

// 2. חיבור הראוטרים לנתיבים
app.use('/api/auth', authRouter);
// ---> הוסף את השורה הזו. זה מחבר את הראוטר שלך לכתובת הנכונה:
app.use('/api/userdata', userDataRouter);

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