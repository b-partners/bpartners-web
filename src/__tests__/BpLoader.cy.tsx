import { BPLoader } from '@/common/components';

const LOADING_MESSAGE = 'Loading...';

describe('BPLoader Component', () => {
  it('should render the loader without message', () => {
    cy.mount(<BPLoader />);

    cy.get("[data-testid='bp-loader-wrapper']")
      .should('have.css', 'display', 'flex')
      .and('have.css', 'align-items', 'center')
      .and('have.css', 'justify-content', 'center')
      .and('have.css', 'flex-direction', 'column');
  });

  it('should render the loader with a message', () => {
    cy.mount(<BPLoader message={LOADING_MESSAGE} />);
    cy.contains(LOADING_MESSAGE);
  });
});
