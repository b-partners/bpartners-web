import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '../App';

import authProvider from '../providers/auth-provider';
import { whoami1, token1, user1, user2 } from './mocks/responses/security-api';
import { accounts1, accountHolders1, businessActivities } from './mocks/responses/account-api';
import { images1 } from './mocks/responses/file-api';

describe(specTitle('Account'), () => {
  beforeEach(() => {
    cy.viewport(1360, 760);
    cy.intercept('POST', '/token', token1);
    cy.intercept('GET', '/whoami', whoami1).as('whoami');

    cy.then(
      async () =>
        await authProvider.login('dummy', 'dummy', {
          redirectionStatusUrls: {
            successurl: 'dummy',
            FailureUrl: 'dummy',
          },
        })
    );

    cy.intercept('GET', `/users/${whoami1.user.id}`, user1).as('getUser1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/files/*/raw?accessToken=accessToken1&fileType=LOGO`, images1).as('fetchLogo');
  });

  it('is displayed on login', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/files/*/raw?accessToken=accessToken1&fileType=LOGO`, images1).as('fetchLogo');

    mount(<App />);

    cy.wait('@getUser1');
    cy.get('[name="account"]').click();

    cy.wait('@getAccount1');
    cy.wait('@getAccountHolder1');

    cy.contains('First Name 1');
    cy.contains('last Name 1');
    cy.contains('11 11 11');

    cy.contains('Ma société');
    cy.contains('Numer');
    cy.contains('activité officielle');
    cy.contains('1000.00 €');
    cy.contains('Ivandry');
    cy.contains('Madagascar');
    cy.contains('6 rue Paul Langevin');
    cy.contains('101');

    cy.get('.MuiTabs-flexContainer > [tabindex="-1"]').click(); // MON ABONNEMENT
    cy.contains('Mon abonnement');
    cy.contains(`L'essentiel`);
    cy.contains(`0€ de coût fixe par mois`);
  });

  it('Change business Activity', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw?fileType=LOGO`, images1).as('logoUpload');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');

    mount(<App />);

    cy.wait('@getUser1');
    cy.wait('@getAccountHolder1');

    cy.get('[name="account"]').click();

    cy.get('[aria-labelledby="simple-tab-0"] > .MuiBox-root > .MuiIconButton-root').click();
    cy.contains('Édition de mon compte');
    cy.contains('Activité');
    cy.contains('Information sur la société');

    // close company edition
    cy.get('#panel2a-header > .MuiAccordionSummary-expandIconWrapper > [data-testid="ExpandMoreIcon"]').click();

    cy.get(
      '.css-1nghgb-MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root > .MuiAutocomplete-endAdornment > .MuiAutocomplete-popupIndicator > [data-testid="ArrowDropDownIcon"]'
    ).click();
    cy.contains('Armurier').click();

    cy.get(
      '.css-1hgr5aa-MuiAutocomplete-root > .MuiFormControl-root > .MuiInputBase-root > .MuiAutocomplete-endAdornment > .MuiAutocomplete-popupIndicator > [data-testid="ArrowDropDownIcon"]'
    ).click();
    cy.contains('Barbier').click();

    const newAccountHolder = { ...accountHolders1[0] };
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders/${accountHolders1[0].id}/businessActivities`, req => {
      const newBusinessActivity = { primary: 'Armurier', secondary: 'Barbier' };
      expect(req.body).to.deep.eq(newBusinessActivity);
      newAccountHolder.businessActivities = newBusinessActivity;
      req.reply(newAccountHolder);
    });

    cy.get('.css-1vtm9ti > .MuiButton-root').click();

    cy.get('[data-testid="ClearIcon"]').click();
  });

  it('change company information', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders/${accountHolders1[0].id}/companyInfo`, req => {
      const response = { ...accountHolders1[0] };
      response.companyInfo.isSubjectToVat = req.body.isSubjectToVat;
      req.reply({ body: response });
    });

    mount(<App />);

    cy.wait('@getUser1');
    cy.get('[name="account"]').click();
    // because the current accountholder's isSubjectToVat is false,
    // the isSubjectToVat switch button shouldn't be activate
    cy.contains('Non');

    cy.get('.PrivateSwitchBase-input').click();
    //now the isSubjectToVat is true
    cy.contains('Oui');

    cy.get('[aria-labelledby="simple-tab-0"] > .MuiBox-root > .MuiIconButton-root').click();
    cy.contains('Édition de mon compte');
    cy.contains('Activité');
    cy.contains('Information sur la société');
    // close business activity edition
    cy.get('#panel1a-header > .MuiAccordionSummary-expandIconWrapper > [data-testid="ExpandMoreIcon"]').click();

    cy.get('form [name="socialCapital"]').clear();
    cy.contains('Ce champ est requis');
    cy.get('form [name="socialCapital"]').type(301);
    cy.get('form [name="phone"]').clear().type('+261 not valid phone number');
    cy.contains('Le numéro de téléphone ne doit contenir que des chiffres est un signe +');
    cy.get('form [name="phone"]').clear().type('656565');
    cy.contains('Format de numéro incorrecte, format correcte: "+[code pays][numéro]"');
    cy.get('form [name="phone"]').clear().type('+261340465338');
    cy.get('form [name="email"]').clear();
    cy.contains('Ce champ est requis');
    cy.get('form [name="email"]').type('joe.doe@bpartnes.app');

    const newCompanyInformation = {
      ...accountHolders1[0].companyInfo,
      isSubjectToVat: false,
      phone: '+261340465338',
      email: 'joe.doe@bpartnes.app',
      socialCapital: 30100,
    };
    const newAccountHolder = { ...accountHolders1[0] };
    newAccountHolder.companyInfo = newCompanyInformation;

    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders/${accountHolders1[0].id}/companyInfo`, req => {
      expect(req.body.phone).to.deep.eq(newCompanyInformation.phone);
      expect(req.body.email).to.deep.eq(newCompanyInformation.email);
      expect(+req.body.socialCapital).to.deep.eq(newCompanyInformation.socialCapital);
      req.reply({ body: newAccountHolder });
    }).as('editCompanyInfo');

    cy.get('form [name="submitCompanyInfo"]').click();
    cy.get('[data-testid="ClearIcon"]').click();
  });

  it('change revenue targets', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders/${accountHolders1[0].id}/revenueTargets`, req => {
      const newRevenueTargets = [{ year: 2023, amountTarget: 23000000 }];
      expect(req.body[0]).to.deep.eq(newRevenueTargets[0]);
      const response = { ...accountHolders1[0] };
      response.revenueTargets = newRevenueTargets;
      req.reply(response);
    }).as('updateRevenueTargets');

    mount(<App />);

    cy.wait('@getUser1');
    cy.get('[name="account"]').click();
    cy.wait('@getAccount1');
    cy.wait('@getAccountHolder1');

    cy.contains('Recette annuelle à réaliser');
    cy.contains('120000.00 €');

    cy.get('[aria-labelledby="simple-tab-0"] > .MuiBox-root > .MuiIconButton-root').click();

    cy.contains('Recette annuelle à réaliser');
    cy.get('[name="amountTarget"]').clear();
    cy.contains('Ce champ est requis');
    cy.get('[name="amountTarget"]').type(230000);

    cy.get('form [name="submitRevenueTargets"]').click();

    cy.wait('@updateRevenueTargets');

    cy.contains('Changement enregistré');

    cy.get('[data-testid="ClearIcon"]').click();

    cy.contains('Recette annuelle à réaliser');
    cy.contains('230000.00 €');
  });

  it('unverified user warning', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');
    cy.intercept('GET', `/users/${whoami1.user.id}`, user2).as('getUser2');

    mount(<App />);
    cy.wait('@getUser2');

    cy.contains('Avertissement');
    cy.contains(`Votre compte n'est pas encore vérifié. Pour plus d'information veuillez vous adresser au support.`);
    cy.get('#closeWarning').click();

    cy.contains('(Compte non vérifié)');

    cy.get('[name="account"]').click();
  });

  it('upload logo image', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw?fileType=LOGO`, images1).as('logoUpload');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/files/*/raw?accessToken=accessToken1&fileType=LOGO`, images1).as('fetchLogo');

    mount(<App />);

    cy.wait('@getUser1');
    cy.get('[name="account"]').click();

    cy.wait('@getAccount1');
    cy.wait('@getAccountHolder1');

    cy.get('#upload-photo-label').should('be.visible').selectFile('public/favicon64.png', { force: true });

    cy.wait('@logoUpload');
    cy.contains('Téléchargement du logo terminé, les modifications seront propagées dans quelques instants.');
  });
});
