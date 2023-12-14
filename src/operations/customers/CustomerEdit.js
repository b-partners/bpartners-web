import { Edit, SimpleForm } from 'react-admin';
import BPFormLayout from '../../common/components/BPFormLayout';
import FormCustomer from './components/FormCustomer';
import UserTypeRadioGroup from './components/UserTypeRadioGroup';

const CustomerEdit = () => {
  return (
    <BPFormLayout title='Édition de client' resource='customers'>
      <Edit mutationMode='pessimistic'>
        <SimpleForm title='Édition de client'>
          <UserTypeRadioGroup />
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
