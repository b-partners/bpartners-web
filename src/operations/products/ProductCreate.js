import { Create, SimpleForm, TextInput, NumberInput, required } from 'react-admin';
import { Box } from '@material-ui/core';

const boxStyle = { display: 'flex', width: '100%' };

const ProductCreate = () => (
  <Create redirect='list'>
    <SimpleForm>
      <TextInput source='description' validate={[required()]} fullWidth />
      <Box sx={boxStyle}>
        <NumberInput min={0} sx={{ marginRight: 10 }} source='quantity' validate={[required()]} />
        <NumberInput min={0} sx={{ marginRight: 10 }} source='unitPrice' validate={[required()]} />
        <NumberInput min={0} sx={{ marginRight: 10 }} source='vatPercent' validate={[required()]} />
      </Box>
      <Box sx={boxStyle}>
        <NumberInput min={0} sx={{ marginRight: 10 }} source='totalVat' validate={[required()]} />
        <NumberInput min={0} sx={{ marginRight: 10 }} source='totalPriceWithVat' validate={[required()]} />
      </Box>
    </SimpleForm>
  </Create>
);

export default ProductCreate;
