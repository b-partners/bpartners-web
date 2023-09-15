import { DateTimeInput, Edit, SaveButton, SimpleForm, TextInput, Toolbar } from 'react-admin';
import {} from 'react-router-dom';
import { BPButton } from 'src/common/components/BPButton';

export const CalendarEdit = () => {
  return (
    <Edit mutationMode='pessimistic' redirect='/calendar'>
      <SimpleForm
        toolbar={
          <Toolbar sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <BPButton href='/calendar' label='ra.action.cancel' style={{ width: 100 }} />
            <SaveButton />
          </Toolbar>
        }
        sx={{ '& .MuiFormControl-root': { minWidth: '300px' } }}
      >
        <TextInput source='title' label='Titre' />
        <DateTimeInput source='start' label='Date de début' />
        <DateTimeInput source='end' label='Date de fin' />
        <TextInput source='organizer' label='Organisateur' />
        <TextInput source='participants' label='Participants' />
        <TextInput source='location' label='Adresse' />
      </SimpleForm>
    </Edit>
  );
};
