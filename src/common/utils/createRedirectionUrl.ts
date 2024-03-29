import { RedirectionStatusUrls } from '@bpartners/typescript-client';

export const createRedirectionUrl = (successUrl: string, failureUrl: string): RedirectionStatusUrls => ({
  successUrl: window.location.origin + successUrl,
  failureUrl: window.location.origin + failureUrl,
});
