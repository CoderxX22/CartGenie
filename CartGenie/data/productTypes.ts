export interface ProductNutrients {
    calories?: number;
    sugar?: number;
    sodium?: number;
  }
  
  export interface Product {
    name?: string;
    brand?: string;
    barcode?: string;
    notFound?: boolean;
    nutrients?: ProductNutrients;
    ingredients?: string;
  }
  
  export interface AlternativeProduct {
      name: string;
      reason: string;
  }
  
  // זהו הטיפוס המדויק שחוזר מה-AI Service שלך
  export interface AIAnalysisResult {
    recommendation: 'SAFE' | 'CAUTION' | 'AVOID';
    reason: string;
    alternatives?: AlternativeProduct[];
  }
  
  export type LoadingStep = 'IDLE' | 'CHECKING_DB' | 'ANALYZING_HEALTH';