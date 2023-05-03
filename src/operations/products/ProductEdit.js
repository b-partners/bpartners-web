import { Edit, required, SimpleForm, TextInput } from 'react-admin';
import BPFormLayout from '../../common/components/BPFormLayout';
import useGetAccountHolder from '../../common/hooks/use-get-account-holder';
import { transformProduct } from './utils';
import { RaNumberInput } from 'src/common/components';

const ProductEdit = () => {
  const { companyInfo } = useGetAccountHolder();
  const isSubjectToVat = companyInfo && companyInfo.isSubjectToVat;

  return (
    <BPFormLayout title='Édition de produit' resource='products'>
      <Edit transform={transformProduct} mutationMode='pessimistic'>
        <SimpleForm title='Édition de produit'>
          <TextInput name='description' source='description' label='Description' validate={required()} />
          <RaNumberInput name='unitPrice' source='unitPrice' label='Prix unitaire HT' endText='€' />
          {isSubjectToVat && <RaNumberInput source='vatPercent' label='TVA' endText='%' />}
        </SimpleForm>
      </Edit>
    </BPFormLayout>
  );
};

export default ProductEdit;
