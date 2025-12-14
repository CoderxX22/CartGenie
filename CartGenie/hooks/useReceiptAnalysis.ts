import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../src/config/api';
import { AiResult, LoadingStep } from '../data/receiptTypes';

export const useReceiptAnalysis = (extractedItemsString?: string) => {
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('FETCHING_NAMES');
  const [aiResult, setAiResult] = useState<AiResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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

      console.log('💾 Saving receipt...');
      
      // חישוב סטטיסטיקות לשמירה
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
      console.log('✅ Receipt saved.');
    } catch (error: any) {
      console.error('❌ Failed to save:', error);
      throw error; // זורק שגיאה כדי שה-UI יציג Alert
    }
  };

  // --- Logic: Main Analysis Flow ---
  useEffect(() => {
    const runSmartAnalysis = async () => {
      try {
        setLoadingStep('FETCHING_NAMES');

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

        const productNames: string[] = dbData.data
            .filter((p: any) => !p.notFound)
            .map((p: any) => p.name);

        setProductCount(productNames.length);

        if (productNames.length === 0) throw new Error('None of the items were found in DB.');

        // 3. AI Analysis
        setLoadingStep('ANALYZING_HEALTH');
        const savedUsername = await AsyncStorage.getItem('loggedInUser');
        const currentUser = savedUsername || 'guest';

        const aiRes = await fetch(`${API_URL}/api/ai/consult-cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: currentUser, products: productNames })
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

  return {
    state: { aiResult, loadingStep, errorMsg, isSaved, productCount },
    actions: { saveReceiptToHistory }
  };
};