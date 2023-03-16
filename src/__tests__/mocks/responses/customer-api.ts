import { Customer } from 'bpartners-react-client';

export const createCustomer = (n: number) => {
  const customers = [];
  for (let i = 0; i < n; i++) {
    customers.push({
      id: `customer-${i}-id`,
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
