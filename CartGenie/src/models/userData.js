import mongoose from 'mongoose';

// תת-סכמה לפרטים אישיים
const PersonalDetailsSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  birthDate: {
    type: Date,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  sex: {
    type: String,
    enum: ['male', 'female'],
    required: true
  }
}, { _id: false });

// תת-סכמה למדידות גוף
const BodyMeasurementsSchema = new mongoose.Schema({
  weight: {
    type: Number,
    required: true,
    min: 30,
    max: 300
  },
  height: {
    type: Number,
    required: true,
    min: 100,
    max: 250
  },
  waist: {
    type: Number,
    required: true,
    min: 40,
    max: 200
  },
  bmi: {
    type: Number,
    required: true
  },
  whtr: {
    type: Number,
    default: 0
  }
}, { _id: false });

// תת-סכמה למחלות (החליף את Allergies)
const IllnessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    default: 'moderate'
  }
}, { _id: false });

// תת-סכמה לנתונים רפואיים
const MedicalDataSchema = new mongoose.Schema({
  illnesses: [IllnessSchema],
  otherIllnesses: {
    type: String,
    trim: true
  }
}, { _id: false });

// תת-סכמה לתוצאות בדיקות דם
const BloodTestSchema = new mongoose.Schema({
  fileName: String,
  fileUrl: String,
  fileSize: Number,
  uploadDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'uploaded', 'processed'],
    default: 'pending'
  }
}, { _id: false });

// הסכמה הראשית
const UserDataSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    trim: true,
    lowercase: true,
    index: true
  },
  personalDetails: {
    type: PersonalDetailsSchema,
    required: true
  },
  bodyMeasurements: {
    type: BodyMeasurementsSchema,
    required: true
  },
  medicalData: {
    type: MedicalDataSchema,
    required: true
  },
  bloodTest: {
    type: BloodTestSchema,
    default: {}
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  collection: 'userdata'
});

// אינדקס ל-username לחיפוש מהיר
UserDataSchema.index({ username: 1 });

// עדכון lastUpdated לפני כל שמירה
UserDataSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// מתודה לבדיקה אם הנתונים שלמים
UserDataSchema.methods.checkCompletion = function() {
  this.isCompleted = !!(
    this.personalDetails &&
    this.bodyMeasurements &&
    this.medicalData
  );
  return this.isCompleted;
};

const UserData = mongoose.models.UserData || mongoose.model('UserData', UserDataSchema);

export default UserData;