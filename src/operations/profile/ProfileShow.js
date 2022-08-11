import { EmailField, SimpleShowLayout, Show, TextField } from 'react-admin'

import { unexpectedValue } from '../utils/typography'

export const ProfileLayout = () => {
  
  return (
    <SimpleShowLayout>
      <TextField source='first_name' id='first_name' label='Prénom(s)' />
      <TextField source='last_name' label='Nom(s)' />
      <EmailField source='email' label='Email' />
    </SimpleShowLayout>
  )
}

const ProfileShow = () => {
  return (
    <Show id={null} resource='profile' basePath='/profile' title='Mon profil'>
      <ProfileLayout />
    </Show>
  )
}

export default ProfileShow
