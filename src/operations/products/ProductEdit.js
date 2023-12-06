import { Edit, SimpleForm } from 'react-admin';
import BPFormLayout from '../../common/components/BPFormLayout';
import FormProduct from './components/FormProduct';

const ProductEdit = () => {
  return (
    <BPFormLayout title='Édition de produit' resource='products'>
      <Edit mutationMode='pessimistic'>
        <SimpleForm>
          <FormProduct />
        </SimpleForm>
      </Edit>
    </BPFormLayout>
  );
};

export default ProductEdit;
