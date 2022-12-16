import WorkIcon from '@mui/icons-material/Work';
import TransactionShow from './TransactionShow';
import TransactionList from './TransactionList';

const transactions = {
  list: TransactionList,
  show: TransactionShow,
  icon: WorkIcon,
  options: { label: 'Transactions' },
};

export default transactions;
