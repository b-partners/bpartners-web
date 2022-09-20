import { Datagrid, List, TextField } from 'react-admin';
import PrevNextPagination from '../utils/PrevNextPagination';

const CustomerList = props => {
  return (
    <List
      {...props}
      resource='customers'
      hasCreate={true}
      hasEdit={false}
      hasList={false}
      hasShow={false}
      pagination={<PrevNextPagination />}
    >
      <Datagrid bulkActionButtons={false}>
        <TextField source='name' label='Nom' />
        <TextField source='email' label='Email' />
        <TextField source='address' label='Addresse' />
        <TextField source='phone' label='Téléphone' />
      </Datagrid>
    </List>
  );
}

export default CustomerList;
