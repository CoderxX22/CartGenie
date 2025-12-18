import express from 'express';
import { register, login } from '../contollers/authController.js';
import { googleLogin } from '../contollers/socialAuthController.js';

const router = express.Router();

// נתיבים רגילים
router.post('/register', register);
router.post('/login', login);

// נתיב גוגל
router.post('/google', googleLogin);

export default router;