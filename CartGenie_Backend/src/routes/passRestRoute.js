import express from 'express';
import bcrypt from 'bcrypt';
import LoginInfo from '../models/loginInfo.js'; // המודל מיובא בשם LoginInfo

const router = express.Router();

/**
 * שלב 1: אימות זהות
 */
router.post('/verify-identity', async (req, res) => {
  try {
    let { username, email } = req.body;
    
    username = username ? username.trim() : ''; 
    email = email ? email.trim() : '';

    console.log(`🔍 [Verify Start] Input Username: '${username}' | Input Email: '${email}'`);

    // תיקון: שימוש ב-LoginInfo במקום ב-User
    const user = await LoginInfo.findOne({ 
        username: { $regex: new RegExp(`^${username}$`, 'i') } 
    });

    if (!user) {
      console.log(`❌ [Verify Fail] User '${username}' not found in DB.`);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    console.log(`✅ [Verify Found] User found. DB Email is: '${user.email}'`);

    const dbEmailClean = user.email.trim().toLowerCase();
    const inputEmailClean = email.toLowerCase();

    if (dbEmailClean !== inputEmailClean) {
      console.log(`❌ [Verify Fail] Email mismatch! DB: '${dbEmailClean}' vs Input: '${inputEmailClean}'`);
      return res.status(400).json({ success: false, message: 'Email does not match our records.' });
    }

    console.log(`✅ [Verify Success] Identity verified for '${username}'.`);
    res.json({ success: true, message: 'Identity verified.' });

  } catch (error) {
    console.error('❌ [Verify Error]:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * שלב 2: איפוס סיסמה
 */
router.post('/reset-password', async (req, res) => {
  try {
    let { username, newPassword } = req.body;
    username = username ? username.trim() : '';

    console.log(`🔄 [Reset Password] Attempt for user: '${username}'`);

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 chars.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // תיקון: שימוש ב-LoginInfo במקום ב-User
    const updatedUser = await LoginInfo.findOneAndUpdate(
      { username: { $regex: new RegExp(`^${username}$`, 'i') } },
      { password: hashedPassword },
      { new: true } 
    );

    if (!updatedUser) {
        console.log(`❌ [Reset Fail] User '${username}' not found during update.`);
        return res.status(404).json({ success: false, message: 'User not found during update.' });
    }

    console.log(`✅ [Reset Success] Password updated for '${username}'.`);
    res.json({ success: true, message: 'Password updated successfully.' });

  } catch (error) {
    console.error('❌ [Reset Error]:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

export default router;