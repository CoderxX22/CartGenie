import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { getIllnesses, saveIllnesses } from '@/utils/illnessesStorage';

export function useIllnesses(illnessList: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [other, setOther] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Ref למעקב האם הקומפוננטה עדיין חיה (מונע קריסות ביציאה מהמסך)
  const isMounted = useRef(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Ref למעקב האם הטעינה הראשונית הסתיימה באמת (כדי למנוע דריסת נתונים)
  const isLoadedRef = useRef(false);

  // 1. מעקב אחרי Mount/Unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, []);

  // 2. טעינת נתונים בטוחה
  useEffect(() => {
    const loadData = async () => {
      try {
        const stored = await getIllnesses();
        
        // עדכון רק אם הקומפוננטה עדיין קיימת
        if (isMounted.current) {
          if (stored) {
            setSelected(new Set(stored.selected));
            setOther(stored.other ?? '');
          }
          isLoadedRef.current = true;
        }
      } catch (error) {
        console.error('Failed to load illnesses:', error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    loadData();
  }, []);

  // 3. שמירה אוטומטית (רק לאחר שהטעינה הסתיימה!)
  useEffect(() => {
    // אם עדיין טוענים או שהנתונים טרם נטענו מהזיכרון - לא שומרים
    if (loading || !isLoadedRef.current) return;

    if (saveTimer.current) clearTimeout(saveTimer.current);

    saveTimer.current = setTimeout(async () => {
      try {
        if (isMounted.current) {
           await saveIllnesses({
            selected: Array.from(selected),
            other,
          });
        }
      } catch (error) {
        console.error('Failed to save illnesses:', error);
      }
    }, 500); // הגדלתי מעט את ה-Debounce ל-500ms לביצועים טובים יותר

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [selected, other, loading]);

  const toggle = useCallback((item: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(illnessList));
  }, [illnessList]);

  const clearAll = useCallback(() => {
    setSelected(new Set());
    setOther('');
  }, []);

  const selectionPreview = useMemo(() => {
    const base = Array.from(selected);
    return other.trim() ? [...base, `Other: ${other.trim()}`] : base;
  }, [selected, other]);

  const hasSelection = selected.size > 0 || other.trim().length > 0;

  return {
    loading,
    selected,
    other,
    setOther,
    toggle,
    selectAll,
    clearAll,
    selectionPreview,
    hasSelection,
  };
}