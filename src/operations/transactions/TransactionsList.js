import { List } from '@react-admin/ra-rbac';
import { Datagrid, TextField } from 'react-admin';
import PrevNextPagination from '../utils/PrevNextPagination';

const TransactionsList = () => (
  <List bulkActionButtons={false} pagination={<PrevNextPagination />} resource="transactions">
    <Datagrid rowClick="show">
      <TextField source='amount' label='Amount' />
      <TextField source='title' label='Title' />
      <TextField source='paymentReqId' label='Id' />
      <TextField source='updateDateTime' label='Last Modification' />
    </Datagrid>
  </List>
);
export default TransactionsList;
