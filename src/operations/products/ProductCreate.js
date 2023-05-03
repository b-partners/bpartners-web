import { Create, SimpleForm, TextInput, required } from 'react-admin';
import BPFormLayout from '../../common/components/BPFormLayout';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';
import { transformProduct } from './utils';
import { RaNumberInput } from 'src/common/components';

const ProductCreate = () => {
  const { companyInfo } = useGetAccountHolder();
  return (
    <BPFormLayout title='Création de produit' resource='products'>
      <Create redirect='list' transform={transformProduct}>
        <SimpleForm>
          <RaNumberInput validate={[required()]} source='unitPrice' label='Prix unitaire HT' sx={{ minWidth: '25vw' }} name='unitPrice' endText='€' />
          {companyInfo && companyInfo.isSubjectToVat && (
            <RaNumberInput validate={[required()]} source='vatPercent' label='TVA' sx={{ minWidth: '25vw' }} name='vatPercent' endText='%' />
          )}
          <TextInput validate={[required()]} source='description' label='Description' multiline={true} minRows={3} fullWidth name='description' />
        </SimpleForm>
      </Create>
    </BPFormLayout>
  );
};

export default ProductCreate;
