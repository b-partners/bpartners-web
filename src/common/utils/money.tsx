enum Currency {
  EUR = '€',
}

export const prettyPrintMinors = (amount: number): string => `${toMajors(amount).toFixed(2).toLocaleString()} ${Currency.EUR}`.replace('.', ',');

export const prettyPrintMoney = (_amount: number, mapToMajor = true) => {
  const amount = mapToMajor ? toMajors(+_amount || 0) : +_amount || 0;
  return `${amount.toFixed(2).toLocaleString()} ${Currency.EUR}`.replace('.', ',');
};

export const toMinors = (amount: number): number => (isNaN(+amount * 100) ? 0 : +amount * 100);
// used for format input values
export const toMajors = (amount: number): number => (isNaN(+amount / 100) ? 0 : +amount / 100);
