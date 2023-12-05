import { Create, SimpleForm } from 'react-admin';
import BPFormLayout from '../../common/components/BPFormLayout';
import FormProduct from './components/FormProduct';

const ProductCreate = () => {
  return (
    <BPFormLayout title='Création de produit' resource='products'>
      <Create redirect='list'>
        <SimpleForm>
          <FormProduct />
        </SimpleForm>
      </Create>
    </BPFormLayout>
  );
};

export default ProductCreate;
