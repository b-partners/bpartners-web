import { CalendarAuth, CalendarConsentInit } from 'bpartners-react-client';

export const calendarRedirectionUrls: CalendarConsentInit = {
  redirectionStatusUrls: {
    failureUrl: `${window.location.origin}/calendar-sync/failed`,
    successUrl: `${window.location.origin}/calendar-sync`,
  },
};

export const getCalendarAuthRedirectionUrl = (code: string): CalendarAuth => ({
  code,
  redirectUrls: calendarRedirectionUrls.redirectionStatusUrls,
});
