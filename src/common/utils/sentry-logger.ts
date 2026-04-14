import { getCached } from '@/providers';
import * as Sentry from '@sentry/react';

export const sentryErrorLogger = (message: string, data: any) => {
  const {
    user: { firstName, lastName, id },
  } = getCached.whoami() || { user: {} };

  const {
    companyInfo: { email },
  } = getCached.accountHolder() || { companyInfo: {} };

  Sentry.logger.error(`${email} : ${message}`, { data, user: { id, firstName, lastName } });
};
