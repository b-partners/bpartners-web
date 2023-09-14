import { CalendarAuth, CalendarConsentInit } from 'bpartners-react-client';

export const calendarRedirectionUrls: CalendarConsentInit = {
  redirectionStatusUrls: {
    failureUrl: `${process.env.REACT_APP_URL}/calendar-sync/failed`,
    successUrl: `${process.env.REACT_APP_URL}/calendar-sync`,
  },
};

export const getCalendarAuthRedirectionUrl = (code: string): CalendarAuth => ({
  code,
  redirectUrls: calendarRedirectionUrls.redirectionStatusUrls,
});
