import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { captchaApi } from './api';

export const recaptchaProvider = {
  async verifyRecaptchaToken(token: string) {
    const result = await captchaApi().verifyCaptchaToken(token);
    return result.data;
  },
  useGoogleReCaptcha,
};
