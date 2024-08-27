import { prettyPrintMinors } from '@/common/utils';
import { FC } from 'react';
import { AccountHolderIncomeTargetsProps } from './types';

export const AccountHolderIncomeTargets: FC<AccountHolderIncomeTargetsProps> = ({ revenueTargets }) => {
  const currentYear = new Date().getFullYear();
  const incomeTargets = revenueTargets?.filter(item => item.year === currentYear);
  const incomeTargetsValue =
    (incomeTargets || []).length > 0 && incomeTargets[0]
      ? prettyPrintMinors(incomeTargets[0].amountTarget)
      : `Vous n'avez pas encore défini votre objectif pour cette année.`;

  return <span>{incomeTargetsValue}</span>;
};
