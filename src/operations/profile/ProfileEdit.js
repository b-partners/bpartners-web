import { SimpleForm, TextInput, Edit } from 'react-admin';
import EditToolbar from '../utils/EditToolBar';

const ProfileEdit = props => (
  <Edit {...props}>
    <SimpleForm toolbar={<EditToolbar />}>
      <TextInput source='first_name' label='Prénoms' fullWidth={true} />
      <TextInput source='last_name' label='Noms' fullWidth={true} />
      <TextInput source='email' fullWidth={true} />
      <TextInput source='phone_number' label='Téléphone' fullWidth={true} />
      <StatusRadioButton />
    </SimpleForm>
  </Edit>
);

export default ProfileEdit;
