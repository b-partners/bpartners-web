import { Product } from 'bpartners-react-client';
import { objectMapper } from './objectMapper';
import { emptyToNull, toMajors, toMinors } from 'src/common/utils';

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
