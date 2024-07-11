import { Create, SimpleForm } from 'react-admin';
import BPFormLayout from '../../common/components/BPFormLayout';
import CustomerTypeRadioGroup from './components/CustomerTypeRadioGroup';
import FormCustomer from './components/FormCustomer';

const CustomerCreate = props => {
  return (
    <BPFormLayout title='Création de client' resource='customers'>
      <Create {...props} title='Clients' redirect='list'>
        <SimpleForm>
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
      </Create>
    </BPFormLayout>
  );
};

export default CustomerCreate;
