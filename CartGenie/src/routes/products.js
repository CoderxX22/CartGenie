import express from 'express';
const router = express.Router();

// ВОЗВРАЩАЕМ ТОЛЬКО BARCODE, БЕЗ БД
router.get('/:barcode', (req, res) => {
  const barcode = req.params.barcode;

  return res.json({
    success: true,
    product: {
      barcode,
      name: `Product ${barcode}`, // временно, если хочешь значение
    }
  });
});

export default router;
