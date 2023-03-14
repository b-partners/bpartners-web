import specTitle from 'cypress-sonarqube-reporter/specTitle';
import { invoiceDateValidator } from 'src/operations/invoice/utils/utils';

describe(specTitle('Date validator'), () => {
  it('', () => {
    assert.equal(invoiceDateValidator({}), 'Ce champ est requis');
    assert.equal(
      invoiceDateValidator({ sendingDate: '2022-10-12', validityDate: '2022-10-10' }),
      "La date limite de validité doit être ultérieure ou égale à la date d'émission"
    );
    assert.equal(invoiceDateValidator({ sendingDate: '2022-10-05', validityDate: '2022-10-09' }), true);
    assert.equal(
      invoiceDateValidator({ sendingDate: `${new Date().getFullYear() + 1}-01-01` }),
      "La date d'émission doit être antérieure ou égale à la date d’aujourd’hui"
    );
  });
});
