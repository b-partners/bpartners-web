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
      cognitoLogin(): void;
      realCognitoLogin(): void;
      removeApiDummyUser(): void;
      skipBankSynchronisation(): void;
    }
  }
}
