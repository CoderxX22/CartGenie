import UserData from '../models/userData.js';

/**
 * שמירת נתוני משתמש חדש או עדכון נתונים קיימים (לוגיקה מתוקנת)
 * POST /api/userdata/save
 */
export const saveUserData = async (req, res) => {
  try {
    const {
      username,
      // Personal Details
      firstName, lastName, birthDate, ageYears, sex,
      // Body Measurements
      weight, height, waist, bmi, whtr,
      // Medical Conditions
      illnesses, otherIllnesses,
      // Blood Test
      bloodTest
    } = req.body;

    // 1. בדיקת בסיס - חייבים לפחות שם משתמש
    if (!username) {
      return res.status(400).json({ success: false, message: 'Username is required' });
    }

    const normalizedUsername = username.toLowerCase().trim();

    // 2. חיפוש המשתמש במסד הנתונים
    let userDataDoc = await UserData.findOne({ username: normalizedUsername });

    // --- תרחיש א': עדכון משתמש קיים (Update) ---
    if (userDataDoc) {
      console.log(`🔄 Updating existing user: ${normalizedUsername}`);

      // עדכון שדות רק אם הם נשלחו ב-Body (בדיקה שאינם undefined)
      
      // Personal Details Update
      if (firstName) userDataDoc.personalDetails.firstName = firstName.trim();
      if (lastName) userDataDoc.personalDetails.lastName = lastName.trim();
      if (birthDate) userDataDoc.personalDetails.birthDate = new Date(birthDate);
      if (ageYears) userDataDoc.personalDetails.age = parseInt(ageYears);
      if (sex) userDataDoc.personalDetails.sex = sex;

      // Body Measurements Update
      if (weight !== undefined) userDataDoc.bodyMeasurements.weight = parseFloat(weight);
      if (height !== undefined) userDataDoc.bodyMeasurements.height = parseFloat(height);
      if (waist !== undefined) userDataDoc.bodyMeasurements.waist = parseFloat(waist);
      if (bmi !== undefined) userDataDoc.bodyMeasurements.bmi = parseFloat(bmi);
      if (whtr !== undefined) userDataDoc.bodyMeasurements.whtr = parseFloat(whtr);

      // Medical Data Update
      if (illnesses !== undefined) {
        let parsedIllnesses = [];
        try {
          parsedIllnesses = typeof illnesses === 'string' ? JSON.parse(illnesses) : illnesses;
        } catch (e) { parsedIllnesses = []; }
        
        userDataDoc.medicalData.illnesses = parsedIllnesses.map(name => ({ name, severity: 'moderate' }));
      }
      
      if (otherIllnesses !== undefined) {
        userDataDoc.medicalData.otherIllnesses = otherIllnesses.trim();
      }

      // Blood Test Update
      if (bloodTest && Object.keys(bloodTest).length > 0) {
        userDataDoc.bloodTest = bloodTest;
        if (bloodTest.fileName) userDataDoc.isCompleted = true;
      }

      await userDataDoc.save();

      return res.json({ 
        success: true, 
        message: 'User data updated successfully',
        data: userDataDoc,
        isNew: false
      });
    } 

    // --- תרחיש ב': יצירת משתמש חדש (Create) ---
    else {
      console.log(`🆕 Creating new user: ${normalizedUsername}`);

      const requiredFields = ['firstName', 'lastName', 'birthDate', 'sex', 'weight', 'height', 'waist', 'bmi'];
      const missing = requiredFields.filter(field => !req.body[field]);

      if (missing.length > 0) {
        return res.status(400).json({ 
          success: false, 
          message: `Missing required fields for new user: ${missing.join(', ')}` 
        });
      }

      let parsedIllnesses = [];
      if (illnesses) {
        try {
          parsedIllnesses = typeof illnesses === 'string' ? JSON.parse(illnesses) : illnesses;
        } catch (e) {}
      }

      const newUserData = {
        username: normalizedUsername,
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
          illnesses: parsedIllnesses.map(name => ({ name, severity: 'moderate' })),
          otherIllnesses: otherIllnesses?.trim() || ''
        },
        bloodTest: bloodTest || {},
        isCompleted: !!bloodTest?.fileName 
      };

      userDataDoc = await UserData.create(newUserData);

      return res.status(201).json({ 
        success: true, 
        message: 'User created successfully',
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
    if (!username) return res.status(400).json({ success: false, message: 'Username is required' });

    const userData = await UserData.findOne({ username: username.toLowerCase().trim() });
    if (!userData) return res.status(404).json({ success: false, message: 'User data not found' });

    res.json({ success: true, data: userData });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * עדכון תוצאות בדיקות דם בלבד
 * PATCH /api/userdata/blood-test
 */
export const updateBloodTest = async (req, res) => {
  try {
    const { username, fileName, fileUrl, fileSize } = req.body;
    if (!username) return res.status(400).json({ success: false, message: 'Username is required' });

    const userData = await UserData.findOne({ username: username.toLowerCase().trim() });
    if (!userData) return res.status(404).json({ success: false, message: 'User data not found' });

    userData.bloodTest = { fileName, fileUrl, fileSize, uploadDate: new Date(), status: 'uploaded' };
    userData.isCompleted = true;
    
    await userData.save();
    res.json({ success: true, message: 'Blood test updated', data: userData });
  } catch (error) {
    console.error('Error updating blood test:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * מחיקת נתוני משתמש (הפונקציה שהייתה חסרה לך)
 * DELETE /api/userdata/:username
 */
export const deleteUserData = async (req, res) => {
  try {
    const { username } = req.params;
    if (!username) return res.status(400).json({ success: false, message: 'Username is required' });

    const result = await UserData.deleteOne({ username: username.toLowerCase().trim() });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'User data not found' });
    }

    res.json({ success: true, message: 'User data deleted successfully' });
  } catch (error) {
    console.error('Error deleting user data:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

/**
 * קבלת כל המשתמשים
 * GET /api/userdata/all
 */
export const getAllUserData = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const users = await UserData.find().select('-__v').skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
    const total = await UserData.countDocuments();

    res.json({ 
      success: true, 
      data: users,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};