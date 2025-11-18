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
      // Allergies
      allergies,
      otherAllergies,
      allergySeverity,
      // Blood Test (optional)
      bloodTest
    } = req.body;

    const requiredFields = ['username', 'firstName', 'lastName', 'birthDate', 'sex', 'weight', 'height', 'waist', 'bmi'];
    const missing = requiredFields.filter(field => !req.body[field]);

    if (missing.length > 0) {
      console.log('❌ Validation failed. Missing:', missing); // נדפיס גם בשרת
      return res.status(400).json({ 
        success: false, 
        message: `Missing required fields: ${missing.join(', ')}` 
      });
    }
    // המרת allergies מ-JSON string אם צריך
    let parsedAllergies = [];
    let parsedSeverity = {};

    if (allergies) {
      try {
        parsedAllergies = typeof allergies === 'string' 
          ? JSON.parse(allergies) 
          : allergies;
      } catch (e) {
        parsedAllergies = [];
      }
    }

    if (allergySeverity) {
      try {
        parsedSeverity = typeof allergySeverity === 'string'
          ? JSON.parse(allergySeverity)
          : allergySeverity;
      } catch (e) {
        parsedSeverity = {};
      }
    }

    // בניית מערך אלרגיות עם חומרה
    const allergiesArray = parsedAllergies.map(allergen => ({
      allergen,
      severity: parsedSeverity[allergen] || 'moderate'
    }));

    // בניית אובייקט הנתונים
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
        bmi: parseFloat(bmi)
      },
      medicalData: {
        allergies: allergiesArray,
        otherAllergies: otherAllergies?.trim() || ''
      },
      bloodTest: bloodTest || {},
      isCompleted: !!bloodTest?.fileName
    };

    // חיפוש נתונים קיימים או יצירת חדשים
    let userDataDoc = await UserData.findOne({ username: userData.username });

    if (userDataDoc) {
      // עדכון נתונים קיימים
      Object.assign(userDataDoc, userData);
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
 * עדכון תוצאות בדיקות דם
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
 * קבלת כל המשתמשים (למטרות ניהול)
 * GET /api/userdata/all
 */
export const getAllUserData = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await UserData.find()
      .select('-__v')
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