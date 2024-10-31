import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { CookiesProvider } from 'react-cookie';

import { loginSuccessRelUrl } from './security/login-redirection-urls';

import RedirectionMobilePage from './operations/redirectionMobile/RedirectionMobilePage';
import { BpAdmin } from './security/BpAdmin';
import BpLoginPageLayout from './security/LoginPageLayout';
import LoginSuccessPage from './security/LoginSuccessPage';
import MobileLoginSuccessPage from './security/MobileLoginSuccessPage';
import PasswordResetPage from './security/PasswordReset/PasswordResetPage';
import { PasswordChangeableLogin } from './security/SignInForm';
import { SignUpForm } from './security/SignUpForm';

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
          <Route path='/redirection' element={<RedirectionMobilePage />} />
          <Route path='*' element={<BpAdmin />} />
        </Routes>
      </BrowserRouter>
    </CookiesProvider>
  );
};

export default App;
