import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../src/config/api';
import { consultAiAgent } from '../services/AiConsultService';
import { Product, AIAnalysisResult, LoadingStep } from '../data/productTypes';

export const useProductAnalysis = (barcode?: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);
  const [loadingStep, setLoadingStep] = useState<LoadingStep>('IDLE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // --- Helper: Save History ---
  const saveToHistory = async (prod: Product, aiData: AIAnalysisResult) => {
    try {
      const username = await AsyncStorage.getItem('loggedInUser');
      if (!username) return; 

      await fetch(`${API_URL}/api/history/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          productName: prod.name,
          barcode: prod.barcode,
          brand: prod.brand,
          aiRecommendation: aiData.recommendation,
          aiReason: aiData.reason
        })
      });
      console.log('✅ History saved.');
    } catch (err) {
      console.error('❌ Failed to save history:', err);
    }
  };

  // --- Main Flow ---
  useEffect(() => {
    const runAnalysisFlow = async () => {
      if (!barcode) return;

      // Reset State
      setProduct(null);
      setAiResult(null);
      setErrorMsg(null);
      setLoadingStep('CHECKING_DB');

      try {
        // Step 1: Check DB
        const res = await fetch(`${API_URL}/api/products/batch-details`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ barcodes: [barcode] }),
        });

        const data = await res.json();
        
        if (!data.success || !data.data || data.data.length === 0) {
          setErrorMsg('Product not found in database');
          setLoadingStep('IDLE');
          return;
        }

        const foundProduct = data.data[0];
        if (!foundProduct || foundProduct.notFound || !foundProduct.name) {
          setErrorMsg('Item not in database. AI analysis skipped.');
          setLoadingStep('IDLE');
          return;
        }

        setProduct(foundProduct);

        // Step 2: AI Analysis
        setLoadingStep('ANALYZING_HEALTH');
        const savedUsername = await AsyncStorage.getItem('loggedInUser');
        const currentUser = savedUsername || 'guest';

        console.log(`👤 Analyzing "${foundProduct.name}" for: ${currentUser}`);
        const analysis = await consultAiAgent(foundProduct, currentUser);

        setAiResult(analysis);
        
        // Step 3: Save History (Background)
        saveToHistory(foundProduct, analysis);

      } catch (error) {
        console.error('Analysis Error:', error);
        setErrorMsg('Failed to analyze product.');
      } finally {
        setLoadingStep('IDLE');
      }
    };

    runAnalysisFlow();
  }, [barcode]);

  return {
    state: { product, aiResult, loadingStep, errorMsg },
  };
};