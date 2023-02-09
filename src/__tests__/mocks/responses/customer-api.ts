import { Customer } from 'bpartners-react-client';

export const customers1: Array<Customer> = [
  {
    id: 'customer1',
    lastName: 'Name 1',
    firstName: 'FirstName 1',
    email: 'Email 1',
    phone: '11 11 11',
    address: '2589 Nelm Street',
  },
  {
    id: 'customer2',
    lastName: 'Name 2',
    firstName: 'FirstName 2',
    email: 'Email 2',
    phone: '22 22 22',
    address: '4836 Pheasant Ridge Road',
  },
  {
    id: 'customer3',
    lastName: 'Name 3',
    firstName: 'FirstName 3',
    email: 'Email 3',
    phone: '33 33 33',
    address: '1321 Pyramid Valley Road',
  },
];

export const customers2: Array<Customer> = [
  ...customers1,
  {
    id: 'customer1',
    lastName: 'LastName 11',
    firstName: 'FirstName 11',
    email: 'Email 1',
    phone: '55 55 55',
    address: 'Wall Street 2',
  },
];

export const customers3: Array<Customer> = [customers2[3], ...customers1.slice(1)];
