import { SimpleForm, TextInput, RadioButtonGroupInput, Edit } from 'react-admin'
import EditToolbar from '../utils/EditToolBar'

const StatusRadioButton = () => (
  <RadioButtonGroupInput
    source='status'
    label='Statut'
    choices={[
      { id: 'ENABLED', name: 'Actif·ve' },
      { id: 'DISABLED', name: 'Inactif·ve' }
    ]}
  />
)

const ProfileEdit = props => (
  <Edit {...props}>
    <SimpleForm toolbar={<EditToolbar />}>
      <TextInput source='first_name' label='Prénom·s' fullWidth={true} />
      <TextInput source='last_name' label='Nom·s' fullWidth={true} />
      <TextInput source='email' fullWidth={true} />
    </SimpleForm>
  </Edit>
)

export default ProfileEdit
