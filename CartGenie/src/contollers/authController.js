import LoginInfo from '../models/loginInfo.js';
import bcrypt from 'bcryptjs';

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // בדיקת כפילויות לפי username או email
    const exists = await LoginInfo.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(400).json({ success: false, message: "User already exists" });

    // hash לסיסמה
    const hashed = await bcrypt.hash(password, 10);

    await LoginInfo.create({
      username,
      email,
      password: hashed
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
    // חיפוש משתמש לפי username
    const user = await LoginInfo.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
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
