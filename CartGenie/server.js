import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
// ייבוא ה-router הראשי לאימות משתמשים (כולל סיומת .js)
import authRouter from './src/routes/auth.js'; 

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

// הגדרת הנתיב הראשי של האימות: /api/auth
app.use('/api/auth', authRouter);
app.use((req, res, next) => {
    // מונע אזהרות דפדפן בעת שימוש בכלי כמו ngrok
    res.setHeader('ngrok-skip-browser-warning', 'true'); 
    next();
  });
  
const { MONGO_URI, PORT = 4000 } = process.env;

// חיבור ל-MongoDB
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Mongo connected');
    // נקודות קצה לבדיקת תקינות
    app.get('/health', (req,res)=>res.json({ok:true}));
    app.post('/echo', (req,res)=>res.json({youSent:req.body}));
    
    app.listen(PORT, () => console.log(`API on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error('Mongo connection error:', e);
    process.exit(1);
  });