import { RedirectionStatusUrls } from 'src/gen/bpClient';

export const loginSuccessRelUrl = '/login/success';
export const failureSuccessRelUrl = '/login/success';

const loginRedirectionUrls: RedirectionStatusUrls = {
  successUrl: window.location.hostname + loginSuccessRelUrl,
  failureUrl: window.location.hostname + failureSuccessRelUrl,
};

export default loginRedirectionUrls;
