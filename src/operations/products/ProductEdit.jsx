import { Edit, SimpleForm } from 'react-admin';
import EditToolBar from '@/common/components/EditToolBar';
import BPFormLayout from '../../common/components/BPFormLayout';
import FormProduct from './components/FormProduct';

const ProductEdit = () => {
  return (
    <BPFormLayout title='Édition de produit' resource='products'>
      <Edit mutationMode='pessimistic'>
        <SimpleForm toolbar={<EditToolBar resource='products' style={{ justifyContent: 'space-between' }} />}>
          <FormProduct />
        </SimpleForm>
      </Edit>
    </BPFormLayout>
  );
};

export default ProductEdit;
