import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto'; // משמש ליצירת userId אוטומטי אם לא סופק

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    lowercase: true
  },
  userId: {
    type: String,
    // required: [true, 'User ID is required'], // הורדתי את ה-required כדי לאפשר ל-default לעבוד
    unique: true,
    trim: true,
    default: () => crypto.randomUUID() // יוצר ID אוטומטי אם לא שלחת אחד
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  password: {
    type: String,
    required: false, // <--- שינוי קריטי: לא חובה למשתמשי גוגל
    minlength: [6, 'Password must be at least 6 characters long']
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    unique: true, // מומלץ מאוד להוסיף unique לאימייל
    match: [/.+@.+\..+/, 'Please fill a valid email address']
  },
  // שדה חדש לזיהוי משתמשי גוגל
  googleId: {
    type: String,
    unique: true,
    sparse: true // מאפשר שהשדה יהיה null למשתמשים רגילים מבלי לגרום לשגיאת כפילות
  },
  isFirstLogin: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password לפני שמירה
UserSchema.pre('save', async function(next) {
  // אם אין סיסמה (משתמש גוגל) - דלג על ההצפנה
  if (!this.password) return next();

  // אם הסיסמה קיימת אבל לא שונתה - דלג
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// פונקציה להשוואת סיסמה בזמן login
UserSchema.methods.comparePassword = async function(candidatePassword) {
  // הגנה: אם למשתמש אין סיסמה (נרשם דרך גוגל), אי אפשר להשוות סיסמה
  if (!this.password) return false; 
  
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

export default User;