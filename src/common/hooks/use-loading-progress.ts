import { useEffect, useRef } from 'react';
import { useStepProgress } from './use-step-progress';

export const useLoadingProgress = (isLoading: boolean, steps: number = 1, cap?: number) => {
  const { progress, start, complete, reset } = useStepProgress(steps, cap);
  const wasLoadingRef = useRef(false);

  useEffect(() => {
    if (isLoading) {
      reset();
      start();
      wasLoadingRef.current = true;
    } else if (wasLoadingRef.current) {
      complete();
      wasLoadingRef.current = false;
    }
  }, [isLoading, reset, start, complete]);

  return progress;
};
