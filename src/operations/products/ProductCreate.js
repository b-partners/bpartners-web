import { Create, SimpleForm, TextInput, NumberInput, required } from 'react-admin';

import { toMinors as moneyToMinors } from '../utils/money';
import { toMinors as vatToMinors } from '../utils/vat';

const ProductCreate = () => (
  <Create
    redirect='list'
    transform={record => ({ ...record, quantity: 1, unitPrice: moneyToMinors(record.unitPrice), vatPercent: vatToMinors(record.vatPercent) })}
  >
    <SimpleForm>
      <NumberInput validate={[required()]} min={0} source='unitPrice' label='Prix unitaire HT (en €)' sx={{ minWidth: '25vw' }} />
      <NumberInput validate={[required()]} min={0} source='vatPercent' label='TVA (en %)' sx={{ minWidth: '25vw' }} />
      <TextInput validate={[required()]} source='description' label='Description' multiline={true} minRows={3} fullWidth />
    </SimpleForm>
  </Create>
);

export default ProductCreate;
