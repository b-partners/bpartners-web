import { Box, Typography } from '@mui/material';
import { FC, ReactNode } from 'react';

interface BillingSectionProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export const BillingSection: FC<BillingSectionProps> = ({ icon, title, subtitle, children, ...rest }) => (
  <Box className='billing-section' {...rest}>
    <Box className='billing-section-header'>
      <Box className='billing-section-icon'>{icon}</Box>
      <Box>
        <Typography className='billing-section-title'>{title}</Typography>
        {subtitle && <Typography className='billing-section-subtitle'>{subtitle}</Typography>}
      </Box>
    </Box>
    {children}
  </Box>
);
