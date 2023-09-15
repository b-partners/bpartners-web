import { DateTimeInput, Edit, SaveButton, SimpleForm, TextInput } from 'react-admin';
import { BPButton } from 'src/common/components/BPButton';
import { Dialog, DialogActions, DialogContent, DialogTitle, Toolbar } from '@mui/material';
import { FC } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { BpFormField } from 'src/common/components';

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

type CalendarEditDialogProps = {
  calendarId: string;
  open: boolean;
  onClose: () => void;
};

export const CalendarEditDialog: FC<CalendarEditDialogProps> = ({ calendarId, onClose, open }) => {
  const form = useForm({ mode: 'all' });

  return (
    <FormProvider {...form}>
      <form>
        <Dialog open={open}>
          <DialogTitle>Edition</DialogTitle>
          <DialogContent>
            <BpFormField label='Titre' name='title' />
            <BpFormField label='Adresse' name='location' />
            <BpFormField type='date' label='Date de début' name='start' />
          </DialogContent>
          <DialogActions>
            <Toolbar sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <BPButton label='ra.action.cancel' style={{ width: 100 }} />
              <BPButton label='ra.action.save' style={{ width: 100 }} />
            </Toolbar>
          </DialogActions>
        </Dialog>
      </form>
    </FormProvider>
  );
};
