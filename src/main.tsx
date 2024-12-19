import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import * as Sentry from '@sentry/browser';
import './index.css';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 1.0,
  environment: process.env.REACT_APP_SENTRY_ENV,
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
