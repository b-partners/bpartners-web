import WorkIcon from '@mui/icons-material/Work';
import CustomerCreate from './CustomerCreate';
import CustomerEdit from './CustomerEdit';
import CustomerList from './CustomerList';

const customers = {
  list: CustomerList,
  create: CustomerCreate,
  edit: CustomerEdit,
  icon: WorkIcon,
  options: { label: 'Customers' },
};

export { customers };
