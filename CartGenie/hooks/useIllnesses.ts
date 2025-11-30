// src/hooks/useIllnesses.ts
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { getIllnesses, saveIllnesses } from '@/utils/illnessesStorage';

export function useIllnesses(illnessList: string[]) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [other, setOther] = useState('');
  const [loading, setLoading] = useState(true);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Загрузка сохранённых заболеваний при монтировании
  useEffect(() => {
    (async () => {
      const stored = await getIllnesses();
      if (stored) {
        setSelected(new Set(stored.selected));
        setOther(stored.other ?? '');
      }
      setLoading(false);
    })();
  }, []);

  // Автосохранение при изменении
  useEffect(() => {
    if (loading) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveIllnesses({
        selected: Array.from(selected),
        other,
      });
    }, 300);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [selected, other, loading]);

  const toggle = useCallback((item: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(item) ? next.delete(item) : next.add(item);
      return next;
    });
  }, []);

  const selectAll = useCallback(() => setSelected(new Set(illnessList)), [illnessList]);
  const clearAll = useCallback(() => setSelected(new Set()), []);

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
