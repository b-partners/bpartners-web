import { FunctionField } from 'react-admin';
import { Typography } from '@mui/material';
import { prettyPrintMoney } from 'src/common/utils/money';

export const RaMoneyField = ({ render, ...others }) => {
  return <FunctionField {...others} render={data => <Typography>{prettyPrintMoney(render(data))}</Typography>} />;
};
