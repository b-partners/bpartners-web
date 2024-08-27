import { TransactionTypeEnum } from '@bpartners/typescript-client';
import { green, red } from '@mui/material/colors';
import { ReactElement } from 'react';

enum Currency {
  EUR = '€',
}

export const prettyPrintMinors = (amount: number, type?: TransactionTypeEnum): string => {
  let optionalSign = '';
  if (type) {
    optionalSign = type === TransactionTypeEnum.INCOME ? '+' : '-';
  }

  return optionalSign + ` ${toMajors(amount).toFixed(2).toLocaleString()} ${Currency.EUR}`.replace('.', ',');
};

export const prettyPrintMoney = (_amount: number, mapToMajor = true) => {
  let amount = mapToMajor ? toMajors(+_amount || 0) : +_amount || 0;
  return `${amount.toFixed(2).toLocaleString()} ${Currency.EUR}`.replace('.', ',');
};

export const coloredPrettyPrintMinors = (amount: number, type?: TransactionTypeEnum): ReactElement => (
  <b style={{ color: type === TransactionTypeEnum.INCOME ? green[500] : red[500] }}> {prettyPrintMinors(amount, type)} </b>
);

export const toMinors = (amount: number): number => (isNaN(+amount * 100) ? 0 : +amount * 100);
// used for format input values
export const toMajors = (amount: number): number => (isNaN(+amount / 100) ? 0 : +amount / 100);
