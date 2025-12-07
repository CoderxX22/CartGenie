import Product from '../models/product.js';
// הסרנו את הייבוא של הסקרייפר
// import { fetchProductData } from '../services/productScraper.js';

/**
 * פונקציה שמקבלת מערך ברקודים ומחזירה מוצרים מה-DB בלבד
 * POST /api/products/batch-details
 */
export const getProductsBatch = async (req, res) => {
  try {
    const { barcodes } = req.body; 

    if (!barcodes || !Array.isArray(barcodes)) {
      return res.status(400).json({ success: false, message: 'Invalid barcodes array' });
    }

    const results = [];

    // עבור כל ברקוד...
    for (const barcode of barcodes) {
      // בדיקה ב-DB המקומי בלבד
      const product = await Product.findOne({ barcode });

      if (product) {
        results.push(product);
      } else {
        // אם לא נמצא ב-DB - מחזירים תשובה שלילית מיד
        results.push({
          barcode,
          name: 'Product Not Found in DB',
          image: null,
          notFound: true
        });
      }
    }

    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Batch product error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};