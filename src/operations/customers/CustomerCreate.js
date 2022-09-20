import { Create, required, SimpleForm, TextInput } from 'react-admin';

const CustomerCreate = props => (
  <Create {...props} title='Clients'>
    <SimpleForm>
      <TextInput source='name' label='Nom' validate={required()} />
      <TextInput source='email' label='Email' validate={required()} />
      <TextInput source='address' label='Addresse' validate={required()} />
      <TextInput source='phone' label='Téléphone' validate={required()} />
    </SimpleForm>
  </Create>
);

export default CustomerCreate;
