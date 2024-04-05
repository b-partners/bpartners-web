import { Product } from '@bpartners/typescript-client';
import { emptyToNull, toMajors, toMinors } from 'src/common/utils';
import { objectMapper } from './object-mapper';

export const productMapper = {
  toDomain(product: Product) {
    return objectMapper(product, ['totalPriceWithVat', 'unitPriceWithVat', 'unitPrice', 'totalVat', 'vatPercent'], toMajors);
  },
  toRest(_product: Product) {
    const product = objectMapper(
      { ..._product, totalPriceWithVat: undefined, unitPriceWithVat: undefined, totalVat: undefined, quantity: 1 },
      ['unitPrice', 'vatPercent'],
      toMinors
    );
    return emptyToNull(product);
  },
};
