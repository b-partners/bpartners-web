import { Customer } from 'bpartners-react-client';

export const createCustomer = (n: number) => {
  const customers = [];
  for (let i = 0; i < n; i++) {
    customers.push({
      id: `customer-${i}-id`,
      customerType: 'INDIVIDUAL',
      lastName: `lastName-${i}`,
      firstName: `firstName-${i}`,
      email: `email.${i}@gmail.com`,
      phone: '11 11 11',
      address: '2589 Nelm Street',
      comment: 'comment customer 1',
    });
  }
  return customers;
};

export const customers1: Array<Customer> = createCustomer(35);

export const getCustomers = (page: number, perPage: number) => customers1.slice(page * perPage, page * perPage + perPage);
export const setCustomer = (index: number, customer: Customer) => (customers1[index] = customer);

export const customers2: Array<Customer> = [
  {
    id: 'customer1',
    lastName: 'LastName 11',
    firstName: 'FirstName 11',
    email: 'Email 1',
    phone: '55 55 55',
    address: 'Wall Street 2',
    comment: 'comment 01',
  },
  ...customers1,
];

export const customers3: Array<Customer> = [customers2[3], ...customers1.slice(1)];
export const exportAllCustomers: string = `ID,Description,Prix unitaire (€),Prix unitaire avec TVA (€),TVA (%),Créé le
62f63371-11cf-43fd-899d-79193b6ebef8,assiette en bois,2200.0,2200.0,0.0,2023-05-18T12:05:55.508393Z
b6799ba5-1126-4599-80c7-6d429eae0cd4,Boite de chocolat,1087.0,1087.0,0.0,2023-05-19T08:14:58.962500Z
7d52c062-b659-443c-b8bb-95e445e2f536,Boulangerie,120.0,120.0,0.0,2023-05-25T06:44:33.043903Z`;
