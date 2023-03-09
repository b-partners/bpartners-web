import { Admin } from '@react-admin/ra-enterprise';
import { Resource } from '@react-admin/ra-rbac';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import frenchMessages from 'ra-language-french';
import { CustomRoutes } from 'react-admin';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import BPErrorPage from './common/components/BPErrorPage';

import MyLayout from './common/components/BPLayout';
import { BP_THEME } from './bp-theme';

import account from './operations/account';
import { Configuration } from './operations/configurations';
import { customers } from './operations/customers';
import invoice from './operations/invoice';
import { marketplaces } from './operations/marketplaces';
import products from './operations/products';
import transactions from './operations/transactions';
import { prospects } from './operations/prospects';

import authProvider from './providers/auth-provider';
import dataProvider from './providers/data-provider';
import { loginSuccessRelUrl } from './security/login-redirection-urls';

import LoginPage from './security/LoginPage';
import LoginSuccessPage from './security/LoginSuccessPage';
import MobileLoginSuccessPage from './security/MobileLoginSuccessPage';

export const BpAdmin = () => {
  return !authProvider.getCachedWhoami() ? (
    <Navigate to='/login' />
  ) : (
    <Admin
      title='BPartners'
      authProvider={authProvider}
      dataProvider={dataProvider}
      i18nProvider={polyglotI18nProvider(() => frenchMessages, 'fr')}
      loginPage={false}
      theme={BP_THEME}
      layout={MyLayout}
    >
      <Resource name='transactions' {...transactions} />
      <Resource name='customers' {...customers} />
      <Resource name='products' {...products} />
      <Resource name='invoices' {...invoice} />
      <Resource name='marketplaces' {...marketplaces} />
      <Resource name='prospects' {...prospects} />
      <Resource name='account' />

      <CustomRoutes>
        <Route exact path='/account' element={<account.show />} />
        <Route exact path='/configurations' element={<Configuration />} />
        <Route exact path='/error' element={<BPErrorPage />} />
      </CustomRoutes>
    </Admin>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path={loginSuccessRelUrl} element={<LoginSuccessPage />} />
        <Route exact path='/login' element={<LoginPage />} />
        <Route exact path='/login/mobile/success' element={<MobileLoginSuccessPage />} />
        <Route exact path='*' element={<BpAdmin />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
