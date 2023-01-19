import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { invoiceDateValidator } from 'src/operations/invoice/utils';

describe(specTitle('Date validator'), () => {
  it('', () => {
    assert.equal(invoiceDateValidator({}), 'Ce champ est requis');
    assert.equal(invoiceDateValidator({ sendingDate: '2022-10-12', toPayAt: '2022-10-10' }), "La date d'envoie doit précéder celle du paiement");
    assert.equal(invoiceDateValidator({ sendingDate: '2022-10-05', toPayAt: '2022-10-09' }), true);
    assert.equal(invoiceDateValidator({ sendingDate: `${new Date().getFullYear() + 1}-01-01` }), "La date d'envoie doit précéder celle d'aujourd'hui");
  });
});