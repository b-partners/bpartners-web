import React from 'react';
import { green, red } from '@material-ui/core/colors';

export enum Currency {
  EUR = '€',
  MGA = 'Ar',
  USD = '$',
  GBP = '£',
}

export const prettyPrintMoney = (amount: number, currency: Currency): string => (amount >= 0 ? ' +' : ' ') + amount.toLocaleString() + ' ' + currency;

export const coloredMoney = (amount: number, currency: Currency) => (
  <b style={{ color: amount < 0 ? red[500] : green[500] }}> {prettyPrintMoney(amount, currency)} </b>
);

// TODO: implement it in a proper way
export const normalizeAmount = (amount: number) => (amount ? (amount / 100).toFixed(2) : 0);
