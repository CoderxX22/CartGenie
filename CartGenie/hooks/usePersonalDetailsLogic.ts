import { useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';

export type Sex = '' | 'male' | 'female';

interface FormState {
  firstName: string;
  lastName: string;
  birthDate: Date | null;
  ageYears: string;
  sex: Sex;
}

export const usePersonalDetailsLogic = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [ageYears, setAgeYears] = useState<string>('');
  const [sex, setSex] = useState<Sex>('');
  
  const [showSexPicker, setShowSexPicker] = useState(false);
  const [showAgePicker, setShowAgePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tempSex, setTempSex] = useState<Sex>('');
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const formatDate = (d?: Date | null) => {
    if (!d) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const calculateAge = (selected: Date) => {
    const today = new Date();
    let years = today.getFullYear() - selected.getFullYear();
    const m = today.getMonth() - selected.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < selected.getDate())) years--;
    return String(years);
  };

  const onAgeChange = (event: any, selectedDate?: Date) => {
    // 1. באנדרואיד חייבים לסגור את הפיקר מיד כדי למנוע לולאה אינסופית
    if (Platform.OS === 'android') {
      setShowAgePicker(false);
    }

    // 2. אם המשתמש ביטל (לחץ Cancel) - יוצאים
    if (event.type === 'dismissed') {
      return;
    }

    // 3. אם המשתמש לחץ 'אישור' (set) ויש תאריך
    if (event.type === 'set' && selectedDate) {
      setBirthDate(selectedDate);
      setAgeYears(calculateAge(selectedDate));
      if (errors.birthDate) setErrors(prev => ({ ...prev, birthDate: undefined }));
    }
  };

  const openSexPicker = () => {
    Keyboard.dismiss();
    setShowAgePicker(false);
    setTempSex(sex);
    setShowSexPicker(true);
  };

  const confirmSexSelection = () => {
    setSex(tempSex);
    if (errors.sex) setErrors(prev => ({ ...prev, sex: undefined }));
    setShowSexPicker(false);
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!firstName.trim()) e.firstName = 'First name is required';
    if (!lastName.trim()) e.lastName = 'Last name is required';
    if (!birthDate) e.birthDate = 'Birth date is required';
    if (!sex) e.sex = 'Sex is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onContinue = async () => {
    if (loading || !validate()) return;
    setLoading(true);

    try {
      const payload = {
        ...(params as any),
        firstName,
        lastName,
        birthDate: birthDate?.toISOString() || '',
        ageYears,
        sex,
      };

      await new Promise(r => setTimeout(r, 700));

      router.push({
        pathname: '/bodyMeasures',
        params: payload,
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    form: { firstName, lastName, birthDate, ageYears, sex },
    setters: { setFirstName, setLastName, setSex, setTempSex },
    ui: { showSexPicker, setShowSexPicker, showAgePicker, setShowAgePicker, loading, tempSex },
    errors,
    params,
    actions: { onAgeChange, openSexPicker, confirmSexSelection, onContinue, validate },
    helpers: { formatDate },
    isDisabled: loading || !firstName || !lastName || !birthDate || !sex
  };
};