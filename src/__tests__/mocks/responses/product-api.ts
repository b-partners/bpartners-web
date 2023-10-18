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
export const exportAllProducts: string = `ID,Description,Prix unitaire (€),Prix unitaire avec TVA (€),TVA (%),Créé le
62f63371-11cf-43fd-899d-79193b6ebef8,assiette en bois,2200.0,2200.0,0.0,2023-05-18T12:05:55.508393Z
b6799ba5-1126-4599-80c7-6d429eae0cd4,Boite de chocolat,1087.0,1087.0,0.0,2023-05-19T08:14:58.962500Z
7d52c062-b659-443c-b8bb-95e445e2f536,Boulangerie,120.0,120.0,0.0,2023-05-25T06:44:33.043903Z`;
