import { MockCognitoLoginOptions } from './commands';

export declare global {
  namespace Cypress {
    interface Chainable {
      name<Subject>(value: string, additionalCommand?: string): Chainable<Subject>;
      dataCy<Subject>(value: string, additionalCommand?: string): Chainable<Subject>;
      getByDataCy<Subject>(value: string): Chainable<Subject>;
      getByTestId<Subject>(value: string): Chainable<Subject>;
      getByAriaLabel<Subject>(value: string): Chainable<Subject>;
      getByAttribute<Subject>(attribute: string, value: string): Chainable<Subject>;
      getByName<Subject>(name: string): Chainable<Subject>;
      e2eLogin(): void;
      cognitoLogin(options?: MockCognitoLoginOptions): void;
      realCognitoLogin(): void;
      removeApiDummyUser(): void;
      waitAuthRequestNeeded(): void;
      assertWithinMs(limitMs: number, check: () => Cypress.Chainable): Chainable;
      measure(step: string, check: () => Cypress.Chainable, limitMs?: number): Chainable;
    }
  }
}
