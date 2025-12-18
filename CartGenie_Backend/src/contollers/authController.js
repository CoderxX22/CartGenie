// controllers/authController.js
import LoginInfo from '../models/loginInfo.js';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // בדיקת כפילויות
    const exists = await LoginInfo.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ success: false, message: "User already exists" });

    // יצירת משתמש (ה-Hook במודל יצפין את הסיסמה)
    await LoginInfo.create({
      username,
      email,
      password
    });

    res.json({ success: true, message: "User registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Missing username or password' });
  }

  try {
    const user = await LoginInfo.findOne({ username: username.toLowerCase().trim() });
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    // אם למשתמש אין סיסמה (נרשם דרך גוגל)
    if (!user.password) {
       return res.status(400).json({ success: false, message: 'Please use Google Login' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Incorrect password' });
    }

    return res.json({ success: true, username: user.username, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};