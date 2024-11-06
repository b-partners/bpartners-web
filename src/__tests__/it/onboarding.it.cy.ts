import { userAccountsApi } from '@/providers';
import axios from 'axios';

describe('Onboarding', () => {
  it('Create user from dashboard ui', () => {
    cy.visit('https://dashboard.preprod.bpartners.app');

    cy.contains('Bienvenue !');
    cy.contains("L'assistant intelligent qui accélère la croissance des artisans et indépendants.");

    cy.contains("Pas de compte ? C'est par ici").click();

    cy.contains('Inscription');

    cy.name('lastName').type('{enter}');
    cy.contains('Ce champ est requis');

    cy.intercept('POST', '/onboarding').as('onboarding');

    cy.name('lastName').type('Doe');
    cy.name('firstName').type('John');
    cy.name('email').type(process.env.REACT_APP_IT_ONBOARD_USERNAME);
    cy.name('phoneNumber').type('3773295672');
    cy.name('companyName').type('BpartnersTest{enter}');

    cy.wait('@onboarding');
    cy.contains('Fermer').click();
  });

  it('Get credentials from mail', () => {
    cy.visit('mail.hei.school/');

    cy.name('_user').type(process.env.REACT_APP_IT_ONBOARD_USERNAME);
    cy.name('_pass').type(process.env.REACT_APP_IT_ONBOARD_PASSWORD_1 + '{enter}');

    let clickCount = 0;

    const clickUntilSuccess = () => {
      cy.get('#rcmbtn111').click();
      cy.contains('Sent').click();
      cy.contains('Inbox')
        .click()
        .then(() => {
          clickCount += 1;
          if (clickCount > 1) {
            cy.wait(10000);
          }

          cy.get('#messagelist-content tbody ').then(tbody => {
            const lastReceivedMail = tbody.find('tr:first-child .subject .rcmContactAddress').text();
            if (tbody.children().length === 0 || lastReceivedMail !== 'bpartners.artisans@gmail.com') {
              clickUntilSuccess();
            } else {
              cy.get('#messagelist-content tbody tr:first-child').click();
            }
          });
        });
    };

    clickUntilSuccess();

    cy.get('#messagecontframe')
      .its('0.contentDocument.body')
      .find('[class="rcmBody"] > ul > li:last-child > strong')
      .then(res => {
        cy.exec(`touch cognito_password.txt && echo "${res.html()}" > cognito_password.txt`);
      });

    cy.get('#rcmbtn123').click();
  });

  it('First Login', () => {
    cy.visit('https://dashboard.preprod.bpartners.app');

    cy.name('username').type(process.env.REACT_APP_IT_ONBOARD_USERNAME);

    cy.exec(`cat cognito_password.txt`).then(({ stdout }) => {
      cy.name('password').type(stdout + '{enter}');
    });

    cy.contains('Première connexion ?');

    cy.name('phoneNumber').type(process.env.REACT_APP_IT_ONBOARD_PHONE_NUMBER);
    cy.name('newPassword').type(process.env.REACT_APP_IT_PASSWORD);
    cy.name('confirmedPassword').type(process.env.REACT_APP_IT_PASSWORD + '{enter}');
  });

  it('Should remove the created user', async () => {
    cy.exec('rm cognito_password.txt');
    await axios.delete('https://api.preprod.bpartners.app/dummy-user');
  });
});
