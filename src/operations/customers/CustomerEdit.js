import { Edit, email, required, SimpleForm, TextInput } from 'react-admin';
import BPFormLayout from '../../common/components/BPFormLayout';

const CustomerEdit = () => {
  return (
    <BPFormLayout title='Édition de client' resource='customers'>
      <Edit mutationMode='pessimistic'>
        <SimpleForm title='Édition de client'>
          <TextInput name='lastName' source='lastName' label='Nom' validate={required()} />
          <TextInput name='firstName' source='firstName' label='Prénom' validate={required()} />
          <TextInput name='email' source='email' label='Email' validate={[email('Doit être un email valide'), required()]} />
          <TextInput name='address' source='address' label='Adresse' validate={required()} />
          <TextInput name='phone' source='phone' label='Téléphone' validate={required()} />
        </SimpleForm>
      </Edit>
    </BPFormLayout>
  );
};

export default CustomerEdit;
