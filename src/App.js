import { Admin } from '@react-admin/ra-enterprise';
import { CustomRoutes } from 'react-admin';
import { Resource } from '@react-admin/ra-rbac';

import { Route } from 'react-router-dom';
import authProvider from './providers/auth-provider.ts';
import dataProvider from './providers/data-provider';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import frenchMessages from 'ra-language-french';

import profile from './operations/profile';
import transactions from './operations/transactions';

import MyLayout from './BpLayout';

import LoginPage from './security/LoginPage';
import { loginSuccessRelUrl } from './security/login-redirection-urls';
import LoginSuccessPage from './security/LoginSuccessPage';

const App = () => (
  <Admin
    title='BPartners Dashboard'
    authProvider={authProvider}
    dataProvider={dataProvider}
    i18nProvider={polyglotI18nProvider(() => frenchMessages, 'fr')}
    loginPage={LoginPage}
    layout={MyLayout}
  >
    <Resource name='profile' />
    <Resource name='transactions' />

    <CustomRoutes>
      <Route exact path={loginSuccessRelUrl} element={<LoginSuccessPage />} />
      <Route exact path='/profile' element={<profile.show />} />
      <Route exact path='/transactions' element={<transactions.list />} />
    </CustomRoutes>
  </Admin>
);

export default App;
