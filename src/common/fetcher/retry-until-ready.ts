export type RetryUntilReadyArgs<T> = {
  fetcher: () => Promise<T>;
  isReady: (data: T) => boolean;
  maxAttemps?: number;
  sleepDelay?: number;
  signal?: AbortSignal;
};

const abortError = (signal?: AbortSignal) => signal?.reason ?? new DOMException('Aborted', 'AbortError');

const sleep = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(abortError(signal));

    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError(signal));
    };

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    signal?.addEventListener('abort', onAbort, { once: true });
  });

export const retryUntilReady = async <T>({ fetcher, isReady, maxAttemps = 10, sleepDelay = 7_000, signal }: RetryUntilReadyArgs<T>): Promise<T> => {
  let attemp = 0;

  const doAttemp = async (): Promise<T> => {
    if (signal?.aborted) throw abortError(signal);
    attemp++;
    const response = await fetcher();

    if (!isReady(response)) {
      if (attemp >= maxAttemps) {
        throw new Error('Max attempts reached');
      }

      await sleep(sleepDelay, signal);
      return await doAttemp();
    }

    return response;
  };

  return await doAttemp();
};
