import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // שם משתמש (Username) - השדה הייחודי להתחברות
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long']
  },
  // מספר מזהה (ID)
  userId: {
    type: String, 
    required: [true, 'User ID is required'],
    unique: true,
    trim: true
  },
  // שם פרטי
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  // שם משפחה
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  // הסיסמה תהיה שמורה בגיבוב (hashed), לא בטקסט גלוי!
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  // דוא"ל (שדה אופציונלי כעת)
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address'] 
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

export default User;