// ייבוא המודל עם הסיומת .js
import User from '../models/user.js'; 
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// פונקציה ליצירת אסימון JWT
const createToken = (id) => {
  // המפתח הסודי נטען מקובץ .env
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '3d', // האסימון יפוג בעוד 3 ימים (דוגמה)
  });
};

// --- לוגיקת רישום משתמש חדש (Register) ---
export const register = async (req, res) => {
  const { username, userId, firstName, lastName, email, password } = req.body;

  if (!username || !userId || !firstName || !lastName || !password) {
      return res.status(400).json({ message: 'Missing required fields: username, userId, firstName, lastName, and password.' });
  }

  try {
    // 1. בדיקה אם המשתמש כבר קיים לפי username או userId
    let userExists = await User.findOne({ $or: [{ username }, { userId }] });
    if (userExists) {
      const field = userExists.username === username ? 'Username' : 'User ID';
      return res.status(400).json({ message: `${field} already exists.` });
    }

    // 2. גיבוב הסיסמה (Hashing)
    const salt = await bcrypt.genSalt(10); 
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 3. יצירת המשתמש ב-DB
    const user = await User.create({
      username,
      userId,
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    // 4. יצירת אסימון (Token)
    const token = createToken(user._id);

    res.status(201).json({ 
        token, 
        user: { 
            id: user._id, 
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
        } 
    });

  } catch (error) {
    console.error(error);
    if (error.name === 'ValidationError') {
        const messages = Object.values(error.errors).map(val => val.message);
        return res.status(400).json({ message: messages.join(', ') });
    }
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// --- לוגיקת התחברות משתמש (Login) ---
export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    // 1. מציאת המשתמש ב-DB לפי ה-Username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials (Username not found)' });
    }

    // 2. השוואת הסיסמה שהוזנה לסיסמה המגובבת ב-DB
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials (Wrong password)' });
    }

    // 3. יצירת אסימון (Token)
    const token = createToken(user._id);

    res.json({ 
        token, 
        user: { 
            id: user._id, 
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName
        } 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during login' });
  }
};