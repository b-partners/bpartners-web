import WorkIcon from '@material-ui/icons/Work';
import CustomerList from './CustomerList';
import CustomerCreate from './CustomerCreate';

const customers = {
  list: CustomerList,
  create: CustomerCreate,
  icon: WorkIcon,
  options: { label: 'Customers' },
};

export { customers };
