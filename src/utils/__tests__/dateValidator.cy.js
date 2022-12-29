import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { invoiceDateValidator } from 'src/operations/invoice/utils';

describe(specTitle('Date validator'), () => {
  it('', () => {
    assert.equal(invoiceDateValidator(''), 'Ce champ est requis');
    assert.equal(invoiceDateValidator('2022-10-10', '2022-10-12'), "La date d'envoie doit précéder celle du payement");
    assert.equal(new Date().getFullYear() + 1, 2023);
    assert.equal(invoiceDateValidator(`${new Date().getFullYear() + 1}-01-01`), "La date d'envoie doit précéder celle d'aujourd'hui");
    assert.equal(invoiceDateValidator('2022-10-10', '2022-10-09'), true);
  });
});
