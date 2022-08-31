import { SimpleShowLayout, Show, TextField } from 'react-admin';
import authProvider from '../../providers/auth-provider';

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
  const userId = authProvider.getCachedWhoami().id;

  return (
    <Show id={userId} resource='profile' basePath='/profile' title='Mon profil'>
      <ProfileLayout />
    </Show>
  );
};

export default ProfileShow;
