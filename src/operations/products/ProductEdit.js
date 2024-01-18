import { Edit, SimpleForm } from 'react-admin';
import BPFormLayout from '../../common/components/BPFormLayout';
import FormProduct from './components/FormProduct';
import EditToolBar from 'src/common/components/EditToolBar';

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
