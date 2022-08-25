import WorkIcon from '@material-ui/icons/Work';
import TransactionShow from './TransactionShow';
import TransactionList from './TransactionList';

const Transactions = {
  list: TransactionList,
  show: TransactionShow,
  icon: WorkIcon,
  options: { label: 'Transactions' },
};

export default Transactions;
