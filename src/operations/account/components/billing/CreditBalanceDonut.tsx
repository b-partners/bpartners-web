import { CreditBalance } from '@bpartners/typescript-client';
import { Box, Typography } from '@mui/material';
import { FC, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { formatCredits } from './utils';

interface CreditSlice {
  key: string;
  label: string;
  value: number;
}

interface CreditBalanceDonutProps {
  balance?: CreditBalance;
}

export const CreditBalanceDonut: FC<CreditBalanceDonutProps> = ({ balance }) => {
  const [activeIndex, setActiveIndex] = useState<number>();
  const slices: CreditSlice[] = [
    { key: 'granted', label: 'Crédits inclus', value: balance?.grantedCredits ?? 0 },
    { key: 'purchased', label: 'Crédits achetés', value: balance?.purchasedCredits ?? 0 },
  ].filter(({ value }) => value > 0);
  const activeSlice = activeIndex === undefined ? undefined : slices[activeIndex];

  const center = (
    <Box className='billing-donut-center'>
      <Typography className='billing-donut-value'>{formatCredits(activeSlice ? activeSlice.value : balance?.spendableCredits)}</Typography>
      <Typography className='billing-donut-label'>{activeSlice ? activeSlice.label : 'Crédits disponibles'}</Typography>
    </Box>
  );

  if (slices.length === 0)
    return (
      <Box className='billing-donut'>
        <Box className='billing-donut-empty' />
        {center}
      </Box>
    );

  return (
    <Box className='billing-donut'>
      <ResponsiveContainer width='100%' height='100%'>
        <PieChart>
          <Pie
            data={slices}
            dataKey='value'
            nameKey='label'
            innerRadius='72%'
            outerRadius='100%'
            paddingAngle={slices.length > 1 ? 3 : 0}
            stroke='none'
            isAnimationActive={false}
            onMouseEnter={(_data, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(undefined)}
          >
            {slices.map(({ key }) => (
              <Cell key={key} className={`billing-donut-slice billing-donut-slice--${key}`} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      {center}
    </Box>
  );
};
