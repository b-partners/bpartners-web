import { SubscriptionPlan, SubscriptionPlanComparisonCellKind, SubscriptionPlanComparisonEntry } from '@bpartners/typescript-client';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Box } from '@mui/material';
import { FC, Fragment } from 'react';
import { formatEuros } from './billing/utils';
import { SubscriptionComparisonStyle } from './style';

interface ComparisonRow {
  label: string;
  cells: (SubscriptionPlanComparisonEntry | undefined)[];
}

interface ComparisonSection {
  title: string;
  rows: ComparisonRow[];
}

interface SubscriptionComparisonProps {
  plans: SubscriptionPlan[];
}

const isUsageBased = (plan: SubscriptionPlan) => plan.billingType === 'USAGE_BASED';

const getPriceRows = (plans: SubscriptionPlan[]) => [
  { label: 'Prix HT / mois', values: plans.map(plan => (isUsageBased(plan) ? '—' : formatEuros(plan.priceInCentsWithoutVat))) },
  { label: 'Analyses toiture incluses / mois', values: plans.map(plan => String(plan.includedCreditsPerBillingPeriod ?? 0)) },
  { label: 'Prix / analyse supp. HT', values: plans.map(plan => formatEuros(plan.overageUnitPriceInCents ?? plan.priceInCentsWithoutVat)) },
];

const buildSections = (plans: SubscriptionPlan[]): ComparisonSection[] => {
  const reference = plans.find(plan => plan.comparisonEntries?.length)?.comparisonEntries ?? [];
  const sections: ComparisonSection[] = [];
  reference.forEach(entry => {
    const title = entry.sectionTitle ?? '';
    const existing = sections.find(section => section.title === title);
    const section = existing ?? { title, rows: [] };
    if (!existing) sections.push(section);
    section.rows.push({
      label: entry.label ?? '',
      cells: plans.map(plan => (plan.comparisonEntries ?? []).find(candidate => (candidate.sectionTitle ?? '') === title && candidate.label === entry.label)),
    });
  });
  return sections;
};

const renderCell = (entry?: SubscriptionPlanComparisonEntry) => {
  if (entry?.kind === SubscriptionPlanComparisonCellKind.INCLUDED) return <CheckRoundedIcon className='comparison-check' />;
  if (entry?.kind === SubscriptionPlanComparisonCellKind.TEXT) return entry.text ?? '';
  return (
    <Box component='span' className='comparison-dash'>
      —
    </Box>
  );
};

export const SubscriptionComparison: FC<SubscriptionComparisonProps> = ({ plans }) => (
  <Box sx={SubscriptionComparisonStyle}>
    <Box className='comparison-scroll'>
      <Box component='table' className='comparison-table'>
        <Box component='thead'>
          <Box component='tr'>
            <Box component='th' className='comparison-th comparison-th--label'>
              Fonctionnalités
            </Box>
            {plans.map((plan, index) => (
              <Box component='th' key={plan.id ?? index} className={`comparison-th${index === plans.length - 1 ? ' comparison-th--highlight' : ''}`}>
                {plan.name}
              </Box>
            ))}
          </Box>
        </Box>
        <Box component='tbody'>
          {getPriceRows(plans).map((row, rowIndex) => (
            <Box component='tr' key={`price-${rowIndex}`}>
              <Box component='td' className='comparison-td comparison-td--label'>
                {row.label}
              </Box>
              {row.values.map((value, cellIndex) => (
                <Box component='td' key={cellIndex} className='comparison-td'>
                  {value}
                </Box>
              ))}
            </Box>
          ))}
          {buildSections(plans).map((section, sectionIndex) => (
            <Fragment key={section.title || sectionIndex}>
              <Box component='tr' className='comparison-group'>
                <td className='comparison-group-cell' colSpan={plans.length + 1}>
                  {section.title}
                </td>
              </Box>
              {section.rows.map((row, rowIndex) => (
                <Box component='tr' key={rowIndex}>
                  <Box component='td' className='comparison-td comparison-td--label'>
                    {row.label}
                  </Box>
                  {row.cells.map((cell, cellIndex) => (
                    <Box component='td' key={cellIndex} className='comparison-td'>
                      {renderCell(cell)}
                    </Box>
                  ))}
                </Box>
              ))}
            </Fragment>
          ))}
        </Box>
      </Box>
    </Box>
  </Box>
);
