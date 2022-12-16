import React from 'react';
import { green, red } from '@mui/material/colors';
import { TransactionTypeEnum } from '../../gen/bpClient';

export enum Currency {
  EUR = '€',
  MGA = 'Ar',
  USD = '$',
  GBP = '£',
}

export const prettyPrintMoney = (amount: number, currency: Currency, type?: TransactionTypeEnum): string => {
  let localVarMoney = '';

  if (type) {
    localVarMoney += getSign(type);
  }

  return localVarMoney + ` ${amount.toLocaleString()} ${currency}`;
};

const getSign = (type: TransactionTypeEnum) => (type === TransactionTypeEnum.INCOME ? '+' : '-');

export const coloredMoney = (amount: number, currency: Currency, type: TransactionTypeEnum) => (
  <b style={{ color: type === TransactionTypeEnum.OUTCOME ? red[500] : green[500] }}> {prettyPrintMoney(amount, currency, type)} </b>
);

// TODO: implement it in a proper way
export const normalizeAmount = (amount: number) => (amount ? (amount / 100).toFixed(2) : 0);
