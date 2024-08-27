import { prettyPrintMoney } from '@/common/utils';
import { Typography } from '@mui/material';
import { FC } from 'react';
import { FunctionField } from 'react-admin';
import { RaNumberFieldProps } from './types';

export const RaMoneyField: FC<RaNumberFieldProps> = ({ render, map = true, ...others }) => {
  return <FunctionField {...others} render={(data: any) => <Typography>{prettyPrintMoney(render(data), map)}</Typography>} />;
};
