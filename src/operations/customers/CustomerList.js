import { Datagrid, List, TextField, useListContext } from 'react-admin';
import { EmptyList } from '../utils/EmptyList';
import ListComponent from '../utils/ListComponent';
import Pagination from '../utils/Pagination';

const CustomerList = props => (
  <List {...props} resource='customers' hasCreate={true} hasEdit={false} hasList={false} hasShow={false} component={ListComponent} pagination={<Pagination />}>
    <CustomerGrid />
  </List>
);

const CustomerGrid = () => {
  const { isLoading } = useListContext();

  if (isLoading) return null;

  return (
    <Datagrid bulkActionButtons={false} empty={<EmptyList />}>
      <TextField source='name' label='Nom' />
      <TextField source='email' label='Email' />
      <TextField source='address' label='Adresse' />
      <TextField source='phone' label='Téléphone' />
    </Datagrid>
  );
};

export default CustomerList;
