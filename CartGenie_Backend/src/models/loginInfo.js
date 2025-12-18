import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const LoginInfoSchema = new mongoose.Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  // --- השינוי החשוב כאן ---
  password: {
    type: String,
    // הסיסמה חובה רק אם אין googleId
    required: function() { return !this.googleId; }
  },
  googleId: { 
    type: String, 
    unique: true, 
    sparse: true // מאפשר לערך להיות null אצל משתמשים רגילים
  },
  // ... שאר השדות שלך (userId, date, etc)
}, { timestamps: true });

// Pre-save hook להצפנה
LoginInfoSchema.pre('save', async function(next) {
  // אם אין סיסמה (גוגל) או שלא השתנתה - דלג
  if (!this.password || !this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

const LoginInfo = mongoose.model('LoginInfo', LoginInfoSchema);
export default LoginInfo;