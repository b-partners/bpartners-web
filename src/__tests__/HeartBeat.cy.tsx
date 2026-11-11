import { useHeartBeat } from '@/common/hooks';
import { Redirect } from '@/common/utils';
import { authProvider } from '@/providers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { whoami1 } from './mocks/responses/security-api';

const HeartBeatProbe = () => {
  useHeartBeat();
  return <span data-cy='heart-beat-probe'>probe</span>;
};

const mountProbe = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  cy.mount(
    <QueryClientProvider client={queryClient}>
      <HeartBeatProbe />
    </QueryClientProvider>
  );
  cy.getByDataCy('heart-beat-probe').should('be.visible');
};

const answerWhoamiWith = (statusCode: number, body: any = {}) => cy.intercept('GET', '**/whoami', { statusCode, body }).as('heartBeatWhoami');

describe('whoami heart beat', () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.stub(authProvider, 'logout').returns(Promise.resolve());
    cy.stub(Redirect, 'toURL').as('redirect');
  });

  it('logs the user out and sends them to the login page once whoami answers 401', () => {
    answerWhoamiWith(401);
    mountProbe();
    cy.wait('@heartBeatWhoami');
    cy.get('@redirect').should('have.been.calledOnceWith', '/login');
    cy.then(() => expect(authProvider.logout).to.have.been.called);
  });

  it('logs the user out once whoami answers 403', () => {
    answerWhoamiWith(403);
    mountProbe();
    cy.wait('@heartBeatWhoami');
    cy.get('@redirect').should('have.been.calledOnceWith', '/login');
  });

  it('keeps the session while whoami still answers', () => {
    answerWhoamiWith(200, whoami1);
    mountProbe();
    cy.wait('@heartBeatWhoami');
    cy.get('@redirect').should('not.have.been.called');
    cy.then(() => expect(authProvider.logout).not.to.have.been.called);
  });

  it('does not log the user out when the API itself fails', () => {
    answerWhoamiWith(500);
    mountProbe();
    cy.wait('@heartBeatWhoami');
    cy.get('@redirect').should('not.have.been.called');
  });
});
