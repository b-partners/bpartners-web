export const prettyPrintMinors = (value: number): string => (value / 100).toFixed(2) + ' %';
export const toMinors = (value: number): number => value * 100;
export const toMajors = (value: number): number => value / 100;
