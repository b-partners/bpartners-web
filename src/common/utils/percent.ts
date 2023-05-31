export const prettyPrintPercentMinors = (value: number, map?: boolean): string =>
  map !== false ? ((value / 100).toFixed(2) + ' %').replace('.', ',') : `${value} %`;
