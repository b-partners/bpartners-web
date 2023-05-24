import { Product } from 'bpartners-react-client';
import { objectMapper } from './objectMapper';
import { toMajors, toMinors } from 'src/common/utils/money';

export const productMapper = {
  toDomain(product: Product) {
    return objectMapper(product, ['totalPriceWithVat', 'unitPriceWithVat', 'unitPrice', 'totalVat', 'vatPercent'], toMajors);
  },
  toRest(product: Product) {
    return objectMapper(product, ['totalPriceWithVat', 'unitPriceWithVat', 'unitPrice', 'totalVat', 'vatPercent'], toMinors);
  },
};
