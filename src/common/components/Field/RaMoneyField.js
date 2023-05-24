import { FunctionField } from 'react-admin';
import { Typography } from '@mui/material';
import { prettyPrintMoney } from 'src/common/utils';

export const RaMoneyField = ({ render, map = true, ...others }) => {
  return <FunctionField {...others} render={data => <Typography>{prettyPrintMoney(render(data), map)}</Typography>} />;
};
