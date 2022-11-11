import { Create, required, SimpleForm, TextInput, email } from 'react-admin';

const CustomerCreate = props => (
  <Create {...props} title='Clients' redirect='list'>
    <SimpleForm>
      <TextInput source='name' label='Nom' validate={required()} />
      <TextInput source='email' label='Email' validate={[email('Doit être un email valide'), required()]} />
      <TextInput source='address' label='Addresse' validate={required()} />
      <TextInput source='phone' label='Téléphone' validate={required()} />
    </SimpleForm>
  </Create>
);

export default CustomerCreate;
