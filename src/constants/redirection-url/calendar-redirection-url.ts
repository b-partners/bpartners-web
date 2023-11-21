import { CalendarAuth } from 'bpartners-react-client';

export const calendarRedirectionUrls = (calendarId: string) => {
  return {
    redirectionStatusUrls: {
      failureUrl: `${window.location.origin}/calendar-sync/failed`,
      successUrl: `${window.location.origin}/calendar-sync?calendarId=${calendarId}`,
    },
  };
};

export const getCalendarAuthRedirectionUrl = (code: string, calendarId: string): CalendarAuth => ({
  code,
  redirectUrls: calendarRedirectionUrls(calendarId).redirectionStatusUrls,
});
