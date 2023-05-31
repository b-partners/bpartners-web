import { FunctionField } from 'react-admin';
import { Typography } from '@mui/material';
import { prettyPrintPercentMinors } from 'src/common/utils';

export const RaPercentageField = ({ render, map = true, ...others }) => {
  return <FunctionField {...others} render={data => <Typography>{prettyPrintPercentMinors(render(data), map)}</Typography>} />;
};
