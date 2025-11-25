export type RetryUntilReadyArgs<T> = {
  fetcher: () => Promise<T>;
  isReady: (data: T) => boolean;
  maxAttemps?: number;
  sleepDelay?: number;
};

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

export const retryUntilReady = async <T>({ fetcher, isReady, maxAttemps = 10, sleepDelay = 7_000 }: RetryUntilReadyArgs<T>): Promise<T> => {
  let attemp = 0;

  const doAttemp = async (): Promise<T> => {
    attemp++;
    console.log('Attemp={}', attemp);
    const response = await fetcher();

    if (!isReady(response)) {
      if (attemp >= maxAttemps) {
        throw new Error('Max attempts reached');
      }

      await sleep(sleepDelay);
      return await doAttemp();
    }

    return response;
  };

  return await doAttemp();
};
