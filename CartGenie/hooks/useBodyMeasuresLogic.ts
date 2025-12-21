// hooks/useBodyMeasuresLogic.ts
import { useState, useMemo } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { 
  CONSTRAINTS, normalizeNumericInput, toNumber, 
  calculateBMI, calculateWHtR, getBMIStatus, getWHtRStatus 
} from '../utils/bodyMetrics';

export const useBodyMeasuresLogic = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Inputs (Strings)
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [waist, setWaist] = useState('');
  
  // State
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ height?: string; weight?: string; waist?: string }>({});
  
  // Modals
  const [infoModal, setInfoModal] = useState<'none' | 'bmi' | 'whtr'>('none');

  // Derived Values
  const heightNum = toNumber(height);
  const weightNum = toNumber(weight);
  const waistNum = toNumber(waist);

  const bmi = useMemo(() => calculateBMI(heightNum, weightNum), [heightNum, weightNum]);
  const whtr = useMemo(() => calculateWHtR(heightNum, waistNum), [heightNum, waistNum]);

  const bmiStatus = useMemo(() => getBMIStatus(bmi), [bmi]);
  const whtrStatus = useMemo(() => getWHtRStatus(whtr), [whtr]);

  // Handlers
  const handleInput = (setter: (v: string) => void, field: keyof typeof errors) => (val: string) => {
    setter(normalizeNumericInput(val));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const e: typeof errors = {};
    const { HEIGHT_MIN, HEIGHT_MAX, WEIGHT_MIN, WEIGHT_MAX, WAIST_MIN, WAIST_MAX } = CONSTRAINTS;

    if (!heightNum) e.height = 'Height is required';
    else if (heightNum < HEIGHT_MIN || heightNum > HEIGHT_MAX) e.height = `Height must be ${HEIGHT_MIN}-${HEIGHT_MAX} cm`;

    if (!weightNum) e.weight = 'Weight is required';
    else if (weightNum < WEIGHT_MIN || weightNum > WEIGHT_MAX) e.weight = `Weight must be ${WEIGHT_MIN}-${WEIGHT_MAX} kg`;

    if (!waistNum) e.waist = 'Waist is required';
    else if (waistNum < WAIST_MIN || waistNum > WAIST_MAX) e.waist = `Waist must be ${WAIST_MIN}-${WAIST_MAX} cm`;

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onContinue = async () => {
    if (loading || !validate()) return;
    setLoading(true);

    try {
      const payload = {
        ...(params as any),
        height: String(heightNum),
        weight: String(weightNum),
        waist: String(waistNum),
        bmi: bmi?.toFixed(1) || '',
        whtr: whtr?.toFixed(3) || '',
      };
      
      await new Promise(r => setTimeout(r, 500)); // Simulaton

      router.push({ pathname: '/bloodTestUploadScreen', params: payload });
    } finally {
      setLoading(false);
    }
  };

  return {
    values: { height, weight, waist, bmi, whtr },
    status: { bmi: bmiStatus, whtr: whtrStatus },
    setters: { 
      setHeight: handleInput(setHeight, 'height'), 
      setWeight: handleInput(setWeight, 'weight'), 
      setWaist: handleInput(setWaist, 'waist') 
    },
    ui: { loading, errors, infoModal, setInfoModal },
    actions: { onContinue },
    isDisabled: loading || !height || !weight || !waist
  };
};