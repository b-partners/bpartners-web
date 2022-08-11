import { Admin } from '@react-admin/ra-enterprise'
import { CustomRoutes } from 'react-admin'
import { Resource } from '@react-admin/ra-rbac'

import { Route } from 'react-router-dom'

import dataProvider from './providers/dataProvider'
import authProvider from './providers/authProvider.ts'

import polyglotI18nProvider from 'ra-i18n-polyglot'
import frenchMessages from 'ra-language-french'

import profile from './operations/profile'

import MyLayout from './HaLayout'
import HaLoginPage from './security/LoginPage'

const App = () => (
  <Admin
    title='HEI Admin'
    authProvider={authProvider}
    dataProvider={dataProvider}
    i18nProvider={polyglotI18nProvider(() => frenchMessages, 'fr')}
    loginPage={HaLoginPage}
    layout={MyLayout}
  >
    <Resource name='profile' />
    <CustomRoutes>
      <Route exact path='/profile' element={<profile.show />} />
    </CustomRoutes>
  </Admin>
)

export default App
