import { Product } from 'src/gen/bpClient/models';

export const products1: Product[] = [
  {
    description: 'description1',
    quantity: 2,
    unitPrice: 1000,
    vatPercent: 2000,
    totalVat: 400,
    totalPriceWithVat: 2400,
    id: 'product1_id',
  },
  {
    description: 'description2',
    quantity: 2,
    unitPrice: 2000,
    vatPercent: 2000,
    totalVat: 2,
    totalPriceWithVat: 15,
    id: 'product2_id',
  },
  {
    description: 'description3',
    quantity: 2,
    unitPrice: 3000,
    vatPercent: 1000,
    totalVat: 3,
    totalPriceWithVat: 15,
    id: 'product3_id',
  },
  {
    description: 'description3',
    quantity: 2,
    unitPrice: 4000,
    vatPercent: 1000,
    totalVat: 4,
    totalPriceWithVat: 15,
    id: 'product4_id',
  },
];

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
