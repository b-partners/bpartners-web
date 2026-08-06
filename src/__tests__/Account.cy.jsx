import specTitle from 'cypress-sonarqube-reporter/specTitle';

import App from '@/App';
import { getCached } from '@/providers';
import { account1, accountHolder1, accountHolders1, accountHoldersFeedbackLink, accounts1, businessActivities } from './mocks/responses/account-api';
import { images1 } from './mocks/responses/file-api';
import { whoami1 } from './mocks/responses/security-api';
import { subscriptionPlans } from './mocks/responses/subscription-plans-api';

describe(specTitle('Account'), () => {
  beforeEach(() => {
    cy.cognitoLogin();
    cy.stub(getCached, 'account').returns(account1);
    cy.stub(navigator.clipboard, 'writeText').as('copyToClipboard');
  });

  //OK
  it('is block user card', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw?fileType=LOGO`, images1).as('logoUpload');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/files/*/raw?accessToken=accessToken1&fileType=LOGO`, images1).as('fetchLogo');

    cy.mount(<App />);

    cy.get('[name="account"]').click();

    cy.wait('@getAccountHolder1');

    //For logo
    cy.get('#upload-photo-label').should('be.visible').selectFile('public/favicon64.webp', { force: true });
    cy.wait('@logoUpload');
    cy.contains('Téléchargement du logo terminé, les modifications seront propagées dans quelques instants.');

    //Informations
    cy.contains('last Name 1');
    cy.contains('numer@madagascar.com');
    cy.contains('11 11 11');
  });

  //OK
  it('Check info edit mode', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders/${accountHolders1[0].id}/globalInfo`, req => {
      const newGlobalInfo = {
        id: accountHolders1[0].id,
        name: 'Numer_01',
        siren: '1001',
        officialActivityName: 'Activité_officielle',
        contactAddress: {
          address: '40 Rue de la liberté',
          city: 'Paris',
          country: 'France',
        },
      };
      expect(req.body.name).to.deep.eq(newGlobalInfo.name);
      expect(req.body.siren).to.deep.eq(newGlobalInfo.siren);
      expect(req.body.officialActivityName).to.deep.eq(newGlobalInfo.officialActivityName);
      expect(req.body.contactAddress.address).to.deep.eq(newGlobalInfo.contactAddress.address);
      expect(req.body.contactAddress.city).to.deep.eq(newGlobalInfo.contactAddress.city);
      expect(req.body.contactAddress.country).to.deep.eq(newGlobalInfo.contactAddress.country);
      req.reply(accountHolders1[0]);
    }).as('updateAccountHolder');
    const newAccountHolder = { ...accountHolders1[0] };
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders/${accountHolders1[0].id}/businessActivities`, req => {
      const newBusinessActivity = { primary: 'Barbier', secondary: 'Barbier' };
      expect(req.body).to.deep.eq(newBusinessActivity);
      newAccountHolder.businessActivities = newBusinessActivity;
      req.reply(newAccountHolder);
    });
    cy.intercept('PUT', `/users/${whoami1.user.id}/accountHolders/${accountHolder1.id}/feedback/configuration`, req => {
      expect(req.body).eql({ feedbackLink: validLink });
      req.reply(accountHoldersFeedbackLink);
    }).as('configuration');
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders/${accountHolders1[0].id}/companyInfo`, req => {
      const response = { ...accountHolders1[0] };
      response.companyInfo.isSubjectToVat = req.body.isSubjectToVat;
      req.reply({ body: response });
    });

    cy.mount(<App />);
    cy.get('[name="account"]').click();
    cy.wait('@getAccountHolder1');

    cy.contains('Ma société');

    cy.dataCy('edit-mode-button').click();

    cy.dataCy('profile-field-container', '.MuiTypography-root').should('not.exist');

    //Field Address
    cy.name('contactAddress.address').clear();
    cy.contains('Ce champ est requis.');
    cy.contains('Adresse');
    cy.name('contactAddress.address').type('40 Rue de la liberté');

    // Field name
    cy.name('name').clear();
    cy.contains('Ce champ est requis.');
    cy.contains('Raison sociale');
    cy.name('name').type('Numer_01');

    //Field city
    cy.name('contactAddress.city').clear();
    cy.contains('Ce champ est requis.');
    cy.contains('Ville');
    cy.name('contactAddress.city').type('Paris');

    //Field social capital
    cy.name('companyInfo.socialCapital').clear();
    cy.contains('Capital social');
    cy.name('companyInfo.socialCapital').type('100000');

    //Field official activity name
    cy.name('officialActivityName').clear();
    cy.contains('Ce champ est requis.');
    cy.contains('Activité officielle');
    cy.name('officialActivityName').type('Activité_officielle');

    //Field siren
    cy.name('siren').clear();
    cy.contains('SIREN');
    cy.name('siren').type('1001');

    //Field web site
    cy.name('companyInfo.website').clear().type('www.example.com');
    cy.contains('Site web');

    //Field country
    cy.name('contactAddress.country').clear();
    cy.contains('Ce champ est requis.');
    cy.contains('Pays');
    cy.name('contactAddress.country').type('France');

    //Field feddback link
    cy.name('feedback.feedbackLink').clear().type('https://birdia.fr');
    cy.contains('Lien du feedback');

    //Field phone
    cy.name('companyInfo.phone').clear();
    cy.contains('Ce champ est requis.');
    cy.contains('Téléphone');
    cy.name('companyInfo.phone').type('+261345656756');

    //Field email
    cy.name('companyInfo.email').clear();
    cy.contains('Ce champ est requis.');
    cy.contains('Email');
    cy.name('companyInfo.email').type('info@birdia.fr');

    //Field primary activity
    cy.dataCy('primary-activity-select').click();
    cy.get('[role="option"]').contains('Barbier').click();
    cy.contains('Activité principale');

    //Field secondary activity
    cy.dataCy('secondary-activity-select').click();
    cy.get('[role="option"]').contains('Barbier').click();
    cy.contains('Activité secondaire');

    //Interception de la requête
    cy.intercept('PUT', `/users/${whoami1.user.id}/accountHolders/${accountHolder1.id}/feedback/configuration`, ({ body, reply }) => {
      expect(body).deep.equal({ feedbackLink: 'https://birdia.fr' });
      reply({ body: { feedbackLink: 'https://birdia.fr' } });
    });
    cy.dataCy('save-profile').click();
  });

  //OK
  it('Toggle subject to VAT switch', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders/${accountHolders1[0].id}/businessActivities`, req =>
      req.reply(accountHolders1[0])
    );
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders/${accountHolders1[0].id}/globalInfo`, req =>
      req.reply(accountHolders1[0])
    );
    cy.intercept('PUT', `/users/${whoami1.user.id}/accountHolders/${accountHolder1.id}/feedback/configuration`, req => req.reply(accountHoldersFeedbackLink));
    cy.intercept('PUT', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders/${accountHolders1[0].id}/companyInfo`, req => {
      expect(req.body.isSubjectToVat).to.eq(false);
      const response = { ...accountHolders1[0] };
      response.companyInfo.isSubjectToVat = req.body.isSubjectToVat;
      req.reply({ body: response });
    }).as('updateCompanyInfo');

    cy.mount(<App />);
    cy.get('[name="account"]').click();
    cy.wait('@getAccountHolder1');

    cy.contains('Micro-entreprise exonérée de TVA');
    cy.contains('Oui');

    cy.dataCy('edit-mode-button').click();

    cy.dataCy('companyInfo-subjectToVatSwitch').find('input[type="checkbox"]').should('be.checked');
    cy.dataCy('companyInfo-subjectToVatSwitch').click();
    cy.dataCy('companyInfo-subjectToVatSwitch').find('input[type="checkbox"]').should('not.be.checked');

    //Make the form valid before saving
    cy.name('contactAddress.postalCode').clear().type('75001');
    cy.name('companyInfo.phone').clear().type('+261345656756');
    cy.name('feedback.feedbackLink').clear().type('https://birdia.fr');

    cy.dataCy('save-profile').click();
    cy.wait('@updateCompanyInfo');
  });

  //OK
  it('Check full typography', () => {
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');

    cy.mount(<App />);

    cy.get('[name="account"]').click();

    cy.wait('@getAccountHolder1');

    cy.contains('Adresse');
    cy.contains('6 rue Paul Langevin');
    cy.contains('Ville');
    cy.contains('Ivandry');
    cy.contains('Code postal');
    cy.contains('101');
    cy.contains('Pays');
    cy.contains('Madagascar');
    cy.contains('Activité secondaire');
    cy.contains('activité secondaire');
    cy.contains('Capital social');
    cy.contains('1000,00 €');
    cy.contains('SIREN');
    cy.contains('Siren');
    cy.contains('Lien du feedback');
    cy.contains('Raison sociale');
    cy.contains('Numer');
    cy.contains('Activité officielle');
    cy.contains('Activité officielle');
    cy.contains('Site web');
    cy.contains('https://bpartners.app');
    cy.contains('Activité principale');
    cy.contains('Activité principale');
  });

  //OK
  it('Check full typography for Subscription', () => {
    const subscribedUser = { ...whoami1.user, subscription: { status: 'ACTIVE', plan: { name: 'Abonnement BIRDIA', billingType: 'COMMITMENT' } } };

    cy.intercept('GET', `/users/${whoami1.user.id}`, subscribedUser);
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');

    cy.mount(<App />);

    cy.get('[name="account"]').click();

    cy.wait('@getAccountHolder1');

    cy.contains('Mon abonnement');
    cy.contains('Abonnement BIRDIA');
    cy.contains('49 €');
    cy.contains(
      'Activez notre intelligence artificielle dédiée à l’analyse de toitures : mesure automatique, détection des matériaux (ardoise, tuile, zinc…), estimation des pentes, identification des dégâts et des réparations. Suivi facilité pour vos clients, 20 diagnostics inclus.'
    );
    cy.contains('Installer notre outil sur votre site internet et offrez à vos prospects la possibilité d’évaluer en toute autonomie leurs toitures.');
    cy.contains('Intégrez la communauté des couvreurs BIRDIA et recevez des chantiers autour de chez vous.');
  });

  it('Subscription card ACTIVE with plan shows plan details', () => {
    const subscribedUser = {
      ...whoami1.user,
      subscription: {
        status: 'ACTIVE',
        plan: {
          name: 'Pro',
          description: 'Pour les PME en croissance.',
          billingType: 'COMMITMENT',
          priceInCentsWithoutVat: 9900,
          features: ['Analyse IA toiture complète', 'Export PDF + emprise GeoJSON'],
        },
      },
    };

    cy.intercept('GET', `/users/${whoami1.user.id}`, subscribedUser);
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');

    cy.mount(<App />);
    cy.get('[name="account"]').click();
    cy.wait('@getAccountHolder1');

    cy.get('.subscription-plan-name').should('contain', 'Pro');
    cy.contains('Pour les PME en croissance.');
    cy.contains('99 €');
    cy.contains('HT · engagement annuel 12 mois');
    cy.contains('Analyse IA toiture complète');
    cy.contains('Export PDF + emprise GeoJSON');
    cy.contains('Validation de votre abonnement en cours').should('not.exist');
    cy.contains('Vous n’avez pas d’abonnement actif.').should('not.exist');
  });

  it('Subscription card ACTIVE without plan shows validating loader then plan after polling', () => {
    const noPlanUser = { ...whoami1.user, subscription: { status: 'ACTIVE' } };
    const withPlanUser = {
      ...whoami1.user,
      subscription: { status: 'ACTIVE', plan: { name: 'Pro', billingType: 'COMMITMENT', priceInCentsWithoutVat: 9900, features: ['Analyse IA toiture complète'] } },
    };

    cy.intercept('GET', `/users/${whoami1.user.id}`, noPlanUser).as('getUserNoPlan');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');

    cy.mount(<App />);
    cy.get('[name="account"]').click();
    cy.wait('@getAccountHolder1');

    cy.contains('Validation de votre abonnement en cours');

    cy.intercept('GET', `/users/${whoami1.user.id}`, withPlanUser).as('getUserWithPlan');

    cy.get('.subscription-plan-name', { timeout: 10000 }).should('contain', 'Pro');
    cy.contains('Validation de votre abonnement en cours').should('not.exist');
  });

  it('Subscription card CANCELLED shows resiliation notice and opens plan modal', () => {
    const end = new Date();
    end.setDate(end.getDate() + 29);
    const cancelledUser = { ...whoami1.user, subscription: { status: 'CANCELLED', start: new Date(), end } };

    cy.intercept('GET', `/users/${whoami1.user.id}`, cancelledUser);
    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');

    cy.mount(<App />);
    cy.get('[name="account"]').click();
    cy.wait('@getAccountHolder1');

    cy.contains('Votre abonnement est résilié.');
    cy.contains('Vous conservez l’accès pendant encore');
    cy.contains('Les analyses supplémentaires seront débitées le');
    cy.contains('Validation de votre abonnement en cours').should('not.exist');

    cy.contains('Choisir un abonnement').click();
    cy.contains("Choisissez l'offre qui vous convient");
  });

  it('Subscription card without active subscription shows empty state and opens plan modal', () => {
    const inactiveUser = { ...whoami1.user, subscription: { status: 'INACTIVE' } };

    cy.intercept('GET', `/users/${whoami1.user.id}`, inactiveUser);
    cy.intercept('GET', '**/subscriptionPlans*', subscriptionPlans).as('getSubscriptionPlans');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, accountHolders1).as('getAccountHolder1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');

    cy.mount(<App />);
    cy.get('[name="account"]').click();
    cy.wait('@getAccountHolder1');

    cy.contains('Vous n’avez pas d’abonnement actif.');
    cy.contains('Choisir un abonnement').click();
    cy.contains("Choisissez l'offre qui vous convient");
  });

  it('Block Trial card INACTIVE', () => {
    const modifiedAccountHolders = [...accountHolders1];
    const nextDate = new Date();

    nextDate.setDate(nextDate.getDay() + 7);
    modifiedAccountHolders[0] = {
      ...modifiedAccountHolders[0],
      user: {
        ...modifiedAccountHolders[0].user,
        subscription: {
          status: 'INACTIVE',
          start: new Date(),
          end: nextDate,
        },
      },
    };

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}`, modifiedAccountHolders[0].user);
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, modifiedAccountHolders).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');

    cy.mount(<App />);

    cy.contains("Votre compte n'est pas encore vérifié. Pour plus d'information veuillez vous adresser au");
    cy.contains('Fermer').click();
    cy.get('[name="account"]').click();

    cy.wait('@getAccountHolder1');

    cy.contains('Pas de période d’essai en cours.');
  });

  it('Block Trial card FREE_TRIAL', () => {
    const trialStart = '2022-01-01';
    const trialEnd = '2022-01-31';
    const modifiedAccountHolders = [...accountHolders1];
    modifiedAccountHolders[0] = {
      ...modifiedAccountHolders[0],
      user: {
        ...modifiedAccountHolders[0].user,
        subscription: {
          status: 'FREE_TRIAL',
          start: trialStart,
          end: trialEnd,
        },
      },
    };

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}`, modifiedAccountHolders[0].user);
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, modifiedAccountHolders).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');

    cy.mount(<App />);

    cy.contains("Votre compte n'est pas encore vérifié. Pour plus d'information veuillez vous adresser au");
    cy.contains('Fermer').click();
    cy.get('[name="account"]').click();

    cy.wait('@getAccountHolder1');

    cy.contains('Période d’essai');
    cy.contains('Vous bénéficiez actuellement d’une période d’essai gratuite.');
    cy.contains(`Début de la période d’essai : ${new Date(trialStart).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}`);
    cy.contains(`Fin de la période d’essai : ${new Date(trialEnd).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}`);
  });

  it('Block Trial card ACTIVE', () => {
    const subscriptionStart = '2022-01-01';
    const modifiedAccountHolders = [...accountHolders1];
    modifiedAccountHolders[0] = {
      ...modifiedAccountHolders[0],
      user: {
        ...modifiedAccountHolders[0].user,
        subscription: {
          status: 'ACTIVE',
          start: subscriptionStart,
          end: '2022-01-31',
        },
      },
    };

    const commitmentEnd = new Date(subscriptionStart);
    commitmentEnd.setUTCFullYear(commitmentEnd.getUTCFullYear() + 1);
    commitmentEnd.setUTCDate(commitmentEnd.getUTCDate() - 1);

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    cy.intercept('GET', `/users/${whoami1.user.id}`, modifiedAccountHolders[0].user);
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, modifiedAccountHolders).as('getAccountHolder1');
    cy.intercept('POST', `/accounts/${accounts1[0].id}/files/*/raw`, images1).as('uploadFile1');
    cy.intercept('GET', `/businessActivities?page=1&pageSize=100`, businessActivities).as('getBusinessActivities');

    cy.mount(<App />);

    cy.contains("Votre compte n'est pas encore vérifié. Pour plus d'information veuillez vous adresser au");
    cy.contains('Fermer').click();
    cy.get('[name="account"]').click();

    cy.wait('@getAccountHolder1');

    cy.contains('Période de votre abonnement');
    cy.contains(`Début de votre abonnement : ${new Date(subscriptionStart).toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}`);
    cy.contains(`Fin de votre abonnement : ${commitmentEnd.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' })}`);
  });
});
