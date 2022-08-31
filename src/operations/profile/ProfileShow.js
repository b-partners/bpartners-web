import { SimpleShowLayout, Show, TextField } from 'react-admin';

export const ProfileLayout = () => {
  return (
    <SimpleShowLayout>
      <TextField source='firstName' id='firstName' label='Prénom(s)' />
      <TextField source='lastName' id='lastName' label='Nom(s)' />
      <TextField source='mobilePhoneNumber' id='mobilePhoneNumber' label='Téléphone' />
    </SimpleShowLayout>
  );
};

const ProfileShow = ({ id }) => {
  const userId = localStorage.getItem('userId') || '';
  return (
    <Show id={userId} resource='profile' basePath='/profile' title='Mon profil'>
      <ProfileLayout />
    </Show>
  );
};

export default ProfileShow;
