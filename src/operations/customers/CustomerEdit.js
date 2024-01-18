import { Edit, SimpleForm } from 'react-admin';
import BPFormLayout from '../../common/components/BPFormLayout';
import FormCustomer from './components/FormCustomer';
import CustomerTypeRadioGroup from './components/CustomerTypeRadioGroup';
import EditToolBar from 'src/common/components/EditToolBar';

const CustomerEdit = () => {
  return (
    <BPFormLayout title='Édition de client' resource='customers'>
      <Edit mutationMode='pessimistic'>
        <SimpleForm title='Édition de client' toolbar={<EditToolBar resource='customers' style={{ justifyContent: 'space-between' }} />}>
          <CustomerTypeRadioGroup />
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              columnGap: '20px',
              width: '80%',
            }}
          >
            <FormCustomer />
          </div>
        </SimpleForm>
      </Edit>
    </BPFormLayout>
  );
};

export default CustomerEdit;
