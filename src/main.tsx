import * as Sentry from '@sentry/browser';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import App from './App';
import './index.css';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  environment: process.env.REACT_APP_SENTRY_ENV,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GoogleReCaptchaProvider reCaptchaKey={process.env.RECAPTCHA_SITE_KEY}>
      <App />
    </GoogleReCaptchaProvider>
  </React.StrictMode>
);
