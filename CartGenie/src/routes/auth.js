import express from 'express';
import { register, login } from '../contollers/authController.js';

const router = express.Router();

// רישום משתמש – יצירת רשומה בקולקציית login_info
router.post('/register', register);

// התחברות משתמש
router.post('/login', login);

export default router;