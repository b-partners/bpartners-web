import './index.css';
import 'typeface-quicksand';
import App from './App';
import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';
import { createRoot } from 'react-dom/client';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
  environment: process.env.REACT_APP_SENTRY_ENV,
});

// migration to react 18
// https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis

const appContainer = document.getElementById('root');
const root = createRoot(appContainer);
root.render(<App />);
