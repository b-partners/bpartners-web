import { Dialog, DialogActions, DialogContent, DialogTitle, Toolbar } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useNotify } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { BpFormField, BpMultipleTextInput } from 'src/common/components';
import { BPButton } from 'src/common/components/BPButton';
import { calendarResolver, participantValidator } from 'src/common/resolvers';
import { useCalendarEventContext } from 'src/common/store/invoice';
import { printError } from 'src/common/utils';
import { calendarEventProvider, getCached } from 'src/providers';
import { TRaCalendarEvent, calendarEventMapper } from 'src/providers/mappers';

type CalendarEditDialogProps = {
  calendarId: string;
  open: boolean;
  onClose: () => void;
  title: string;
};

export const CalendarSaveDialog: FC<CalendarEditDialogProps> = ({ calendarId, onClose, open, title }) => {
  const currentEvent = useCalendarEventContext();
  const form = useForm({ mode: 'all', resolver: calendarResolver, defaultValues: currentEvent || {} });
  const [isLoading, setLoading] = useState(false);
  const notify = useNotify();

  useEffect(() => {
    Object.keys(currentEvent).forEach((key: any) => form.setValue(key, (currentEvent as any)[key]));
    if (!currentEvent.organizer) {
      const {
        companyInfo: { email },
      } = getCached.accountHolder();
      form.setValue('organizer', email);
    }
  }, [currentEvent]);

  const handleSubmit = form.handleSubmit((data: TRaCalendarEvent) => {
    const restData = calendarEventMapper.toRest(data);
    const fetch = async () => {
      try {
        setLoading(true);
        await calendarEventProvider.saveOrUpdate([restData], { calendarId });
      } catch (err) {
        notify('messages.global.error');
      } finally {
        setLoading(false);
      }
    };
    fetch().catch(printError);
  });

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>{title}</DialogTitle>
      <FormProvider {...form}>
        <DialogContent sx={{ width: 500 }}>
          <BpFormField style={{ width: 500 }} label='Titre' name='title' />
          <BpFormField style={{ width: 500 }} type='datetime-local' label='Date de début' name='start' />
          <BpFormField style={{ width: 500 }} type='datetime-local' label='Date de fin' name='end' />
          <BpFormField style={{ width: 500 }} label='Adresse' multiline name='location' />
          <BpMultipleTextInput
            validator={participantValidator}
            title='Liste des participants'
            label='resources.calendar.values.participant'
            name='participants'
          />
        </DialogContent>
        <DialogActions>
          <Toolbar sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <BPButton onClick={onClose} label='ra.action.cancel' style={{ width: 100 }} />
            <BPButton onClick={handleSubmit} isLoading={isLoading} label='ra.action.save' style={{ width: 100 }} />
          </Toolbar>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};
