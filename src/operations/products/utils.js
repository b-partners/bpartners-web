import { toMinors } from '../../common/utils';

export const transformProduct = record => ({
  ...record,
  quantity: 1,
  unitPrice: toMinors(record.unitPrice),
  vatPercent: toMinors(record.vatPercent),
});
