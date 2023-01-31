import { Edit, email, required, SimpleForm, TextInput, DeleteButton, Toolbar, SaveButton } from 'react-admin';
import { Close as CloseIcon } from '@mui/icons-material';

const CustomerEdit = () => {
  return (
    <Edit mutationMode='pessimistic'>
      <SimpleForm title='Édition de client' toolbar={<CustomToolbar />}>
        <TextInput name='name' source='name' label='Nom' validate={required()} />
        <TextInput name='email' source='email' label='Email' validate={[email('Doit être un email valide'), required()]} />
        <TextInput name='address' source='address' label='Adresse' validate={required()} />
        <TextInput name='phone' source='phone' label='Téléphone' validate={required()} />
      </SimpleForm>
    </Edit>
  );
};

const CustomToolbar = () => {
  return (
    <Toolbar>
      <SaveButton label='Enregister' />
      <DeleteButton label='Annuler' icon={<CloseIcon />} />
    </Toolbar>
  );
};

export default CustomerEdit;
