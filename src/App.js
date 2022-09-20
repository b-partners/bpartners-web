import { Admin } from '@react-admin/ra-enterprise';
import { CustomRoutes } from 'react-admin';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Resource } from '@react-admin/ra-rbac';

import authProvider from './providers/auth-provider.ts';
import dataProvider from './providers/data-provider';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import frenchMessages from 'ra-language-french';

import account from './operations/account';
import transactions from './operations/transactions';
import { customers } from './operations/customers';

import MyLayout from './BpLayout';

import LoginPage from './security/LoginPage';
import { loginSuccessRelUrl } from './security/login-redirection-urls';
import LoginSuccessPage from './security/LoginSuccessPage';

export const BpAdmin = () => (
  <Admin
    title='BPartners'
    authProvider={authProvider}
    dataProvider={dataProvider}
    i18nProvider={polyglotI18nProvider(() => frenchMessages, 'fr')}
    loginPage={LoginPage}
    layout={MyLayout}
  >
    <Resource name='transactions' {...transactions} />
    <Resource name='customers' {...customers} />
    <Resource name='account' />

    <CustomRoutes>
      <Route exact path='/account' element={<account.show />} />
    </CustomRoutes>
  </Admin>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route exact path={loginSuccessRelUrl} element={<LoginSuccessPage />} />
      <Route path='*' element={<BpAdmin />} />
    </Routes>
  </BrowserRouter>
);

export default App;
