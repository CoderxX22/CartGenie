import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../src/config/api';
import { AiResult, LoadingStep } from '../data/receiptTypes';

export const useReceiptAnalysis = (extractedItemsString?: string) => {
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('FETCHING_NAMES');
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // 👇 הוספתי משתנה חדש עבור הודעת אזהרה
  const [warningMsg, setWarningMsg] = useState<string | null>(null); 
  const [isSaved, setIsSaved] = useState(false);
  const [productCount, setProductCount] = useState(0);

  // --- Logic: Save to History ---
  const saveReceiptToHistory = async () => {
    if (isSaved || !aiResult) return;

    try {
      const username = await AsyncStorage.getItem('loggedInUser');
      if (!username || username === 'guest') {
        throw new Error("You must be logged in to save history.");
      }

      const safeCount = aiResult.analyzedItems.filter(i => i.recommendation === 'SAFE').length;
      const cautionCount = aiResult.analyzedItems.filter(i => i.recommendation === 'CAUTION').length;
      const avoidCount = aiResult.analyzedItems.filter(i => i.recommendation === 'AVOID').length;

      await fetch(`${API_URL}/api/history/receipts/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          storeName: 'Scanned Receipt', 
          totalPrice: 0, 
          itemCount: productCount,
          healthSummary: { safe: safeCount, caution: cautionCount, avoid: avoidCount }
        })
      });

      setIsSaved(true);
    } catch (error: any) {
      console.error('❌ Failed to save:', error);
      throw error;
    }
  };

  // --- Logic: Main Analysis Flow ---
  useEffect(() => {
    const runSmartAnalysis = async () => {
      try {
        setLoadingStep('FETCHING_NAMES');
        setWarningMsg(null); // איפוס אזהרות קודמות

        // 1. Parse Barcodes
        let barcodes: string[] = [];
        try {
          barcodes = extractedItemsString ? JSON.parse(extractedItemsString) : [];
        } catch (e) {
          throw new Error('Failed to read barcode list.');
        }

        if (barcodes.length === 0) throw new Error('No barcodes found to analyze.');

        // 2. Resolve Names from DB
        const dbRes = await fetch(`${API_URL}/api/products/batch-details`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcodes })
        });

        const dbData = await dbRes.json();
        if (!dbData.success) throw new Error('Failed to resolve products.');

        // 👇 לוגיקה חדשה: הפרדה בין מה שזוהה למה שלא
        const validProducts = dbData.data.filter((p: any) => !p.notFound).map((p: any) => p.name);
        const notFoundCount = dbData.data.length - validProducts.length;

        // אם יש פריטים שלא זוהו, מציגים אזהרה למשתמש
        if (notFoundCount > 0) {
          setWarningMsg(`${notFoundCount} items were not identified due to unclear receipt quality.`);
        }

        setProductCount(validProducts.length);

        // אם *אף* מוצר לא זוהה, נעצור את התהליך ונעיף שגיאה
        if (validProducts.length === 0) {
          throw new Error('None of the items could be read clearly. Please try taking a better photo.');
        }

        // 3. AI Analysis (שולחים רק את המוצרים התקינים)
        setLoadingStep('ANALYZING_HEALTH');
        const savedUsername = await AsyncStorage.getItem('loggedInUser');
        const currentUser = savedUsername || 'guest';

        const aiRes = await fetch(`${API_URL}/api/ai/consult-cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentUser, products: validProducts })
        });

        const aiJson = await aiRes.json();

        if (aiJson.success && aiJson.data) {
           setAiResult(aiJson.data);
        } else {
           throw new Error(aiJson.message || 'AI Analysis failed');
        }

      } catch (error: any) {
        console.error('Analysis Error:', error);
        setErrorMsg(error.message || 'Analysis failed.');
      } finally {
        setLoadingStep('IDLE');
      }
    };

    runSmartAnalysis();
  }, [extractedItemsString]);

  // 👇 הוספתי את warningMsg ל-state המוחזר
  return {
    state: { aiResult, loadingStep, errorMsg, warningMsg, isSaved, productCount },
    actions: { saveReceiptToHistory }
  };
};