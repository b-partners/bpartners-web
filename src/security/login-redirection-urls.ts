import { RedirectionStatusUrls } from '@bpartners/typescript-client';

export const loginSuccessRelUrl = '/login/success';
export const failureSuccessRelUrl = '/login/failure';

const loginRedirectionUrls: RedirectionStatusUrls = {
  successUrl: window.location.origin + loginSuccessRelUrl,
  failureUrl: window.location.origin + failureSuccessRelUrl,
};

export default loginRedirectionUrls;
