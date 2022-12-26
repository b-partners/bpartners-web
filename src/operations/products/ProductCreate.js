import { Create, SimpleForm, TextInput, NumberInput, required } from 'react-admin';
import { Box } from '@mui/material';

import { toMinors } from '../utils/money';

const boxStyle = { margin: 0, padding: 0, display: 'flex', width: '35vw', justifyContent: 'space-between' };

const ProductCreate = () => (
  <Create redirect='list' transform={record => ({ ...record, unitPrice: toMinors(record.unitPrice) })}>
    <SimpleForm>
      <Box sx={boxStyle}>
        <NumberInput min={0} source='unitPrice' validate={[required()]} name='unitPrice' />
        <NumberInput min={0} source='vatPercent' validate={[required()]} name='vatPercent' />
      </Box>
      <TextInput sx={{ maxWidth: '35vw' }} multiline={true} minRows={3} source='description' validate={[required()]} fullWidth name='description' />
    </SimpleForm>
  </Create>
);

export default ProductCreate;
