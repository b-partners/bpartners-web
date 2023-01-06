import { Create, required, SimpleForm, TextInput, email } from 'react-admin';

const CustomerCreate = props => (
  <Create {...props} title='Clients' redirect='list'>
    <SimpleForm>
      <TextInput name='name' source='name' label='Nom' validate={required()} />
      <TextInput name='email' source='email' label='Email' validate={[email('Doit être un email valide'), required()]} />
      <TextInput name='address' source='address' label='Adresse' validate={required()} />
      <TextInput name='phone' source='phone' label='Téléphone' validate={required()} />
    </SimpleForm>
  </Create>
);

export default CustomerCreate;
