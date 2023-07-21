export const parseRatingValue = (value = -1) => (value < 0 ? null : value.toFixed(2));
export const parseRatingLastEvaluation = (value = '') => {
  const date = new Date(value);
  if (/Invalid Date/.test(date.toString())) {
    return null;
  }
  return date.toLocaleDateString();
};
