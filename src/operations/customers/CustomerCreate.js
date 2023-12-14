import { Create, SimpleForm } from 'react-admin';
import BPFormLayout from '../../common/components/BPFormLayout';
import { useState } from 'react';
import FormCustomer from './components/FormCustomer';
import UserTypeRadioGroup from './components/UserTypeRadioGroup';

const CustomerCreate = props => {
  const [userType, setUserType] = useState('particulier');

  return (
    <BPFormLayout title='Création de client' resource='customers'>
      <UserTypeRadioGroup userType={userType} setUserType={setUserType} />
      <Create {...props} title='Clients' redirect='list'>
        <SimpleForm>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              columnGap: '20px',
              width: '80%',
            }}
          >
            <FormCustomer userType={userType} />
          </div>
        </SimpleForm>
      </Create>
    </BPFormLayout>
  );
};

export default CustomerCreate;
