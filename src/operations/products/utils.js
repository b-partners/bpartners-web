import { toMinors as moneyToMinors } from '../../common/utils/money';
import { toMinors as vatToMinors } from '../../common/utils/vat';

export const transformProduct = record => ({
  ...record,
  quantity: 1,
  unitPrice: moneyToMinors(record.unitPrice),
  vatPercent: vatToMinors(record.vatPercent),
});
