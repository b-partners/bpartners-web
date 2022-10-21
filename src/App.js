import { Admin } from '@react-admin/ra-enterprise';
import { Resource } from '@react-admin/ra-rbac';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import frenchMessages from 'ra-language-french';
import { CustomRoutes } from 'react-admin';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import MyLayout from './BpLayout';
import { bpTheme } from './bpTheme';

import account from './operations/account';
import { Configuration } from './operations/configurations';
import { customers } from './operations/customers';
import invoice from './operations/invoice';
import { marketplaces } from './operations/marketplaces';
import products from './operations/products';
import transactions from './operations/transactions';

import authProvider from './providers/auth-provider.ts';
import dataProvider from './providers/data-provider';
import { loginSuccessRelUrl } from './security/login-redirection-urls';

import LoginPage from './security/LoginPage';
import LoginSuccessPage from './security/LoginSuccessPage';

export const BpAdmin = () => (
  <Admin
    title='BPartners'
    authProvider={authProvider}
    dataProvider={dataProvider}
    i18nProvider={polyglotI18nProvider(() => frenchMessages, 'fr')}
    loginPage={LoginPage}
    theme={bpTheme}
    layout={MyLayout}
  >
    <Resource name='transactions' {...transactions} />
    <Resource name='customers' {...customers} />
    <Resource name='products' {...products} />
    <Resource name='invoices' {...invoice} />
    <Resource name='marketplaces' {...marketplaces} />
    <Resource name='account' />

    <CustomRoutes>
      <Route exact path='/account' element={<account.show />} />
      <Route exact path='/products' element={<products.list />} />
      <Route exact path='/configurations' element={<Configuration />} />
      <Route exact path='/invoice' element={<invoice.list />} />
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
