import specTitle from 'cypress-sonarqube-reporter/specTitle';

import authProvider from '../auth-provider';
import { whoami1, token1, user1 } from '../../__tests__/mocks/responses/security-api';

describe(specTitle('AuthProvider'), () => {
  beforeEach(() => {
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');
  });

  // if a data provider return an error status other than 401 and 403
  it("Shouldn't logout", async () => {
    await authProvider.login('dummy', 'dummy', {
      redirectionStatusUrls: {
        successurl: 'dummy',
        FailureUrl: 'dummy',
      },
    });

    authProvider.checkError({ status: 500 }).catch(err => {
      assert.equal(err.redirectTo, '/error');
      assert.equal(err.message, false);
      assert.equal(err.logoutUser, false);
    });

    const whoamiFromAuthProvider = authProvider.getCachedWhoami();
    const userIdFromAuthProvider = await authProvider.getIdentity();

    assert.equal(userIdFromAuthProvider, whoami1.user.id);
    assert.equal(whoamiFromAuthProvider.user.firstName, whoami1.user.firstName);
    assert.equal(whoamiFromAuthProvider.user.phone, whoami1.user.phone);
  });

  // if the token expire
  it('Should return nothing', async () => {
    authProvider.checkError({ status: 401 }).catch(err => {
      assert.isUndefined(err);
    });
    authProvider.checkAuth().catch(err => {
      assert.isUndefined(err);
    });
  });
});
