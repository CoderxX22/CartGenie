import express from 'express';
// ייבוא הבקרים עם הסיומת .js
import { register, login } from '../contollers/authController.js'; 

const router = express.Router();

// נתיב לרישום משתמש: POST /api/auth/register
router.post('/register', register);

// נתיב להתחברות משתמש: POST /api/auth/login
router.post('/login', login);

export default router;