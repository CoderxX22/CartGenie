import express from 'express';
import { getProductsBatch } from '../contollers/productController.js';

const router = express.Router();

// נתיב חדש לקבלת פרטים עבור רשימת ברקודים
router.post('/batch-details', getProductsBatch);

export default router;