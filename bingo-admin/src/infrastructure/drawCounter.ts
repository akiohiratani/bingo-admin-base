import { useCallback, useMemo, useState } from "react";

const DRAW_LIMIT = 5;

type UseDrawCounterResult = {
  drawCount: number;
  drawLimit: number;
  hasReachedLimit: boolean;
  incrementDrawCount: () => void;
};

export const useDrawCounter = (): UseDrawCounterResult => {
  const [drawCount, setDrawCount] = useState(0);

  const incrementDrawCount = useCallback(() => {
    setDrawCount((prev) => (prev >= DRAW_LIMIT ? prev : prev + 1));
  }, []);

  const hasReachedLimit = useMemo(() => drawCount >= DRAW_LIMIT, [drawCount]);

  return {
    drawCount,
    drawLimit: DRAW_LIMIT,
    hasReachedLimit,
    incrementDrawCount,
  };
};

export const DRAW_COUNT_LIMIT = DRAW_LIMIT;
