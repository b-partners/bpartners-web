export enum Currency {
  EUR = '€',
  MGA = 'Ar',
  USD = '$',
  GBP = '£',
}

export const prettyPrintMoney = (amount: number, currency: Currency): string => currency + (amount >= 0 ? ' +' : ' ') + amount.toLocaleString();
