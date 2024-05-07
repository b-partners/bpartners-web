import { InvoiceStatus } from '@bpartners/typescript-client';
import { mount } from '@cypress/react';
import specTitle from 'cypress-sonarqube-reporter/specTitle';
import App from 'src/App';
import Annotator from 'src/operations/annotator/Annotator';
import annotator_img from '../assets/Rennes_Solar_Panel_Batch_1_519355_363821.jpg';
import * as Redirect from '../common/utils';
import { accountHolders1, accounts1 } from './mocks/responses/account-api';
import { getInvoices } from './mocks/responses/invoices-api';
import { prospects } from './mocks/responses/prospects-api';
import { whoami1 } from './mocks/responses/security-api';

describe(specTitle("tester le fonctionnement de l'annotator"), () => {
  beforeEach(() => {
    cy.cognitoLogin();

    cy.intercept('GET', `/users/${whoami1.user.id}/accounts`, accounts1).as('getAccount1');
    const carreleurs = [{ ...accountHolders1[0], businessActivities: { primary: 'Couvreur' } }];
    cy.intercept('GET', `/users/${whoami1.user.id}/accounts/${accounts1[0].id}/accountHolders`, carreleurs).as('getAccountHolder1');
    cy.intercept('GET', `/accounts/${accounts1[0].id}/invoices**`, req => {
      const { pageSize, statusList, page } = req.query;
      req.reply(
        getInvoices(
          page - 1,
          pageSize,
          statusList.split(',').map(status => InvoiceStatus[status])
        )
      );
    });

    cy.stub(Redirect, 'redirect').as('redirect');
  });

  it('When a roofer creates a lead, he is redirected to the /annotator page after generating the image URL', () => {
    cy.intercept('GET', `/accountHolders/${accountHolders1[0].id}/prospects`, prospects).as('getProspects');
    mount(<App />);
    cy.wait('@getUser1');
    cy.get('[name="prospects"]').click();
    cy.wait('@getProspects');

    cy.get('.css-69i1ev > .MuiButtonBase-root').click();
    cy.get('[data-testid="address-field-input"] > .MuiInputBase-root').type('Evry');
    cy.contains('Créer').click();
    mount(<Annotator />);
  });

  // it('The roofer can annotate an image, fill out the form(s), and submit to generate a quote', ()=>{
  //    mount(<App/>);
  // })
  /* it 'Lorsque le couvreur veut crée un prospect, on le redirige vers la page /annotator' suite à 
    l'exécution des deux requete necessaire pour générer l'url d'image qu'on stock dans l'url param' */

  /* it 'Le couvreur peut annoter une image, remplir le ou les forms, et submit pour générer un devis'
   * vérifier que l'image est afficher
   * Faire un polygon, le formulaire à droite s'affiche
   * Remplir le form, et submit
   */
});
