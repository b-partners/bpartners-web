import { FunctionField, SimpleShowLayout, TextField } from 'react-admin';
import { FeedbackLink } from './FeedbackLink';

export const ProfileShowLayout = () => {
  const emptyText = 'VIDE';

  return (
    <SimpleShowLayout>
      <TextField source='user.firstName' emptyText={emptyText} id='firstName' label='Prénom' />
      <TextField source='user.lastName' emptyText={emptyText} id='lastName' label='Nom' />
      <TextField source='user.phone' emptyText={emptyText} id='phone' label='Téléphone' />
      <FunctionField label='Lien du feedback' render={data => <FeedbackLink link={data?.feedback?.feedbackLink} />} />
    </SimpleShowLayout>
  );
};
