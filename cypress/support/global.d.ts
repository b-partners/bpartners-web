export declare global {
  namespace Cypress {
    interface Chainable {
      name<Subject>(value: string, additionalCommand?: string): Chainable<Subject>;
      dataCy<Subject>(value: string, additionalCommand?: string): Chainable<Subject>;
      getByDataCy<Subject>(testid: string): Chainable<Subject>;
      getByTestId<Subject>(testid: string): Chainable<Subject>;
      getByName<Subject>(name: string): Chainable<Subject>;
      e2eLogin(): void;
      cognitoLogin(): void;
      realCognitoLogin(): void;
      removeApiDummyUser(): void;
      skipBankSynchronisation(): void;
    }
  }
}
