import { AccountHolder, AnnualRevenueTarget } from '@bpartners/typescript-client';
import * as Icons from '@mui/icons-material';
import { TypographyProps } from '@mui/material';
import { ReactNode } from 'react';

export interface AccountEditionAccordionProps {
  title: string;
  content?: ReactNode;
}

export interface AccountEditionLayoutProps {
  onClose: () => void;
}

export interface InfoShowProps extends Omit<TypographyProps, 'content'> {
  content: ReactNode;
  icon: keyof typeof Icons;
}

export interface SubjectToVatSwitchProps {
  data: AccountHolder;
}

export interface AccountHolderIncomeTargetsProps {
  revenueTargets: AnnualRevenueTarget[];
}

export interface AccountHolderLayoutProps {
  onEdit: () => void;
}

export interface AdditionalInformationProps {
  onEdit: () => void;
}
