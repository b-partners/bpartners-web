import { List } from '@react-admin/ra-rbac';
import { Datagrid, TextField, FunctionField } from 'react-admin';
import PrevNextPagination from '../utils/PrevNextPagination';
import { Currency, prettyPrintMoney } from '../utils/money';

const TransactionsList = () => (
  <List bulkActionButtons={false} pagination={<PrevNextPagination />} resource="transactions">
    <Datagrid rowClick="show">
      <FunctionField source='amount' render={record => prettyPrintMoney(record.amount, Currency.EUR)} label='Amount' />
      <TextField source='title' label='Title' />
      <TextField source='paymentReqId' label='Id' />
      <FunctionField source='updateDateTime' render={record => new Date(record.updateDateTime).toLocaleDateString()} label='Last Modification' />
    </Datagrid>
  </List>
);
export default TransactionsList;
