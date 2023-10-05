/* eslint-disable react-hooks/exhaustive-deps */
import { equals } from '@gthrm/deep-diff';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import { ReactNode, useCallback } from 'react';
import { BP_COLOR } from 'src/bp-theme';
import { useCalendarComparatorContext } from 'src/common/store/calendar';
import { TRaCalendarEvent } from 'src/providers/mappers';
import { TNotSyncCalendarEvent } from 'src/providers/utils';

export type TComparaisonValue = 'Local' | 'Google' | 'Unknown';
export type TSetComparedValue = (key: keyof TNotSyncCalendarEvent, value: TComparaisonValue) => void;
export type ChoiceProps<T> = {
  label: string;
  name: keyof TRaCalendarEvent;
  renderLocal?: (local: T) => ReactNode;
  renderGoogle?: (google: T) => ReactNode;
  setValue: TSetComparedValue;
  currentValue: TComparaisonValue;
};

export function CalendarComparaisonChoice<T>({ label, renderGoogle, renderLocal, name, setValue, currentValue }: ChoiceProps<T>) {
  const { notSyncData } = useCalendarComparatorContext();
  const local: any = (notSyncData[0] || {})[name];
  const google: any = ((notSyncData[0] || {})['google'] || {})[name];

  const isComparable = !equals(local, google);

  const handleChange = (newValue: typeof currentValue) => () => {
    setValue(name, newValue);
  };

  const getShadow = useCallback(
    (current: typeof currentValue, value: typeof currentValue) =>
      isComparable
        ? current === value
          ? { outline: '1px solid rgba(0,255,0, 0.6)', background: 'rgba(0,255,0, 0.3)' }
          : {}
        : { background: BP_COLOR['solid_grey'], cursor: 'initial' },
    []
  );

  return (
    <Stack spacing={2} direction='row' sx={{ cursor: 'pointer', padding: 1 }}>
      <Card sx={{ ...getShadow(currentValue, 'Local'), flexBasis: '48%', minHeight: '40px', flexGrow: 2 }} onClick={handleChange('Local')}>
        <CardContent>
          <Stack direction='row' justifyContent='space-between' sx={{ marginBottom: 1 }}>
            <Typography sx={{ fontSize: 14 }} color='text.secondary'>
              {label}
            </Typography>
            <Typography sx={{ fontSize: 14 }} color='text.secondary'>
              Local
            </Typography>
          </Stack>
          {renderLocal && renderLocal(local)}
          {!renderLocal && <Typography>{local}</Typography>}
        </CardContent>
      </Card>
      <Card sx={{ ...getShadow(currentValue, 'Google'), flexBasis: '48%', minHeight: '40px', flexGrow: 2 }} onClick={handleChange('Google')}>
        <CardContent>
          <Stack direction='row' justifyContent='space-between' sx={{ marginBottom: 1 }}>
            <Typography sx={{ fontSize: 14 }} color='text.secondary'>
              {label}
            </Typography>
            <Typography sx={{ fontSize: 14 }} color='text.secondary'>
              Google
            </Typography>
          </Stack>
          {renderGoogle && renderGoogle(google)}
          {!renderGoogle && <Typography>{google}</Typography>}
        </CardContent>
      </Card>
    </Stack>
  );
}
