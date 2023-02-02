import { Create, SimpleForm, TextInput, NumberInput, required } from 'react-admin';
import CustomFormLayout from '../utils/CustomFormLayout';

import { toMinors as moneyToMinors } from '../utils/money';
import useGetAccountHolder from '../utils/useGetAccountHolder';
import { toMinors as vatToMinors } from '../utils/vat';

const ProductCreate = () => {
  const { companyInfo } = useGetAccountHolder();
  return (
    <CustomFormLayout title='Création de produit' resource='products'>
      <Create
        redirect='list'
        transform={record => ({ ...record, quantity: 1, unitPrice: moneyToMinors(record.unitPrice), vatPercent: vatToMinors(record.vatPercent) })}
      >
        <SimpleForm>
          <NumberInput validate={[required()]} min={0} source='unitPrice' label='Prix unitaire HT (en €)' sx={{ minWidth: '25vw' }} name='unitPrice' />
          {companyInfo && companyInfo.isSubjectToVat && (
            <NumberInput validate={[required()]} min={0} source='vatPercent' label='TVA (en %)' sx={{ minWidth: '25vw' }} name='vatPercent' />
          )}
          <TextInput validate={[required()]} source='description' label='Description' multiline={true} minRows={3} fullWidth name='description' />
        </SimpleForm>
      </Create>
    </CustomFormLayout>
  );
};

export default ProductCreate;
