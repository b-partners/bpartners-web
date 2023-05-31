import { Product } from 'bpartners-react-client';

export const createProduct = (n: number) => {
  const _products = [];

  for (let i = 0; i < n; i++) {
    _products.push({
      description: `description ${i}`,
      quantity: 1,
      unitPrice: 1000,
      vatPercent: 2000,
      totalVat: 20000,
      totalPriceWithVat: 1200,
      unitPriceWithVat: 1200,
      id: `product-${i}-id`,
    });
  }
  return _products;
};

export let products: Product[] = createProduct(17);

export const getProducts = (page: number, perPage: number) => products.slice(page * perPage, page * perPage + perPage);
export const setProduct = (product: Product, index?: number) => {
  if (index !== undefined) {
    products[index] = product;
  } else {
    products.push({ ...product, id: `new-product-${products.length}` });
  }
};

export const newProduct1 = [
  {
    description: 'test description',
    quantity: 0,
    unitPrice: 1,
    vatPercent: 1,
    totalVat: 1,
    totalPriceWithVat: 1,
    id: 'product5_id',
  },
];

export const newProduct2 = [newProduct1[0], ...products.slice(1)];
