/* eslint-disable react-hooks/exhaustive-deps */
import { Dialog, DialogActions, DialogContent, DialogTitle, Toolbar } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useNotify, useRefresh } from 'react-admin';
import { FormProvider, useForm } from 'react-hook-form';
import { BpFormField, BpMultipleTextInput } from 'src/common/components';
import { BPButton } from 'src/common/components/BPButton';
import { calendarResolver, participantValidator } from 'src/common/resolvers';
import { useCalendarContext } from 'src/common/store';
import { printError } from 'src/common/utils';
import { CalendarContextProvider, getCached } from 'src/providers';
import { TRaCalendarEvent, calendarEventMapper } from 'src/providers/mappers';

type CalendarEditDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
};

export const CalendarSaveDialog: FC<CalendarEditDialogProps> = ({ onClose: closeDialog, open, title }) => {
  const { currentEvent, currentCalendar } = useCalendarContext();
  const form = useForm({ mode: 'all', resolver: calendarResolver, defaultValues: currentEvent || {} });
  const [isLoading, setLoading] = useState(false);
  const notify = useNotify();
  const refresh = useRefresh();

  useEffect(() => {
    Object.keys(currentEvent).forEach((key: any) => form.setValue(key, (currentEvent as any)[key]));
    if (!currentEvent.organizer) {
      const accountHolder = getCached.accountHolder();
      form.setValue('organizer', accountHolder?.companyInfo?.email);
    }
  }, [currentEvent]);

  const handleSubmit = form.handleSubmit((data: TRaCalendarEvent) => {
    const restData = calendarEventMapper.toRest(data);
    const fetch = async () => {
      try {
        setLoading(true);
        await CalendarContextProvider.saveOrUpdate([restData], { calendarId: currentCalendar?.id });
        closeDialog();
        refresh();
      } catch (err) {
        notify('messages.global.error', { type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetch().catch(printError);
  });

  return (
    <Dialog onClose={closeDialog} open={open}>
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
            <BPButton onClick={closeDialog} label='ra.action.cancel' style={{ width: 130 }} />
            <BPButton data-testid='save-calendar-event' onClick={handleSubmit} isLoading={isLoading} label='ra.action.save' style={{ width: 130 }} />
          </Toolbar>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
};
