import UserData from '../models/userData.js';

/**
 * שמירת נתוני משתמש חדש או עדכון נתונים קיימים
 * POST /api/userdata/save
 */
export const saveUserData = async (req, res) => {
  try {
    const {
      username,
      // Personal Details
      firstName,
      lastName,
      birthDate,
      ageYears,
      sex,
      // Body Measurements
      weight,
      height,
      waist,
      bmi,
      whtr,
      // Medical Conditions (מחלות)
      illnesses,
      otherIllnesses,
      // Blood Test (optional)
      bloodTest
    } = req.body;

    // בדיקת שדות חובה
    const requiredFields = ['username', 'firstName', 'lastName', 'birthDate', 'sex', 'weight', 'height', 'waist', 'bmi'];
    const missing = requiredFields.filter(field => !req.body[field]);

    if (missing.length > 0) {
      console.log('❌ Validation failed. Missing:', missing);
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missing.join(', ')}` 
      });
    }

    // עיבוד רשימת המחלות (Illnesses)
    let parsedIllnesses = [];
    
    if (illnesses) {
      try {
        parsedIllnesses = typeof illnesses === 'string' 
          ? JSON.parse(illnesses) 
          : illnesses;
      } catch (e) {
        parsedIllnesses = [];
      }
    }

    // בניית מערך מחלות למבנה הסכמה
    const illnessesArray = parsedIllnesses.map(illnessName => ({
      name: illnessName,
      severity: 'moderate' // ערך ברירת מחדל
    }));

    // בניית אובייקט הנתונים המלא לשמירה/עדכון
    const userData = {
      username: username.toLowerCase().trim(),
      personalDetails: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        birthDate: new Date(birthDate),
        age: parseInt(ageYears),
        sex
      },
      bodyMeasurements: {
        weight: parseFloat(weight),
        height: parseFloat(height),
        waist: parseFloat(waist),
        bmi: parseFloat(bmi),
        whtr: whtr ? parseFloat(whtr) : 0
      },
      medicalData: {
        illnesses: illnessesArray,
        otherIllnesses: otherIllnesses?.trim() || ''
      },
      bloodTest: bloodTest || {},
      // אם יש שם קובץ, סימן שהתהליך הושלם
      isCompleted: !!bloodTest?.fileName 
    };

    // חיפוש האם המשתמש כבר קיים
    let userDataDoc = await UserData.findOne({ username: userData.username });

    if (userDataDoc) {
      // עדכון משתמש קיים
      userDataDoc.personalDetails = userData.personalDetails;
      userDataDoc.bodyMeasurements = userData.bodyMeasurements;
      userDataDoc.medicalData = userData.medicalData;
      
      // עדכון בדיקות דם רק אם נשלח מידע חדש
      if (bloodTest && Object.keys(bloodTest).length > 0) {
        userDataDoc.bloodTest = userData.bloodTest;
      }
      
      // בדיקת השלמה (ניתן להשתמש גם במתודה של המודל)
      if (userData.isCompleted) userDataDoc.isCompleted = true;

      await userDataDoc.save();
      
      return res.json({ 
        success: true, 
        message: 'User data updated successfully',
        data: userDataDoc,
        isNew: false
      });
    } else {
      // יצירת רשומה חדשה
      userDataDoc = await UserData.create(userData);
      
      return res.status(201).json({ 
        success: true, 
        message: 'User data saved successfully',
        data: userDataDoc,
        isNew: true
      });
    }

  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while saving user data',
      error: error.message 
    });
  }
};

/**
 * קבלת נתוני משתמש לפי username
 * GET /api/userdata/:username
 */
export const getUserData = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username is required' 
      });
    }

    const userData = await UserData.findOne({ 
      username: username.toLowerCase().trim() 
    });

    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: 'User data not found' 
      });
    }

    res.json({ 
      success: true, 
      data: userData 
    });

  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching user data',
      error: error.message 
    });
  }
};

/**
 * עדכון תוצאות בדיקות דם בלבד
 * PATCH /api/userdata/blood-test
 */
export const updateBloodTest = async (req, res) => {
  try {
    const { username, fileName, fileUrl, fileSize } = req.body;

    if (!username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username is required' 
      });
    }

    const userData = await UserData.findOne({ 
      username: username.toLowerCase().trim() 
    });

    if (!userData) {
      return res.status(404).json({ 
        success: false, 
        message: 'User data not found' 
      });
    }

    // עדכון פרטי בדיקת הדם
    userData.bloodTest = {
      fileName,
      fileUrl,
      fileSize,
      uploadDate: new Date(),
      status: 'uploaded'
    };

    // סימון שהפרופיל הושלם מכיוון שיש בדיקת דם
    userData.isCompleted = true;
    
    await userData.save();

    res.json({ 
      success: true, 
      message: 'Blood test data updated successfully',
      data: userData 
    });

  } catch (error) {
    console.error('Error updating blood test:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating blood test',
      error: error.message 
    });
  }
};

/**
 * מחיקת נתוני משתמש
 * DELETE /api/userdata/:username
 */
export const deleteUserData = async (req, res) => {
  try {
    const { username } = req.params;

    if (!username) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username is required' 
      });
    }

    const result = await UserData.deleteOne({ 
      username: username.toLowerCase().trim() 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'User data not found' 
      });
    }

    res.json({ 
      success: true, 
      message: 'User data deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting user data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting user data',
      error: error.message 
    });
  }
};

/**
 * קבלת כל המשתמשים (למטרות ניהול/אדמין)
 * GET /api/userdata/all
 */
export const getAllUserData = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await UserData.find()
      .select('-__v') // הסתרת שדה הגרסה של מונגו
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await UserData.countDocuments();

    res.json({ 
      success: true, 
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Error fetching all user data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching all user data',
      error: error.message 
    });
  }
};