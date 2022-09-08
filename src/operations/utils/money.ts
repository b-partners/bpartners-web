export enum Currency {
  EUR = '€',
  MGA = 'Ar',
  USD = '$',
  GBP = '£',
}

export const prettyPrintMoney = (amount: number, currency: Currency): string => (amount >= 0 ? '+' : '') + amount.toLocaleString() + ' ' + currency;
