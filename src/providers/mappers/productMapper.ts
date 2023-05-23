import { Product } from 'bpartners-react-client';
import { toMajors, toMinors } from 'src/common/utils/money';
import { emptyToNull, transformObjectField } from 'src/common/utils';

export const productMapper = {
  toDomain: (product: Product): Product => {
    return transformObjectField(product, ['unitPrice', 'unitPriceWithVat', 'totalPriceWithVat', 'vatPercent'], toMajors);
  },
  toRest: (_product: Product): Product => {
    const product = emptyToNull(_product);
    product.quantity = 1;
    return transformObjectField(product, ['unitPrice', 'vatPercent'], toMinors);
  },
};
