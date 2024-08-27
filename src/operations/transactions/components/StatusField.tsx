import { TRANSACTION_STATUSES } from '@/constants';
import { Chip } from '@mui/material';
import { FC } from 'react';
import { StatusFieldProps } from './types';

export const StatusField: FC<StatusFieldProps> = ({ status }) => (
  <Chip style={{ backgroundColor: TRANSACTION_STATUSES[status]['color'], color: 'white' }} label={TRANSACTION_STATUSES[status]['label']} />
);
