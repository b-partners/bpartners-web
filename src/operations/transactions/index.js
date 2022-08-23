import WorkIcon from '@material-ui/icons/Work';
import TransactionShow from './TransactionShow';
import TransactionsList from './TransactionsList';

const Transactions = {
  list: TransactionsList,
  show: TransactionShow,
  icon: WorkIcon,
  options: { label: 'Transactions' },
};

export default Transactions;
