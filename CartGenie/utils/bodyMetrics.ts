// utils/bodyMetrics.ts

// Constraints
export const CONSTRAINTS = {
    HEIGHT_MIN: 40, HEIGHT_MAX: 250,
    WEIGHT_MIN: 30, WEIGHT_MAX: 300,
    WAIST_MIN: 30, WAIST_MAX: 200,
  };
  
  // Normalization
  export const normalizeNumericInput = (value: string) => {
    const cleaned = value.replace(/[^0-9.,]/g, '');
    const parts = cleaned.split(/[.,]/);
    if (parts.length <= 1) return cleaned;
    return `${parts[0]}.${parts.slice(1).join('')}`;
  };
  
  export const toNumber = (value: string) => {
    if (!value) return undefined;
    const normalized = value.replace(',', '.');
    const parsed = parseFloat(normalized);
    return Number.isNaN(parsed) ? undefined : parsed;
  };
  
  // Calculations
  export const calculateBMI = (heightCm?: number, weightKg?: number) => {
    if (!heightCm || !weightKg || heightCm < CONSTRAINTS.HEIGHT_MIN) return undefined;
    return weightKg / Math.pow(heightCm / 100, 2);
  };
  
  export const calculateWHtR = (heightCm?: number, waistCm?: number) => {
    if (!heightCm || !waistCm || heightCm < CONSTRAINTS.HEIGHT_MIN) return undefined;
    return waistCm / heightCm;
  };
  
  // Status Helpers
  export const getBMIStatus = (bmi?: number) => {
    if (!bmi) return null;
    if (bmi < 18.5) return { label: 'Underweight', bg: '#f9731633', text: '#9a3412' };
    if (bmi < 25) return { label: 'Healthy', bg: '#22c55e33', text: '#15803d' };
    if (bmi < 30) return { label: 'Overweight', bg: '#fbbf2433', text: '#92400e' };
    return { label: 'Obesity', bg: '#ef444433', text: '#b91c1c' };
  };
  
  export const getWHtRStatus = (whtr?: number) => {
    if (!whtr) return null;
    if (whtr < 0.40) return { label: 'Below range', bg: '#38bdf833', text: '#0369a1' };
    if (whtr < 0.50) return { label: 'Healthy', bg: '#22c55e33', text: '#15803d' };
    if (whtr < 0.60) return { label: 'Increased risk', bg: '#fbbf2433', text: '#92400e' };
    return { label: 'High risk', bg: '#ef444433', text: '#b91c1c' };
  };