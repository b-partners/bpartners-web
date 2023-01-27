import WorkIcon from '@mui/icons-material/Work';
import CustomerList from './CustomerList';
import CustomerCreate from './CustomerCreate';
import CustomerEdit from './CustomerEdit';

const customers = {
  list: CustomerList,
  create: CustomerCreate,
  edit: CustomerEdit,
  icon: WorkIcon,
  options: { label: 'Customers' },
};

export { customers };
