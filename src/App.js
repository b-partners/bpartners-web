import { Admin } from '@react-admin/ra-enterprise'
import { CustomRoutes, ThemeProvider } from 'react-admin'
import { Resource } from '@react-admin/ra-rbac'

import { Route } from 'react-router-dom'
import authProvider from './providers/auth-provider.ts';
// import dataProvider from './providers/data-provider';
import polyglotI18nProvider from 'ra-i18n-polyglot'
import frenchMessages from 'ra-language-french'

import { mockDataProvider } from './providers/mock-provider'
import profile from './operations/profile'
import transaction from './operations/transactions'

import MyLayout from './HaLayout'
import HaLoginPage from './security/LoginPage'
import { mainTheme } from './haTheme';

const App = () => (
  <ThemeProvider>
    <Admin
      title='BPartners Dashboard'
      authProvider={authProvider}
      dataProvider={/* process.env.REACT_APP_ENV === 'mock' ? mockDataProvider : dataProvider */ mockDataProvider}
      i18nProvider={polyglotI18nProvider(() => frenchMessages, 'fr')}
      loginPage={HaLoginPage}
      layout={MyLayout}
      disableTelemetry
    >
      <Resource name='profile' />
      <Resource name='transactions' {...transaction} />

      <CustomRoutes>
        <Route exact path='/profile' element={<profile.show />} />
        <Route exact path='/transactions' element={<transaction.list />} />
        <Route exact path='/transactions/:id/show' element={<transaction.show />} />
      </CustomRoutes>
    </Admin>
  </ThemeProvider>
)

export default App
