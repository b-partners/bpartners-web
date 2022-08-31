import { Admin } from '@react-admin/ra-enterprise';
import { CustomRoutes } from 'react-admin';
import { Resource } from '@react-admin/ra-rbac';

import { Route } from 'react-router-dom';
import authProvider from './providers/auth-provider.ts';
import dataProvider from './providers/data-provider';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import frenchMessages from 'ra-language-french';

import { mockDataProvider } from './providers/mock-provider';
import profile from './operations/profile';
import transaction from './operations/transactions';

import MyLayout from './HaLayout';
import HaLoginPage from './security/LoginPage';

const App = () => (
  <Admin
    title='BPartners Dashboard'
    authProvider={authProvider}
    dataProvider={process.env.REACT_APP_ENV === 'mock' ? mockDataProvider : dataProvider}
    i18nProvider={polyglotI18nProvider(() => frenchMessages, 'fr')}
    loginPage={HaLoginPage}
    layout={MyLayout}
  >
    <Resource name='profile' />
    <Resource name='transactions' list={transaction.list} show={transaction.show} icon={transaction.icon} />

    <CustomRoutes>
      <Route exact path='/profile' element={<profile.show />} />
      <Route exact path='/transactions' element={<transaction.list />} />
    </CustomRoutes>
  </Admin>
);

export default App;
