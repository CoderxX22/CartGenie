export interface AnalyzedItem {
    productName: string;
    allowed: boolean;
    recommendation: 'SAFE' | 'CAUTION' | 'AVOID';
    reason: string;
  }
  
  export interface AiResult {
    healthMatchScore: number;
    analyzedItems: AnalyzedItem[];
  }
  
  export type LoadingStep = 'IDLE' | 'FETCHING_NAMES' | 'ANALYZING_HEALTH';