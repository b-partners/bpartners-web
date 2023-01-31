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

  return optionalSign + ` ${toMajors(amount).toFixed(2).toLocaleString()} ${Currency.EUR}`;
};

export const coloredPrettyPrintMinors = (amount: number, type?: TransactionTypeEnum): ReactElement => (
  <b style={{ color: type === TransactionTypeEnum.INCOME ? green[500] : red[500] }}> {prettyPrintMinors(amount, type)} </b>
);

export const toMinors = (amount: number): number => amount * 100;
// used for format input values
export const toMajors = (amount: number): number =>
  //TODO: subject to rounding errors, should use lib like Dinero
  amount / 100;
