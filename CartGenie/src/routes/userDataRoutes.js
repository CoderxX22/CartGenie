import express from 'express';
// 1. תיקון ה-Typo בנתיב (וודא שזה תואם לשם התיקייה שלך)
import {
  saveUserData,
  getUserData,
  updateBloodTest,
  deleteUserData,
  getAllUserData
} from '../contollers/userDataController.js';

const router = express.Router();

router.post('/save', saveUserData);

router.get('/all/list', getAllUserData);

router.patch('/blood-test', updateBloodTest);

router.get('/:username', getUserData);

router.delete('/:username', deleteUserData);

export default router;