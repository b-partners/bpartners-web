/* eslint-disable react-hooks/exhaustive-deps */
import { Chip, DialogActions, DialogContent, Stack } from '@mui/material';
import { useState } from 'react';
import { useNotify } from 'react-admin';
import { BPButton } from 'src/common/components/BPButton';
import { useCalendarComparatorContext, useCalendarContext } from 'src/common/store/calendar';
import { printError } from 'src/common/utils';
import { calendarEventProvider } from 'src/providers';
import { CalendarComparaisonChoice, TComparaisonValue, TSetComparedValue } from '.';
import { TRaCalendarEvent } from 'src/providers/mappers';
import { TNotSyncCalendarEvent } from 'src/providers/utils';

const modifiedDefaultValue: Record<keyof TRaCalendarEvent, TComparaisonValue> = {
  end: 'Local',
  start: 'Local',
  organizer: 'Local',
  title: 'Local',
  location: 'Local',
  participants: 'Local',
  isSynchronized: 'Local',
  id: 'Local',
};

const modifiedToCalendarEvent = (modified: Record<keyof TRaCalendarEvent, TComparaisonValue>, calendarEvent: TNotSyncCalendarEvent) => {
  const res: any = {};
  Object.keys(modified).forEach(key => {
    res[key] = (modified as any)[key] === 'Local' ? (calendarEvent as any)[key] : (calendarEvent as any).google[key];
  });

  return res as TRaCalendarEvent;
};

export function CalendarComparaisonForm() {
  const { notSyncData, setNotSyncData } = useCalendarComparatorContext();
  const {
    currentCalendar: { id: calendarId },
  } = useCalendarContext();
  const [modified, setModified] = useState<Record<keyof TRaCalendarEvent, TComparaisonValue>>(modifiedDefaultValue);
  const [isLoading, setLoading] = useState(false);
  const notify = useNotify();

  const setValue: TSetComparedValue = (key, value) => setModified((e: any) => ({ ...e, [key]: value }));
  const handleSubmit = () => {
    const fetch = async () => {
      try {
        setLoading(true);
        await calendarEventProvider.saveOrUpdate([modifiedToCalendarEvent(modified, notSyncData[0])], { calendarId });
        setModified(modifiedDefaultValue);
        setNotSyncData(last => last.slice(1));
      } catch (err) {
        notify((err as Error).message, { type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    fetch().catch(printError);
  };

  return (
    <>
      <DialogContent>
        <Stack spacing={2} sx={{ minWidth: 800, minHeight: 400, padding: 2 }}>
          <CalendarComparaisonChoice currentValue={modified['title']} name='title' label='Titre' setValue={setValue} />
          <CalendarComparaisonChoice currentValue={modified['start']} name='start' label='Date de début' setValue={setValue} />
          <CalendarComparaisonChoice currentValue={modified['end']} name='end' label='Date de fin' setValue={setValue} />
          <CalendarComparaisonChoice currentValue={modified['location']} name='location' label='Adresse' setValue={setValue} />
          <CalendarComparaisonChoice
            currentValue={modified['participants']}
            name='participants'
            label='Participants'
            renderGoogle={(values: string[]) => (
              <Stack spacing={2} sx={{ maxHeight: 100, overflowY: 'auto' }} direction='row' flexWrap='wrap'>
                {(values || []).map(value => (
                  <Chip label={value} sx={{ marginBottom: 1 }} />
                ))}
              </Stack>
            )}
            renderLocal={(values: string[]) => (
              <Stack spacing={2} sx={{ maxHeight: 100, overflowY: 'auto' }} direction='row' flexWrap='wrap'>
                {(values || []).map(value => (
                  <Chip label={value} sx={{ marginBottom: 1 }} />
                ))}
              </Stack>
            )}
            setValue={setValue}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <BPButton
          onClick={handleSubmit}
          isLoading={isLoading}
          label={notSyncData.length > 1 ? 'bp.action.next' : 'bp.action.finish'}
          style={{ width: '200px' }}
        />
      </DialogActions>
    </>
  );
}
