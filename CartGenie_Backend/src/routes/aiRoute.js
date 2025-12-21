import express from 'express';
// וודא שהשם תואם (רגיש לאותיות)
import UserData from '../models/userData.js'; 
// 👇 אנו מייבאים רק את הסוכן המאוחד
import { analyzeFoodSafety } from '../agents/foodAnalysisAgent.js';

const router = express.Router();

// ---------------------------------------------------------
// ROUTE 1: Single Product Analysis (Scan Barcode)
// ---------------------------------------------------------
router.post('/consult', async (req, res) => {  
  try {
    let { username, product } = req.body;
    const cleanUsername = username ? username.trim().toLowerCase() : 'guest';
    
    if (!product) {
      return res.status(400).json({ success: false, message: 'Missing product data' });
    }

    const profileForAI = await getUserProfileForAI(cleanUsername);
    // 👇 שימוש בפונקציה המאוחדת
    const analysisResult = await analyzeFoodSafety(profileForAI, product);

    res.json({ success: true, data: analysisResult });

  } catch (error) {
    console.error('🔥 SINGLE ROUTE ERROR:', error);
    res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
  }
});

// ---------------------------------------------------------
// ROUTE 2: Cart Analysis (Scan Receipt)
// ---------------------------------------------------------
router.post('/consult-cart', async (req, res) => {
  try {
    let { username, products } = req.body; // products = array of strings
    const cleanUsername = username ? username.trim().toLowerCase() : 'guest';

    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'Missing products list' });
    }

    const profileForAI = await getUserProfileForAI(cleanUsername);
    
    // 👇 התיקון כאן: שימוש באותה פונקציה גם לסל הקניות!
    // הסוכן יזהה לבד שזה מערך ויחזיר את הציון (Score) והרשימה
    const analysisResult = await analyzeFoodSafety(profileForAI, products);

    res.json({ success: true, data: analysisResult });

  } catch (error) {
    console.error('🔥 CART ROUTE ERROR:', error);
    res.status(500).json({ success: false, message: `Server Error: ${error.message}` });
  }
});

// ---------------------------------------------------------
// HELPER: שליפת משתמש
// ---------------------------------------------------------
async function getUserProfileForAI(username) {
  let userRecord = null;
  
  try {
    userRecord = await UserData.findOne({ username: username });
  } catch (dbError) {
    console.error('❌ DB Query failed:', dbError.message);
  }

  if (userRecord) {
    const illnessList = userRecord.medicalData?.illnesses 
      ? userRecord.medicalData.illnesses.map(i => `${i.name} (${i.severity})`)
      : [];

    return {
      age: userRecord.personalDetails?.age || 30,
      illnesses: illnessList,
      otherIllnesses: userRecord.medicalData?.otherIllnesses || 'None'
    };
  } else {
    // Fallback Guest
    console.log(`⚠️ User "${username}" not found. Using Guest fallback.`);
    return {
      age: 30,
      illnesses: [],
      otherIllnesses: 'None (Guest User)'
    };
  }
}

export default router;