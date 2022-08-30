import { EmailField, SimpleShowLayout, Show, TextField } from 'react-admin';

export const ProfileLayout = () => {
  return (
    <SimpleShowLayout>
      <TextField source='first_name' id='first_name' label='Prénom(s)' />
      <TextField source='last_name' id='first_name' label='Nom(s)' />
      <EmailField source='email' label='Email' />
      <TextField source='mobilePhoneNumber' id='mobilePhoneNumber' label='Téléphone' />
    </SimpleShowLayout>
  );
};

const ProfileShow = ({ id }) => {

  const userId = localStorage.getItem("userId") || '';
  
  return (
    <Show id={userId} resource='profile' basePath='/profile' title='Mon profil'>
      <ProfileLayout />
    </Show>
  );
};

export default ProfileShow;
