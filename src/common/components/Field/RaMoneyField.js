import { FunctionField } from 'react-admin';
import { Typography } from '@mui/material';
import { prettyPrintMinors } from 'src/common/utils/money';

export const RaMoneyField = ({ render, ...others }) => {
  return <FunctionField {...others} render={data => <Typography>{prettyPrintMinors(render(data))}</Typography>} />;
};
