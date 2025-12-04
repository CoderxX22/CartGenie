import express from 'express';
import { 
  saveUserData, 
  getUserData, 
  updateBloodTest, 
  deleteUserData, 
  getAllUserData 
} from '../contollers/userDataController.js';

const router = express.Router();

// נתיב לשמירת/עדכון נתונים (תואם לקריאה באפליקציה: /api/userdata/save)
router.post('', saveUserData);

// נתיב לעדכון בדיקות דם בלבד
router.patch('/blood-test', updateBloodTest);

// נתיבים נוספים לניהול ושליפה
router.get('/all', getAllUserData);
router.get('/:username', getUserData);
router.delete('/:username', deleteUserData);

export default router;