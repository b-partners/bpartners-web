import { useEffect } from 'react';
import { Navigate, Route } from 'react-router-dom';
import { Admin } from '@react-admin/ra-enterprise';
import { Resource } from '@react-admin/ra-rbac';
import polyglotI18nProvider from 'ra-i18n-polyglot';
import frenchMessages from 'ra-language-french';
import { CustomRoutes } from 'react-admin';
import MyLayout from 'src/common/components/BPLayout';
import account from 'src/operations/account';
import { Configuration } from 'src/operations/configurations';
import { customers } from 'src/operations/customers';
import invoice from 'src/operations/invoice';
import { marketplaces } from 'src/operations/marketplaces';
import products from 'src/operations/products';
import transactions from 'src/operations/transactions';
import { prospects } from 'src/operations/prospects';
import { BpFrenchMessages } from 'src/common/utils';
import { BankPage } from 'src/operations/bank';
import { PartnersPage } from 'src/operations/partners/PartnersPage';
import { authProvider, dataProvider } from 'src/providers';
import { calendar } from 'src/operations/calendar';
import { CalendarSync } from 'src/operations/calendar/components';
import { Auth } from 'aws-amplify';
import { BP_THEME } from 'src/bp-theme';
import BPErrorPage from 'src/common/components/BPErrorPage';
import GoogleSheetsConsentSuccess from './googleSheetConsent/GoogleSheetsConsentSuccess';

export const BpAdmin = () => {
  const getTokenExpiration = async () => {
    try {
      const session = await Auth.currentSession();
      const expirationTime = new Date(session.getIdToken().payload.exp * 1000);
      return expirationTime;
    } catch (error) {
      console.error("Erreur lors de la récupération de la date d'expiration du token :", error);
      return null;
    }
  };

  useEffect(() => {
    const checkTokenExpiration = async () => {
      const tokenExpiration = await getTokenExpiration();
      if (tokenExpiration) {
        const currentTime = new Date();
        if (currentTime >= tokenExpiration) {
          // La session a expiré, déconnectez l'utilisateur
          await Auth.signOut();
        }
      }
    };
    checkTokenExpiration();
  }, []);

  return !authProvider.getCachedWhoami() ? (
    <Navigate to='/login' />
  ) : (
    <Admin
      title='BPartners'
      authProvider={authProvider}
      dataProvider={dataProvider}
      i18nProvider={polyglotI18nProvider(() => ({ ...frenchMessages, ...BpFrenchMessages }), 'fr')}
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
      <Resource name='accountHolder' />
      <Resource name='calendar' {...calendar} />

      <CustomRoutes>
        <Route exact path='/sheets/consent/success' element={<GoogleSheetsConsentSuccess />} />
        <Route path='/calendar-sync' element={<CalendarSync />} />
        <Route exact path='/account' element={<account.show />} />
        <Route exact path='/configurations' element={<Configuration />} />
        <Route exact path='/bank' element={<BankPage />} />
        <Route exact path='/partners' element={<PartnersPage />} />
        <Route exact path='/error' element={<BPErrorPage />} />
      </CustomRoutes>
    </Admin>
  );
};
