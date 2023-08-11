/**
 * Cut string if it's length is greater than the max provided and add three dots (...) in the end
 * @param value string
 * @param max number
 */
export const stringCutter = (value: string, max: number) => {
  if (!value || value.length <= max) {
    return value;
  }
  return `${value.slice(0, max - 3)}...`;
};
