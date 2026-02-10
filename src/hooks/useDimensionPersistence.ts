'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface DimensionRecord {
  data: Record<string, unknown>;
  scores: Record<string, unknown>;
}

export function useDimensionPersistence(opportunityId: string | undefined, dimensionKey: string) {
  const [initialData, setInitialData] = useState<Record<string, unknown> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load data on mount
  useEffect(() => {
    if (!opportunityId) return;

    let cancelled = false;
    setIsLoading(true);

    fetch(`/api/opportunities/${opportunityId}/dimensions`)
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        const rows: DimensionRecord[] = json.data ?? [];
        const match = rows.find((r: any) => r.dimension_key === dimensionKey);
        if (match?.data) {
          setInitialData(match.data as Record<string, unknown>);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [opportunityId, dimensionKey]);

  // Debounced save
  const saveData = useCallback(
    (formData: Record<string, unknown>, scores?: Record<string, unknown>) => {
      if (!opportunityId) return;

      if (timerRef.current) clearTimeout(timerRef.current);

      timerRef.current = setTimeout(() => {
        fetch(`/api/opportunities/${opportunityId}/dimensions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dimensionKey,
            data: formData,
            scores: scores ?? {},
          }),
        }).catch(() => {});
      }, 800);
    },
    [opportunityId, dimensionKey]
  );

  return { initialData, isLoading, saveData };
}
