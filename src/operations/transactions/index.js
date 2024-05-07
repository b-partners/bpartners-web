import WorkIcon from '@mui/icons-material/Work';
import TransactionList from './TransactionList';
import TransactionShow from './TransactionShow';

const transactions = {
  list: TransactionList,
  show: TransactionShow,
  icon: WorkIcon,
  options: { label: 'Transactions' },
};

export default transactions;
