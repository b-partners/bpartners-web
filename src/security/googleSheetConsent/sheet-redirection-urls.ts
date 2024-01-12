import { RedirectionStatusUrls } from '@bpartners/typescript-client';

export const SuccesslUrl = '/sheets/consent/success';
export const failurelUrl = '/sheets/consent/failure';

const sheetRedirectionUrls: RedirectionStatusUrls = {
  successUrl: window.location.origin + SuccesslUrl,
  failureUrl: window.location.origin + failurelUrl,
};

export default sheetRedirectionUrls;
