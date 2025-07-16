import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { CookiesProvider } from 'react-cookie';

import { loginSuccessRelUrl } from './security/login-redirection-urls';

import RedirectionMobilePage from './operations/redirectionMobile/RedirectionMobilePage';
import { Account } from './pages/profils/sections/Account';
import { BpAdmin } from './security/BpAdmin';
import BpLoginPageLayout from './security/LoginPageLayout';
import LoginSuccessPage from './security/LoginSuccessPage';
import MobileLoginSuccessPage from './security/MobileLoginSuccessPage';
import { PasswordResetPassword } from './security/PasswordReset/components';
import PasswordResetConfirmationLayout from './security/PasswordReset/components/PasswordResetConfirmationLayout';
import PasswordResetPage from './security/PasswordReset/PasswordResetPage';
import { PasswordChangeableLogin } from './security/SignInForm';
import { SignUpForm } from './security/SignUpForm';
import { UserSubscriptionCheckWrapper } from './security/UserSubscriptionCheckWrapper';

const App = () => {
  return (
    <CookiesProvider>
      <BrowserRouter>
        <Routes>
          <Route path={loginSuccessRelUrl} element={<LoginSuccessPage />} />
          <Route
            path='/login'
            element={
              <BpLoginPageLayout>
                <PasswordChangeableLogin />
              </BpLoginPageLayout>
            }
          />
          <Route
            path='/sign-up'
            element={
              <BpLoginPageLayout>
                <SignUpForm />
              </BpLoginPageLayout>
            }
          />
          <Route path='/login/mobile/success' element={<MobileLoginSuccessPage />} />
          <Route path='/password/reset' element={<PasswordResetPage />} />
          <Route path='/password/reset/code' element={<PasswordResetConfirmationLayout />} />
          <Route path='/password/reset/success' element={<PasswordResetPassword />} />
          <Route path='/redirection' element={<RedirectionMobilePage />} />
          <Route path='/newprofil' element={<Account />} />
          <Route
            path='*'
            element={
              <UserSubscriptionCheckWrapper>
                <BpAdmin />
              </UserSubscriptionCheckWrapper>
            }
          />
        </Routes>
      </BrowserRouter>
    </CookiesProvider>
  );
};

export default App;
