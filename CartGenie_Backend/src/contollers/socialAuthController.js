// controllers/socialAuthController.js
import LoginInfo from '../models/loginInfo.js';
import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
import crypto from 'crypto'; // בשביל userId אם צריך

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// פונקציית עזר ליצירת שם משתמש ייחודי
const generateUniqueUsername = async (baseName) => {
  let username = baseName;
  let counter = 1;
  while (await LoginInfo.findOne({ username })) {
    username = `${baseName}${counter}`;
    counter++;
  }
  return username;
};

export const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'No token provided' });
    }

    // 1. אימות מול גוגל
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, sub: googleId } = payload; // sub הוא המזהה הייחודי בגוגל

    // 2. חיפוש משתמש
    let user = await LoginInfo.findOne({ email });

    if (user) {
      // משתמש קיים - עדכון googleId אם חסר
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // 3. משתמש חדש
      const baseUsername = email.split('@')[0];
      const uniqueUsername = await generateUniqueUsername(baseUsername);

      user = await LoginInfo.create({
        username: uniqueUsername,
        email: email,
        googleId: googleId,
        password: undefined, // חשוב: ללא סיסמה
        // userId: crypto.randomUUID() // בטל הערה אם המודל שלך לא מייצר את זה אוטומטית
      });
    }

    // החזרת תשובה זהה ל-login הרגיל
    return res.json({ 
      success: true, 
      username: user.username, 
      email: user.email 
    });

  } catch (err) {
    console.error('Google Login Error:', err);
    res.status(401).json({ success: false, message: 'Google authentication failed' });
  }
};