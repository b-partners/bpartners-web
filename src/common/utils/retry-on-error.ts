import { printError } from './print-error';

export const retryOnError = async (f: any, isErrorRetriable: any, backoffMillis = 1_000) => {
  try {
    await f();
  } catch (e) {
    if (isErrorRetriable(e)) {
      await new Promise(r => setTimeout(r, backoffMillis));
      retryOnError(f, isErrorRetriable, 2 * backoffMillis).catch(printError);
    } else {
      throw e;
    }
  }
};
