import { Datagrid, List, TextField, useListContext } from 'react-admin';
import BPListActions from '../../common/components/BPListActions';
import { EmptyList } from '../../common/components/EmptyList';
import ListComponent from '../../common/components/ListComponent';
import Pagination, { pageSize } from '../../common/components/Pagination';

const CustomerList = props => (
  <List
    {...props}
    perPage={pageSize}
    actions={<BPListActions />}
    resource='customers'
    hasCreate={true}
    hasEdit={false}
    hasList={false}
    hasShow={false}
    component={ListComponent}
    pagination={<Pagination />}
  >
    <CustomerGrid />
  </List>
);

const CustomerGrid = () => {
  const { isLoading } = useListContext();

  if (isLoading) return null;

  return (
    <Datagrid bulkActionButtons={false} rowClick='edit' empty={<EmptyList />}>
      <TextField source='name' label='Nom' />
      <TextField source='email' label='Email' />
      <TextField source='address' label='Adresse' />
      <TextField source='phone' label='Téléphone' />
    </Datagrid>
  );
};

export default CustomerList;
