export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
export const wait = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));
