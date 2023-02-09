import { Edit, email, required, SimpleForm, TextInput } from 'react-admin';
import CustomFormLayout from '../utils/CustomFormLayout';

const CustomerEdit = () => {
  return (
    <CustomFormLayout title='Édition de client' resource='customers'>
      <Edit mutationMode='pessimistic'>
        <SimpleForm title='Édition de client'>
          <TextInput name='name' source='name' label='Nom' validate={required()} />
          <TextInput name='email' source='email' label='Email' validate={[email('Doit être un email valide'), required()]} />
          <TextInput name='address' source='address' label='Adresse' validate={required()} />
          <TextInput name='phone' source='phone' label='Téléphone' validate={required()} />
        </SimpleForm>
      </Edit>
    </CustomFormLayout>
  );
};

export default CustomerEdit;
