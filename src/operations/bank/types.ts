import { Account, Bank } from '@bpartners/typescript-client';
import { BoxProps } from '@mui/material';
import { ReactNode } from 'react';

export interface BankDisconnectionProps {
  bank: Bank;
  setAccount: (account: Account) => void;
}

export interface BankProps {
  aside: ReactNode;
  account: Account;
  setAccount: (account: Account) => void;
}

export interface BankCardTextProps extends BoxProps {
  title: string;
  label: string;
}

export interface NoBankProps {
  aside: ReactNode;
}
