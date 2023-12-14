import { Create, SimpleForm } from 'react-admin';
import BPFormLayout from '../../common/components/BPFormLayout';
import FormCustomer from './components/FormCustomer';
import UserTypeRadioGroup from './components/UserTypeRadioGroup';

const CustomerCreate = props => {
  return (
    <BPFormLayout title='Création de client' resource='customers'>
      <Create {...props} title='Clients' redirect='list'>
        <SimpleForm>
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
      </Create>
    </BPFormLayout>
  );
};

export default CustomerCreate;
