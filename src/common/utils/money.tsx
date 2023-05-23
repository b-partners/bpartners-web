import { green, red } from '@mui/material/colors';
import { ReactElement } from 'react';
import { TransactionTypeEnum } from 'bpartners-react-client';

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

export const coloredPrettyPrintMinors = (amount: number, type?: TransactionTypeEnum): ReactElement => (
  <b style={{ color: type === TransactionTypeEnum.INCOME ? green[500] : red[500] }}> {prettyPrintMinors(amount, type)} </b>
);

export const prettyPrintPercentMinors = (value: number): string => ((value / 100).toFixed(2) + ' %').replace('.', ',');

export const toMinors = (_amount: number | string): number => {
  const amount = +_amount || 0;
  return amount * 100;
};
// used for format input values
export const toMajors = (amount: number): number =>
  //TODO: subject to rounding errors, should use lib like Dinero
  isNaN(amount / 100) ? 0 : amount / 100;

export const prettyPrintMoney = (_money: string | number) => {
  const money = (+_money).toFixed(2);
  return `${money} ${Currency.EUR}`.replace('.', ',');
};
